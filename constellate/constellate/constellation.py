"""Defines a Constellation, the outer-level container of a complete work of content."""
from __future__ import annotations

import json
import hashlib
import base64
from copy import deepcopy
from os import PathLike
from pathlib import Path
from typing import Sequence, Optional, Tuple
from types import ModuleType
import html
import re

from .star import NB_STARS, MarkdownMatplotlib, Star


class Constellation:
    """A collection of Stars that combine to form a complete experience."""

    def __init__(
        self,
        setup_mpl: Sequence[str],
        setup_panel: Sequence[str],
        stars: Sequence[Star],
    ):
        """Creates a Constellation.

        Parameters
        ----------
        setup_mpl : Sequence[str]
            List of setup code sources: these imports and constants are prepended to cells that
            generate static images
        setup_panel : Sequence[str]
            List of setup code sources: these imports and constants are prepended to cells that
            serve a Panel application
        stars : Sequence[Star]
            A list of Stars that comprise the webpage.
        """
        self.setup_mpl = setup_mpl
        self.setup_panel = setup_panel
        self.stars = stars
        self.title = "Constellation"
        self.ids: Sequence[str] = []
        # we want things like images, which are difficult to recompute, tied to something besides a
        # UUID. For now, we use a hash that combines the setup code and the cell code. This is the
        # only code that can impact any one Star, so if we change other Stars there's no need to
        # redo the whole thing.

        # Size of digest in base 64. 8 base64-encoded characters gives a collision would be expected
        # in sqrt(64 ^ 8) = 64 ^ 4 = 2 ^ 24 = 16,777,216 distinct encodes. I'll take those odds.
        HASH_SIZE = 8
        for star in self.stars:
            hasher = hashlib.sha1(
                "".join([*self.setup_mpl, *self.setup_panel]).encode()
            )
            # update with the value of non-markdown non-uuid, which is mainly source code
            for v in star.serialize().items():
                hasher.update(str(v).encode())
            self.ids.append(
                # urlsafe_b64encode can still start links with a hyphen, which
                # breaks the site. Replace the output using double characters:
                # we don't expect this to be reversible or unique anyway, so
                # this is fine
                base64.b64encode(hasher.digest())
                .decode()[:HASH_SIZE]
                .replace("+", "pl")
                .replace("/", "sl")
            )

        self._generate_outline()

    def _generate_outline(self):
        """Generates an outline by parsing Markdown headers.

        The title is considered to be an h1 in the first markdown cell. Future h2s define sections,
        and h3s define subsections. Anything past that is ignored. Every Constellation thus has a
        title, and every Star has a unique breadcrumb

        ```
        section → subsection → page number
        ```

        where the second and third parts may not exist for headers and subheaders.

        """
        h1_re = r"# (.+)"
        h2_re = r"## (.+)"
        h3_re = r"### (.+)"

        def match_heading(md: str) -> Tuple[int, str]:
            for i, pat in enumerate([h1_re, h2_re, h3_re]):
                match = re.match(pat, md)
                if match:
                    return (i + 1, match.group(1))
            return (4, "")

        self.outline = [match_heading(star.md) for star in self.stars]
        self.title = match_heading(self.stars[0].md)[1]

        self.breadcrumbs = []
        # make breadcrumbs
        for i, (level, name) in enumerate(self.outline):
            curr_level = level
            for j in range(0, i)[::-1]:
                if self.outline[j][0] < curr_level:
                    # jump up in hierarchy: this is a parent of us
                    self.breadcrumbs.append((*self.breadcrumbs[j], j))
                    break

            if len(self.breadcrumbs) < i + 1:
                # no addition was made, add default
                self.breadcrumbs.append(())

    def _run_matplotlib(
        self,
        star: MarkdownMatplotlib,
        star_id: str,
        save_folder: PathLike,
        global_state: dict,
        global_mods: dict,
    ):
        """Generates images from a Matplotlib cell and saves those to a folder.

        It will generally save as a PNG: the names of the output files should not be relied upon.

        **WARNING**: This runs arbitrary Python code. Do not run Constellations you cannot vouch for.

        Parameters
        ----------
        star : MarkdownMatplotlib
            The star to generate images for. The cell should modify the current figure in
        Matplotlib. Saving multiple figures is not supported at this time. The output of the cell
        does not affect what this function outputs, only the current figure.
        star_id : str
            The identifier used to generate the file name.
        save_location : PathLike
            The location to save the results.
        global_state: dict
            The global state that can be re-copied.
        global_mods: dict
            The global state (like module definitions) that cannot be copied and is not changed.
        """
        # run this twice, for two different themes
        SET_LIGHT = """
plt.style.use(['rho', 'rho-light'])
c1, c2, c3, c4, c5, c6, *cs = plt.rcParams['axes.prop_cycle'].by_key()['color']
        """
        SET_DARK = """
plt.style.use(['rho', 'rho-dark'])
c1, c2, c3, c4, c5, c6, *cs = plt.rcParams['axes.prop_cycle'].by_key()['color']
        """
        print(star.code)
        for color_mode, setup in zip(("light", "dark"), (SET_LIGHT, SET_DARK)):
            scope = deepcopy(global_state)
            scope.update(global_mods)
            # print(scope.keys())
            # print(scope["__builtins__"].keys())
            exec(setup, scope)
            exec(star.code, scope)

            # get the figure, making sure to import matplotlib
            exec("import matplotlib.pyplot as plt", scope)
            fig = eval(f"plt.gcf()", scope)

            path = Path(save_folder) / f"{star_id}_{color_mode}.png"
            exec(f"plt.savefig('{path}', bbox_inches='tight'), plt.close('all')", scope)

    def _get_global_state(self, setup_cells: Sequence[str]) -> Tuple[dict, dict]:
        """Returns the global setup state in a copyable and non-copyable component.

        This state is the state that is recreated before every plot cell. This
        allows expensive computations to only be done once per notebook, not
        once per cell that uses them.

        Parameters
        ----------
        setup_cells : Sequence[str]
          The setup cells to run.

        Returns:

        (state, mods), where state is the copyable objects from the global state
        (most variables) and mods is what can't be copied, which is usually
        things like modules. Any modifications to modules are therefore shared
        across cells.
        """
        # Rerunning all of the setup files every plot is very time-consuming if
        # you have a setup that runs a big analysis. At the same time, deep
        # copying doesn't work for modules. The hack I use to get around this
        # right now is to simply not deep copy modules and deep copy everything
        # else.
        global_state = {}
        for cell in setup_cells:
            exec(cell, global_state)

        # there's a very subtle nuance of the way Python handles functions that
        # we need to properly handle. When a function is defined, Python stores
        # the global variables at the time of that definition in
        # func.__globals__. This means that if you define a function and then
        # re-define globals, the function will still work. The problem is that
        # it's a shallow copy. So, if we remove those keys from the global
        # namespace so we can deep copy it, it removes those names from the
        # function itself, and you are left without even built-in names. To get
        # around this, we make sure that we don't modify global_state or where
        # it lies in memory.

        global_mods = {}
        new_global_state = {}
        for k in list(global_state.keys()):
            if isinstance(global_state[k], ModuleType) or k == "__builtins__":
                global_mods[k] = global_state[k]
            else:
                new_global_state[k] = global_state[k]

        return (new_global_state, global_mods)

    def _save_all_matplotlib(self, save_folder: PathLike):
        """Saves all of the images in the Constellation to the folder.

        The names are tied to the UUID of the Star, but this may change in the future.

        Parameters
        ----------
        save_folder : PathLike
            The folder to save the images in.
        """
        new_global_state, global_mods = self._get_global_state(self.setup_mpl)
        for star, star_id in zip(self.stars, self.ids):
            if star.star_type == "markdown_matplotlib":
                self._run_matplotlib(
                    star, star_id, save_folder, new_global_state, global_mods
                )

    def _save_all_panel(self, save_folder: PathLike):
        """Saves all of the server code in the Constellation to the folder.

        The names are tied to the UUID of the Star, but this may change in the future.

        Parameters
        ----------
        save_folder : PathLike
            The folder to save the code in. Then, you can use `panel serve` to run it.
        """
        setup_code = "\n".join(self.setup_panel)
        for star, star_id in zip(self.stars, self.ids):
            if star.star_type == "markdown_panel":
                with open(Path(save_folder) / (star_id + ".py"), "w") as outfile:
                    outfile.write(
                        """# This code is autogenerated by Constellate, and changes made here will not persist.\n"""
                    )
                    outfile.write(setup_code)
                    outfile.write("\n\n")
                    outfile.write(star.code)
        print("Done serializing Panel servers")

    @classmethod
    def from_ipynb_model(cls, nb: dict) -> Constellation:
        """Generates a Constellation from the JSON data comprising a notebook, stored in `.ipynb` files.

        Parameters
        ----------
        nb : dict
            The JSON data. Should have a "cells" key.

        Returns
        -------
        Constellation
            The output Constellation.

        Raises
        ------
        ValueError
            If there are problems parsing the notebook.
        """
        setup_mpl_cells = []
        setup_panel_cells = []
        filtered_cells = []
        for cell in nb["cells"]:
            if "source" in cell and not cell["source"]:
                # ignore blank cells
                pass
            elif cell["source"][0].strip().lower() == ("#constellate: ignore"):
                # print("Ignoring cell")
                pass
            else:
                rows = [x.strip().lower() for x in cell["source"]]
                if any([row.startswith("#constellate: setup") for row in rows]):
                    print("Adding cell to setup")
                    if "#constellate: setup-mpl" in rows:
                        setup_mpl_cells.append("".join(cell["source"]))
                    if "#constellate: setup-panel" in rows:
                        setup_panel_cells.append("".join(cell["source"]))
                else:
                    filtered_cells.append(cell)

        star_classes = sorted(NB_STARS, key=lambda c: -c.precedence)
        stars = []

        def parse_next(curr_ind):
            for cls in star_classes:
                parse_out = cls.parse(filtered_cells[curr_ind:])
                if parse_out is not None:
                    return parse_out
            return None

        curr_ind = 0
        curr = parse_next(curr_ind)
        while curr is not None:
            (i, star) = curr
            stars.append(star)
            curr_ind += i
            curr = parse_next(curr_ind)

        if curr_ind < len(filtered_cells):
            raise ValueError(
                "Could not parse cell:\n{}".format(
                    "".join(filtered_cells[curr_ind]["source"])
                )
            )

        return cls(setup_mpl_cells, setup_panel_cells, stars)

    @classmethod
    def from_ipynb_file(cls, filename: PathLike) -> Constellation:
        """Generates a Constellation from a .ipynb file.

        Does not require a .ipynb ending.

        Parameters
        ----------
        filename : PathLike
            The file name to read in.

        Returns
        -------
        Constellation
            The output Constellation.
        """

        with open(str(filename), "r") as infile:
            nb = json.load(infile)

        return cls.from_ipynb_model(nb)

    def serialize(self) -> dict:
        stars = [star.serialize() for star in self.stars]
        for star, star_id in zip(stars, self.ids):
            star["star_id"] = star_id

        return {
            "setup_mpl": self.setup_mpl,
            "setup_panel": self.setup_panel,
            "stars": stars,
            "breadcrumbs": self.breadcrumbs,
            "title": self.title,
            "star_titles": [title for level, title in self.outline],
        }

    def to_file(self, savefile: PathLike):
        with open(str(savefile), "w") as save:
            json.dump(self.serialize(), save, indent=2)
