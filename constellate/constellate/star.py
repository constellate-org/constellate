"""Defines Stars. A Star is a single page, part of a Constellation."""

from enum import Enum
from typing import Sequence, Union, Tuple
from yapf.yapflib.yapf_api import FormatCode
import json

import logging
import click_log

logger = logging.getLogger(__name__)
click_log.basic_config(logger)


def fix_code(code: str) -> str:
    """Formats code using YAPF."""
    formatted, _ = FormatCode(code)
    return formatted


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
    DATAFRAME = "dataframe"
    WIDGET = "widget"
    VEGA = "vega"


def guess_plot_type(cell) -> PlotType:
    """Tries to deduce what type of figure a cell has."""

    # Ideally, it's pretty easy to distinguish figure types by using the type of
    # the output: PNGs are assumed to be matplotlib, JS is an interactive Panel
    # figure, etc.

    # The only downside to using outputs is that it requires that you ran the
    # entire notebook before Constellating it. So we basically try for extra
    # credit in those scenarios, guessing based on common library abbreviations.
    # This isn't a good system, but it's just to smooth over some of the rough
    # edges of usability and shouldn't be relied upon.

    code_src = cell["source"]
    line1 = code_src[0].strip().lower()
    if line1.startswith("#constellate: "):
        return PlotType(line1.replace("#constellate: ", "").split(" ")[0].lower())
    elif "outputs" in cell:
        out_types = {}
        for out in cell["outputs"]:
            if "data" in out:
                for key in out["data"]:
                    out_types[key] = out["data"][key]

        if (
            "application/javascript" in out_types
            or "application/vnd.jupyter.widget-view+json" in out_types
        ):
            return PlotType.PANEL
        elif "image/png" in out_types:
            return PlotType.MATPLOTLIB
        elif "application/vnd.plotly.v1+json" in out_types:
            return PlotType.PLOTLY
        elif "application/vnd.vegalite.v4+json" in out_types:
            return PlotType.VEGA
        elif "text/plain" in out_types and "text/html" in out_types:
            # we can guess for some HTML outputs: the class dataframe is used
            # for Pandas DFs, and vegaEmbed is used in Vega code.
            html = "".join(out_types["text/html"])
            keywords = {
                PlotType.VEGA: ("vegaEmbed",),
                PlotType.DATAFRAME: ("dataframe",),
            }
            found_kws = []
            for plot_type, kws in keywords.items():
                if any([kw in html for kw in kws]):
                    found_kws.append(plot_type)

            if len(found_kws) == 1:
                return found_kws[0]
            else:
                return PlotType.PLAIN

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


def strip_metadata(code_src: Sequence[str]) -> Sequence[str]:
    return [x for x in code_src if not x.startswith("#constellate")]


class MarkdownPanel(Star):
    """A Star with Markdown and Panel code. The Panel code should run standalone."""

    star_type = "markdown_panel"

    def __init__(self, md, code):
        super().__init__()
        self.md = md
        self.code = fix_code(code)

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
                        fix_code("".join(strip_metadata(cells[1]["source"]))),
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
        self.code = fix_code(code)

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
                        fix_code("".join(strip_metadata(cells[1]["source"]))),
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
        self.code = fix_code(code)

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
                        fix_code("".join(strip_metadata(cells[1]["source"]))),
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


class MarkdownVega(Star):
    """A Markdown cell with an Altair Vega chart."""

    star_type = "markdown_vega"

    def __init__(self, md, code, chart_html=None, chart_json=None):
        super().__init__()
        self.md = md
        self.code = fix_code(code)

        if chart_html is None and chart_json is None:
            raise ValueError("Vega cell has invalid output. Cell: {}\n".format(code))
        elif chart_html is not None:
            self.chart = json.loads(self.parse_chart_html(chart_html))
        else:
            self.chart = chart_json

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["vega"] = self.code
        obj["chart"] = self.chart
        return obj

    @staticmethod
    def parse_chart_html(html):
        """Gets the Vega chart from HTML output and returns a JSON string."""
        # so there's no easy way to do this, we just kinda have to guess based on the HTML
        # this may very well break with different Vega charts/versions
        # the last line is the ending script tag, we get the object passed to there
        try:
            penultimate = html[-2].strip()
            spec = penultimate.split("})", maxsplit=1)[1]
            # remove ); at end and ,{"mode": "vega-lite"} at end
            spec: str = spec[1:]
            spec = spec.rsplit(",", maxsplit=1)[0]
            return spec
        except (IndexError, ValueError) as e:
            raise e

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "code",
        ):
            if guess_plot_type(cells[1]) == PlotType.VEGA:
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
                        .get("text/html", None),
                        cells[1]
                        .get("outputs", [{}])[0]
                        .get("data", {})
                        .get("application/vnd.vegalite.v4+json", None),
                    ),
                )
        else:
            return None


