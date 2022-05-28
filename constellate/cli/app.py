#!/usr/bin/env python3
"""CLI interface."""

import subprocess
from typing import Sequence
import click
from click.exceptions import MissingParameter
from constellate.constellate.constellation import Constellation
from pathlib import Path
from glob import glob
import logging
import click_log
import os

logger = logging.getLogger(__name__)
click_log.basic_config(logger)

CONSTELLATION_DIR = os.path.join(
    os.getcwd(), "constellate-server", "public", "constellations"
)


@click.group()
@click_log.simple_verbosity_option(logger)
def cli():
    pass


def format_files(filenames):
    """Formats a list of file names as terminal output."""
    return "\n".join([click.format_filename(fn) for fn in filenames])


@cli.command()
@click.argument("inputs", nargs=-1, type=click.Path(exists=True, dir_okay=False))
@click.option(
    "--confirm/--no-confirm",
    default=True,
    help="don't ask for confirmation before running arbitrary code",
)
@click.option("-n", "--no-input", is_flag=True, help="run without any user prompting")
@click.option(
    "-o",
    "--out_dir",
    default=CONSTELLATION_DIR,
    help="output directory",
    type=click.Path(file_okay=False, writable=True, path_type=Path),
)
def build(inputs: Sequence[str], confirm: bool, no_input: bool, out_dir: Path):
    """Builds INPUTS (Jupyter notebooks) into Constellations."""
    if not inputs:
        raise MissingParameter("No input files found, exiting")

    paths = []

    # prompt for files that don't look like notebooks
    if not no_input:
        for fn in inputs:
            if not fn.endswith("ipynb"):
                if not click.confirm(
                    f"Input {click.format_filename(fn)} does not have the .ipynb extension. Constellate only works with Jupyter notebooks. Build the file anyway?",
                    default=False,
                ):
                    continue
            paths.append(fn)

        # warn about safety concerns
        click.confirm(
            "\n".join(
                [
                    click.style("Build the following notebooks?", bold=True),
                    click.style(
                        "WARNING: This can run arbitrary code. Only do this if you trust the authors.",
                        bold=True,
                        fg="bright_red",
                    ),
                    click.style(format_files(paths), fg="blue", dim=True),
                    "\n",
                ]
            ),
            abort=True,
        )

    out_dir.mkdir(parents=True, exist_ok=True)

    panel_path = Path(out_dir / ".panel_servers")
    panel_path.mkdir(parents=True, exist_ok=True)
    py_files = glob(str(panel_path / "*.py"))
    for py_file in py_files:
        os.remove(py_file)

    def process(fn):
        con: Constellation = Constellation.from_ipynb_file(fn)
        con.save_all()

        con.to_file(out_dir / f"{con.slug}.constellate")
        con._save_all_panel(panel_path)

    if no_input:
        for fn in paths:
            process(fn)
    else:
        with click.progressbar(
            paths, label=click.style("Building Constellations", fg="blue")
        ) as bar:
            for fn in bar:
                process(fn)

        click.echo(
            click.style(f"{len(paths)}", fg="blue", bold=True)
            + " notebooks built successfully\n"
        )


@cli.command()
@click.argument(
    "constellations_dir",
    default=CONSTELLATION_DIR,
    type=click.Path(file_okay=False, exists=True, path_type=Path),
)
def python_serve(constellations_dir: Path):
    """Serves the Python backend files in CONSTELLATIONS_DIR"""
    if not list((constellations_dir / ".panel_servers/").glob("*.py")):
        click.secho("No Python backend files, exiting", fg="blue")
        return

    subprocess.run(
        f'python -m panel serve {constellations_dir / ".panel_servers" / "*.py"} --address "0.0.0.0" --port 5006 --prefix "backend/panel" --allow-websocket-origin="*"',
        shell=True,
    )


@cli.command()
@click.argument(
    "constellations_dir",
    default=CONSTELLATION_DIR,
    type=click.Path(file_okay=False, exists=True, path_type=Path),
)
def dev(constellations_dir: Path):
    """Serves the site on a dev server."""
    if not list(constellations_dir.glob("*.constellate")):
        click.secho("No Constellations, exiting", fg="blue")
        return

    subprocess.run(
        f"yarn --cwd constellate-server dev", shell=True,
    )


@cli.command()
@click.argument(
    "constellations_dir",
    default=CONSTELLATION_DIR,
    type=click.Path(file_okay=False, exists=True, path_type=Path),
)
def build_site(constellations_dir: Path):
    """Builds the site for production."""
    if not list(constellations_dir.glob("*.constellate")):
        click.secho("No Constellations, exiting", fg="blue")
        return

    subprocess.run(
        f"yarn --cwd constellate-server build", shell=True,
    )


@cli.command()
@click.argument(
    "constellations_dir",
    default=CONSTELLATION_DIR,
    type=click.Path(file_okay=False, exists=True, path_type=Path),
)
def serve_production(constellations_dir: Path):
    """Serves the site in production."""
    if not list(constellations_dir.glob("*.constellate")):
        click.secho("No Constellations, exiting", fg="blue")
        return

    subprocess.run(
        f"yarn --cwd constellate-server start", shell=True,
    )
