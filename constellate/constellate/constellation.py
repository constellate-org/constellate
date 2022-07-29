"""Defines a Constellation, the outer-level container of a complete work of content."""
from __future__ import annotations
from collections import defaultdict

import json
import hashlib
import base64
from copy import deepcopy
from os import PathLike
from pathlib import Path
from typing import Mapping, Sequence, Tuple, MutableMapping
from types import FunctionType, ModuleType
import html
import re
from urllib.parse import quote
import rho_plus
import pickle

import logging
import click_log

logger = logging.getLogger(__name__)
click_log.basic_config(logger)

from slugify.slugify import slugify

from .star import NB_STARS, MarkdownMatplotlib, Star, PlotType, guess_plot_type


class Constellation:
    """A collection of Stars that combine to form a complete experience."""

    def __init__(
        self, setup: Mapping[PlotType, Sequence[str]], stars: Sequence[Star],
    ):
        """Creates a Constellation.

        Parameters
        ----------
        setup : Mapping[PlotType, Sequence[str]]
            Maps plot types to lists of setup code blocks. The state after these code blocks are run is set up
            before making plots with the given backend.
        stars : Sequence[Star]
            A list of Stars that comprise the webpage.
        """
        self.setup = setup
        self.stars = stars
        self.title = "Constellation"
        self.slug = "constellation"
        self.ids: Sequence[str] = []
        self.mpl_images: MutableMapping[str, str] = {}
        # we want things like images, which are difficult to recompute, tied to something besides a
        # UUID. For now, we use a hash that combines the setup code and the cell code. This is the
        # only code that can impact any one Star, so if we change other Stars there's no need to
        # redo the whole thing.

        # Size of digest in base 64. 8 base64-encoded characters gives a collision would be expected
        # in sqrt(64 ^ 8) = 64 ^ 4 = 2 ^ 24 = 16,777,216 distinct encodes. I'll take those odds.
        HASH_SIZE = 8
        setup_code = "".join(["".join(vals) for vals in self.setup.values()])
        for star in self.stars:
            hasher = hashlib.sha1(setup_code.encode())
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
            """Returns a tuple (n, head) to match a header of level n with text
            head, or (4, "") if no such header exists."""
            for i, pat in enumerate([h1_re, h2_re, h3_re]):
                match = re.match(pat, md)
                if match:
                    return (i + 1, match.group(1))
            return (4, "")

        self.outline = [match_heading(star.md) for star in self.stars]
        self.title = match_heading(self.stars[0].md)[1]
        self.slug = slugify(self.title)
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
        global_state: dict,
        global_mods: dict,
    ):
        """Generates images from a Matplotlib cell and saves those as base64.

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
        global_state: dict
            The global state that can be re-copied.
        global_mods: dict
            The global state (like module definitions) that cannot be copied and is not changed.
        """
        # run this twice, for two different themes
        SET_LIGHT = """
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import rho_plus
IS_DARK = False
theme, cs = rho_plus.mpl_setup(IS_DARK)
plt.style.use(theme)
(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12) = cs
        """
        SET_DARK = """
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import rho_plus
IS_DARK = True
theme, cs = rho_plus.mpl_setup(IS_DARK)
plt.style.use(theme)
(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12) = cs
        """
        for color_mode, setup in zip(("light", "dark"), (SET_LIGHT, SET_DARK)):
            scope = deepcopy(global_state)
            scope.update(global_mods)
            # print(scope.keys())
            # print(scope["__builtins__"].keys())
            exec(setup, scope)
            exec(star.code, scope)
            exec(
                """
import matplotlib.pyplot as plt
fig = plt.gcf()
            """,
                scope,
            )

            # get the figure, making sure to import matplotlib
            # we also need to get rid of the XML tag that matplotlib adds
            exec(
                """
import io
import base64
bio = io.BytesIO()
fig.savefig(bio,  format='svg')
bio.seek(0)
# get rid of xml tag, just include svg
svg = bio.read().decode()
svg = svg[svg.find('<svg'):].replace('\\n', '')
pic_svg = svg
plt.close(fig)
            """,
                scope,
            )

            uri = eval("svg", scope)
            self.mpl_images[
                f"{star_id}_{color_mode}"
            ] = "data:image/svg+xml;utf8," + quote(uri)

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
            try:
                deepcopy(global_state[k])
                new_global_state[k] = global_state[k]
            except TypeError as e:
                global_mods[k] = global_state[k]

        return (new_global_state, global_mods)

    def _save_all_matplotlib(self):
        """Renders the Matplotlib figures.

        The names are tied to the UUID of the Star, but this may change in the future.
        """
        new_global_state, global_mods = self._get_global_state(
            self.setup.get(PlotType.MATPLOTLIB, [])
        )
        for star, star_id in zip(self.stars, self.ids):
            if star.star_type == "markdown_matplotlib":
                self._run_matplotlib(star, star_id, new_global_state, global_mods)

    def _save_vega(self):
        """Saves the appropriate Vega themes to a public directory to use as URLs."""
        for color_mode, theme in (
            ("light", rho_plus.vega_rho_light),
            ("dark", rho_plus.vega_rho_dark),
        ):
            with open(
                Path(__file__).parent.parent.parent
                / "constellate-server"
                / "public"
                / f"vega_rho_{color_mode}.json",
                "w",
            ) as outfile:
                json.dump(theme, outfile)

    def _save_all_panel(self, save_folder: PathLike):
        """Saves all of the server code in the Constellation to the folder.

        The names are tied to the UUID of the Star, but this may change in the future.

        Parameters
        ----------
        save_folder : PathLike
            The folder to save the code in. Then, you can use `panel serve` to run it.
        """
        setup_code = "\n".join(self.setup.get(PlotType.PANEL, []))
        for star, star_id in zip(self.stars, self.ids):
            if star.star_type == "markdown_panel":
                with open(Path(save_folder) / (star_id + ".py"), "w") as outfile:
                    outfile.write(
                        """# This code is autogenerated by Constellate, and changes made here will not persist.\n"""
                    )
                    outfile.write(setup_code)
                    outfile.write("\n\n")
                    outfile.write(star.code)
        logger.debug("Done serializing Panel servers")

    def panel_code(self) -> Mapping[str, str]:
        """Returns a mapping from star ID to code that generates the Panel object to serve."""
        panel_objs = {}
        setup_code = "\n".join(self.setup.get(PlotType.PANEL, []))
        for star, star_id in zip(self.stars, self.ids):
            if star.star_type == "markdown_panel":
                code = """# This code is autogenerated by Constellate, and changes made here will not persist.\n"""
                code += setup_code
                code += "\n\n"
                code += star.code

                panel_objs[star_id] = code
        return panel_objs

    def _save_all_dataframe(self):
        """Saves all DataFrame data to the Constellation."""
        new_global_state, global_mods = self._get_global_state(
            self.setup.get(PlotType.DATAFRAME, [])
        )

        for star in self.stars:
            if star.star_type == "markdown_dataframe":
                scope = deepcopy(new_global_state)
                scope.update(global_mods)
                exec(star.code, scope)

                star.df_json = json.loads(
                    eval(
                        f"({star.df_expr}).to_json(orient='records', force_ascii=False, double_precision=4, date_format='iso')",
                        scope,
                    )
                )

    def save_all(self):
        """Runs all of the methods required to prepare a Constellation for export. Does not prepare Panel servers."""
        self._save_all_matplotlib()
        self._save_vega()
        self._save_all_dataframe()

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
        setup_cells = defaultdict(list)
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
                    logger.debug("Adding cell to setup")
                    code = "".join(cell["source"])
                    # if generic setup, apply to all cells
                    setup_all = any(
                        [row.strip().lower() == "#constellate: setup" for row in rows]
                    )
                    for type_ in PlotType:
                        if (
                            any(
                                [
                                    "#constellate: setup_" + type_.value.lower()
                                    == row.strip().lower()
                                    for row in rows
                                ]
                            )
                            or setup_all
                        ):
                            setup_cells[type_].append(code)
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
                "Could not parse cell:\n{}\nPlot type:\n{}\nPrevious cell:\n{}".format(
                    "".join(filtered_cells[curr_ind]["source"]),
                    guess_plot_type(filtered_cells[curr_ind]),
                    "".join(filtered_cells[curr_ind - 1]["source"]),
                )
            )

        return cls(setup_cells, stars)

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
        for star, star_obj, star_id in zip(stars, self.stars, self.ids):
            star["star_id"] = star_id

            if star["kind"] == "markdown_matplotlib":
                for color_mode in ("light", "dark"):
                    star[color_mode] = self.mpl_images[f"{star_id}_{color_mode}"]
            elif star["kind"] == "markdown_dataframe":
                if not hasattr(star_obj, "df_json"):
                    logger.warn(
                        "You're serializing a Constellation without serializing the Pandas DataFrames."
                    )
                star["df_json"] = (
                    star_obj.df_json if hasattr(star_obj, "df_json") else {}
                )

        setup = {"setup_" + name.value: code for name, code in self.setup.items()}
        return {
            **setup,
            "stars": stars,
            "breadcrumbs": self.breadcrumbs,
            "title": self.title,
            "slug": self.slug,
            "star_titles": [title for level, title in self.outline],
        }

    def to_file(self, savefile: PathLike):
        with open(str(savefile), "w") as save:
            json.dump(self.serialize(), save, indent=2)