class MarkdownWidget(Star):
    """A Markdown cell with an attached ipywidget visual."""

    star_type = "markdown_widget"

    def __init__(self, md, code, fig):
        super().__init__()
        self.md = md
        self.code = fix_code(code)

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
                        fix_code("".join(strip_metadata(cells[1]["source"]))),
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


class MarkdownDataframe(Star):
    star_type = "markdown_dataframe"
    """A Star with Markdown and a Pandas DataFrame."""

    def __init__(self, md, code, df_expr):
        super().__init__()
        self.md = md
        self.code = code
        self.df_expr = df_expr

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["code"] = self.code
        obj["df_expr"] = self.df_expr

        return obj

    @classmethod
    def parse(cls, cells):
        if (
            len(cells) >= 2
            and (cells[0]["cell_type"], cells[1]["cell_type"]) == ("markdown", "code",)
            and guess_plot_type(cells[1]) == PlotType.DATAFRAME
        ):
            df_expr = ""
            for line in cells[1]["source"]:
                if line.startswith("#constellate: dataframe"):
                    df_expr = line.replace("#constellate: dataframe", "").strip()

            if not df_expr:
                # no explicit name was given, use last non-empty line
                for line in reversed(cells[1]["source"]):
                    if line.strip():
                        df_expr = line.strip()
                        break
            return (
                2,
                cls(
                    "".join(cells[0]["source"]),
                    fix_code("".join(strip_metadata(cells[1]["source"]))),
                    df_expr,
                ),
            )
        else:
            return None


class MarkdownCode(Star):
    # code that makes a diagram should be treated as such: run this after any of those parsers
    precedence = 2

    star_type = "markdown_code"
    """A Star with Markdown and a code panel. Shows plaintext output if there is output."""

    def __init__(self, md, code, output, lang):
        super().__init__()
        self.md = md
        if lang in ("python", "py"):
            self.code = fix_code(code)
        else:
            self.code = code
        self.output = output
        self.lang = lang

    def serialize(self):
        obj = super().serialize()
        obj["markdown"] = self.md
        obj["code"] = self.code
        obj["lang"] = self.lang

        if self.output is not None:
            obj["output"] = self.output

        return obj

    @staticmethod
    def detect_code_block(cell) -> Union[None, Tuple[Sequence[str], str]]:
        """Determines if a Markdown cell is a single code block. If so, returns the source and language,
        else returns None."""
        if cell["cell_type"] != "markdown":
            return None

        # after removing comment lines, should just be a triple or quadruple backtick line
        lines = cell["source"]
        filtered_lines = strip_metadata(lines)
        if (
            len(filtered_lines) >= 2
            and filtered_lines[0].startswith("```")
            and filtered_lines[-1].startswith("```")
        ):
            lang = filtered_lines[0].strip().strip("`").lower()
            return (filtered_lines[1:-1], lang)
        else:
            return None

    @classmethod
    def parse(cls, cells):
        if len(cells) >= 2 and (cells[0]["cell_type"], cells[1]["cell_type"]) == (
            "markdown",
            "code",
        ):
            if guess_plot_type(cells[1]) is PlotType.PLAIN:
                outs = cells[1]["outputs"]
                if outs and "data" in outs[0] and "text/plain" in outs[0]["data"]:
                    output = outs[0]["data"]["text/plain"]
                elif outs and "name" in outs[0] and outs[0]["name"] == "stdout":
                    output = outs[0]["text"]
                else:
                    logger.warn(
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
                        "python",
                    ),
                )
        elif len(cells) >= 2 and cells[0]["cell_type"] == "markdown":
            src_lang = cls.detect_code_block(cells[1])
            if src_lang is not None:
                src, lang = src_lang
                return (2, cls("".join(cells[0]["source"]), "".join(src), "", lang))
            return None
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
    MarkdownVega,
    MarkdownDataframe,
    PureMarkdown,
)
