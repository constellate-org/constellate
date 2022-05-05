"""Defines Stars. A Star is a single page, part of a Constellation."""

from enum import Enum


class Star:
    """A single page in a Constellation. Implemented by subclasses."""

    # Precedence in parsing. Higher values parse sooner. The default is 3.
    precedence = 3

    # Name of the type of star.
    star_type = "base"

    def __init__(self):
        pass

    @classmethod
    def parse(cls, cells):
        """Attempts to parse a new Star from the beginning of cells. Returns (star, i) with a new Star
        and a number of cells that were consumed if successful, and None if not successful."""
        raise NotImplementedError()

    def serialize(self) -> dict:
        return {"kind": self.star_type}


class PureMarkdown(Star):
    # this needs to match after markdown-and-something-else
    precedence = 1

    star_type = "pure_markdown"
    """A Star with just a Markdown cell."""

    def __init__(self, md):
        super().__init__()
        self.md = md

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        return obj

    @classmethod
    def parse(cls, cells):
        if cells and cells[0]["cell_type"] == "markdown":
            return (1, cls("".join(cells[0]["source"])))
        else:
            return None


class PlotType(Enum):
    """A plot type for a cell producing a visual."""

    MATPLOTLIB = "matplotlib"
    PANEL = "panel"
    PLOTLY = "plotly"
    PLAIN = "plain"


def guess_plot_type(cell) -> PlotType:
    """Tries to deduce what type of figure a cell has."""

    # Ideally, it's pretty easy to distinguish figure types by using the type of
    # the output: PNGs are assumed to be matplotlib, JS is an interactive Panel
    # figure, etc.

    # The only downside here is that it requires that you ran the entire
    # notebook before Constellating it. So we basically try for extra credit in
    # those scenarios, guessing based on common library abbreviations. This
    # isn't a good system, but it's just to smooth over some of the rough edges
    # of usability and shouldn't be relied upon.

    code_src = cell["source"]
    line1 = code_src[0].strip().lower()
    if line1.startswith("#constellate: "):
        return PlotType(line1.lstrip("#constellate: ").lower())
    elif "outputs" in cell:
        out_types = set()
        for out in cell["outputs"]:
            if "data" in out:
                for key in out["data"]:
                    out_types.add(key)

        if (
            "application/javascript" in out_types
            or "application/vnd.jupyter.widget-view+json" in out_types
        ):
            return PlotType.PANEL
        elif "image/png" in out_types:
            return PlotType.MATPLOTLIB
        elif "application/vnd.plotly.v1+json" in out_types:
            return PlotType.PLOTLY

    src = "".join(code_src)

    # Library abbreviations that are associated with a specific ecoystem. If we
    # see only one of this set of libraries for a specific cell, we can be
    # reasonably confident that it should be handled accordingly.

    ecosystem_libs = {
        PlotType.MATPLOTLIB: ("plt", "sns"),
        PlotType.PANEL: ("bokeh", "pn", "hv"),
        PlotType.PLOTLY: ("pio", "px", "plotly"),
    }

    found_libs = []
    for eco_name, libs in ecosystem_libs.items():
        if any([lib + "." in src for lib in libs]):
            found_libs.append(eco_name)

    if len(found_libs) == 1:
        return found_libs[0]
    else:
        return PlotType.PLAIN


def strip_metadata(code_src):
    return [x for x in code_src if not x.startswith("#constellate")]


class MarkdownPanel(Star):
    """A Star with Markdown and Panel code. The Panel code should run standalone."""

    star_type = "markdown_panel"

    def __init__(self, md, code):
        super().__init__()
        self.md = md
        self.code = code

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["panel"] = self.code
        return obj

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "code",
        ):
            # figure out if mpl or panel
            if guess_plot_type(cells[1]) == PlotType.PANEL:
                return (
                    2,
                    cls(
                        "".join(cells[0]["source"]),
                        "".join(strip_metadata(cells[1]["source"])),
                    ),
                )
        else:
            return None


class MarkdownMatplotlib(Star):
    """A Star with Markdown and code that outputs a matplotlib figure."""

    star_type = "markdown_matplotlib"

    def __init__(self, md, code):
        super().__init__()
        self.md = md
        self.code = code

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["matplotlib"] = self.code
        return obj

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "code",
        ):
            # figure out if mpl or panel
            if guess_plot_type(cells[1]) == PlotType.MATPLOTLIB:
                return (
                    2,
                    cls(
                        "".join(cells[0]["source"]),
                        "".join(strip_metadata(cells[1]["source"])),
                    ),
                )
        else:
            return None


class MarkdownLatex(Star):
    """A Star with Markdown accompanying LaTeX on the side."""

    star_type = "markdown_latex"

    def __init__(self, md, latex):
        super().__init__()
        self.md = md
        self.latex = latex

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["latex"] = self.latex
        return obj

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "markdown",
        ):
            if cells[1]["source"][0].strip().lower() == "#constellate: latex":
                return (
                    2,
                    cls(
                        "".join(cells[0]["source"]),
                        "".join(strip_metadata(cells[1]["source"])),
                    ),
                )
        else:
            return None


class MarkdownPlotly(Star):
    """A Markdown cell with an attached Plotly visual."""

    star_type = "markdown_plotly"

    def __init__(self, md, code, fig):
        super().__init__()
        self.md = md
        self.code = code

        if fig is None:
            raise ValueError(f"Figure is null\nCode:\n{self.code}")
        else:
            self.fig = fig

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["plotly"] = self.code
        obj["figure"] = self.fig

        return obj

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "code",
        ):
            if guess_plot_type(cells[1]) == PlotType.PLOTLY:
                return (
                    2,
                    cls(
                        "".join(cells[0]["source"]),
                        "".join(strip_metadata(cells[1]["source"])),
                        # if this figure doesn't exist, unlike Matplotlib/Panel
                        # there's no clean way of saying "get the current figure
                        # and plot it", so we're stuck. Not sure how we can
                        # handle this, but for now you have to actually run
                        # Plotly cells.
                        cells[1]
                        .get("outputs", [{}])[0]
                        .get("data", {})
                        .get("application/vnd.plotly.v1+json", None),
                    ),
                )
        else:
            return None


class MarkdownCode(Star):
    # code that makes a diagram should be treated as such: run this after any of those parsers
    precedence = 2

    star_type = "markdown_code"
    """A Star with Markdown and a code panel. Shows plaintext output if there is output."""

    def __init__(self, md, code, output):
        super().__init__()
        self.md = md
        self.code = code
        self.output = output

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["code"] = self.code

        if self.output is not None:
            obj["output"] = self.output

        return obj

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "code",
        ):
            if guess_plot_type(cells[1]) is None:
                outs = cells[1]["outputs"]
                if outs and "data" in outs[0] and "text/plain" in outs[0]["data"]:
                    output = outs[0]["data"]["text/plain"]
                elif outs and "name" in outs[0] and outs[0]["name"] == "stdout":
                    output = outs[0]["text"]
                else:
                    print(
                        "No output. Is that really what you wanted? Cell source:\n{}".format(
                            "".join(cells[1]["source"])
                        )
                    )
                    output = ""

                return (
                    2,
                    cls(
                        "".join(cells[0]["source"]),
                        "".join(strip_metadata(cells[1]["source"])),
                        output,
                    ),
                )
        else:
            return None


# The list of stars that are automatically parsed from a notebook. The order of
# this tuple will break precedence ties in determining which parsers get run
# first.
NB_STARS = (
    MarkdownCode,
    MarkdownLatex,
    MarkdownMatplotlib,
    MarkdownPanel,
    MarkdownPlotly,
    PureMarkdown,
)
