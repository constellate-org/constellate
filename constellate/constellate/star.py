"""Defines Stars. A Star is a single page, part of a Constellation."""


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


def guess_plot_type(cell):
    """Guesses if a cell outputs matplotlib or panel figures. Returns one of ('matplotlib', 'panel', None)."""
    code_src = cell["source"]
    if code_src[0].strip().lower() == "#constellate: panel":
        return "panel"
    elif code_src[0].strip().lower() == "#constellate: matplotlib":
        return "matplotlib"
    elif code_src[0].strip().lower() == "#constellate: plain":
        return None
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
            return "panel"
        elif "image/png" in out_types:
            return "matplotlib"

    src = "".join(code_src)
    mpl_libs = [lib + "." in src for lib in ("plt", "sns")]
    panel_libs = [lib + "." in src for lib in ("bokeh", "pn")]
    if any(mpl_libs) and not any(panel_libs):
        return "matplotlib"
    elif any(panel_libs) and not any(mpl_libs):
        return "panel"
    else:
        return None


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
            if guess_plot_type(cells[1]) == "panel":
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
            if guess_plot_type(cells[1]) == "matplotlib":
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
    PureMarkdown,
)
