"""Defines a Constellation, the outer-level container of a complete work of content."""
from __future__ import annotations

import json
from copy import deepcopy
from os import PathLike
from pathlib import Path
from typing import Sequence
from types import ModuleType
import matplotlib.pyplot as plt

from .star import NB_STARS, MarkdownMatplotlib, Star


class Constellation:
    """A collection of Stars that combine to form a complete experience."""

    def __init__(self, setup: Sequence[str], stars: Sequence[Star]):
        """Creates a Constellation.

        Parameters
        ----------
        setup : Sequence[str]
            List of setup code sources: these imports and constants are prepended to cells that
            generate an image or serve an application
        stars : Sequence[Star]
            A list of Stars that comprise the webpage.
        """
        self.setup = setup
        self.stars = stars

    def _run_matplotlib(
        self,
        star: MarkdownMatplotlib,
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
        save_location : PathLike
            The location to save the results.
        global_state: dict
            The global state that can be re-copied.
        global_mods: dict
            The global state (like module definitions) that cannot be copied and is not changed.
        """
        # run this twice, for two different themes
        SET_LIGHT = """
plt.style.use('rho')
c1, c2, c3, c4, c5, c6, *cs = plt.rcParams['axes.prop_cycle'].by_key()['color']
        """
        SET_DARK = """
plt.style.use('rho-dark')
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

            path = Path(save_folder) / f"{star.uuid}_{color_mode}.png"
            exec(f"plt.savefig('{path}', bbox_inches='tight'), plt.close('all')", scope)

    def _save_all_matplotlib(self, save_folder: PathLike):
        """Saves all of the images in the Constellation to the folder.

        The names are tied to the UUID of the Star, but this may change in the future.

        Parameters
        ----------
        save_folder : PathLike
            The folder to save the images in.
        """
        # Rerunning all of the setup files every plot is very time-consuming if
        # you have a setup that runs a big analysis. At the same time, deep
        # copying doesn't work for modules. The hack I use to get around this
        # right now is to simply not deep copy modules and deep copy everything
        # else.
        global_state = {}
        for cell in self.setup:
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

        for star in self.stars:
            if star.star_type == "markdown_matplotlib":
                self._run_matplotlib(star, save_folder, new_global_state, global_mods)

    @classmethod
    def from_ipynb_model(cls, nb: dict) -> Constellation:
        """Generates a Constellation from the JSON data comprising a notebook, stored in .ipynb files.

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

        setup_cells = []
        filtered_cells = []
        for cell in nb["cells"]:
            if "source" in cell and not cell["source"]:
                # ignore blank cells
                pass
            elif cell["source"][0].strip().lower() == ("#constellate: ignore"):
                # print("Ignoring cell")
                pass
            elif "#constellate: setup" in [x.strip().lower() for x in cell["source"]]:
                print("Adding cell to setup")
                setup_cells.append("".join(cell["source"]))
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
        return {"setup": self.setup, "stars": [star.serialize() for star in self.stars]}

    def to_file(self, savefile: PathLike):
        with open(str(savefile), "w") as save:
            json.dump(self.serialize(), save, indent=2)
