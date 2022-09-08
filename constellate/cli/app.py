#!/usr/bin/env python3
"""CLI interface."""

import subprocess
from typing import Sequence, Optional
import click
from click.exceptions import MissingParameter
from constellate.constellate.constellation import Constellation
from pathlib import Path
from glob import glob
import logging
import click_log
import os
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
from git import Repo, GitCommandError
import shutil

logger = logging.getLogger(__name__)
click_log.basic_config(logger)

SERVER_DIR = Path(__file__).parent.parent.parent.resolve() / "constellate-server"
CONSTELLATION_DIR = SERVER_DIR / "public" / "constellations"


@click.group()
@click_log.simple_verbosity_option(logger)
def cli():
    pass


def format_files(filenames):
    """Formats a list of file names as terminal output."""
    return "\n".join([click.format_filename(fn) for fn in filenames])


def _build(inputs: Sequence[str], confirm: bool, no_input: bool, out_dir: Path):
    """Build command wrapper. See build() for documentation."""
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
        if confirm:
            click.confirm(
                "\n".join(
                    [
                        click.style("Build the following notebooks?", bold=True),
                        click.style(
                            "WARNING: This can run arbitrary code. Only do this if you trust the authors.",
                            bold=True,
                            fg="bright_red",
                        ),
                        click.style(format_files(paths), fg="bright_blue", dim=True),
                        "\n",
                    ]
                ),
                abort=True,
            )
    else:
        # just add all paths
        paths = inputs

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
        logger.debug(f"Built successfully to {out_dir}")
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


def install_if_missing():
    """Builds node_modules if not already present."""
    if (SERVER_DIR / "node_modules") not in list(SERVER_DIR.rglob("**/")):
        subprocess.run(["yarn", "--cwd", str(SERVER_DIR.resolve())])


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
    _build(inputs, confirm, no_input, out_dir)


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
        f'python -m panel serve {constellations_dir / ".panel_servers" / "*.py"} --address "0.0.0.0" --port 5006 --allow-websocket-origin="*"  --session-token-expiration=900000 --use-xheaders',
        shell=True,
    )


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
def dev(
    inputs: Sequence[str], confirm: bool, no_input: bool, out_dir: Path,
):
    """Serves the given notebooks on a development server, automatically watching the files and reloading changes."""

    if click.confirm("Build from scratch? ", default=True) and not no_input:
        _build(inputs, confirm, no_input, out_dir)

    if not list(out_dir.glob("*.constellate")):
        click.secho("No Constellations, exiting", fg="blue")
        return

    yarn_dev = subprocess.Popen(["yarn", "--cwd", str(SERVER_DIR.resolve()), "dev"])

    class RebuildEventHandler(PatternMatchingEventHandler):
        def on_modified(self, event):
            logger.info(f"Rebuilding {event.src_path}")
            # rebuild the modified notebook
            _build(
                [event.src_path], confirm=False, no_input=True, out_dir=out_dir,
            )
            logger.info("Completed rebuild")

    observers = []
    for infile in inputs:
        obs = Observer()
        obs.schedule(RebuildEventHandler([infile], ignore_directories=True), infile)
        observers.append(obs)

    try:
        for obs in observers:
            obs.start()
        while True:
            retval = yarn_dev.poll()
            if retval is not None and retval != 0:
                # exited with error, restart
                yarn_dev.terminate()
                print(SERVER_DIR.resolve())
                install_if_missing()
                yarn_dev = subprocess.Popen(
                    ["yarn", "--cwd", str(SERVER_DIR.resolve()), "dev"]
                )
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
    finally:
        for obs in observers:
            obs.stop()
        yarn_dev.terminate()
        click.echo("Terminated")


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

    install_if_missing()
    subprocess.run(["yarn", "--cwd", str(SERVER_DIR.resolve()), "build"])


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

    install_if_missing()
    subprocess.run(["yarn", "--cwd", str(SERVER_DIR.resolve()), "start"])


@cli.command()
@click.argument("inputs", nargs=-1, type=click.Path(exists=True, dir_okay=False))
@click.option(
    "--confirm/--no-confirm",
    default=True,
    help="don't ask for confirmation before running arbitrary code",
)
@click.option("-n", "--no-input", is_flag=True, help="run without any user prompting")
@click.option(
    "--repo_dir",
    default=None,
    type=click.Path(exists=True, file_okay=False),
    help="Git repository directory (defaults to current)",
)
@click.option(
    "--auto-commit/--no-auto-commit",
    default=True,
    help="Automatically commit files if working tree unclean",
)
def git_deploy(
    inputs: Sequence[str],
    confirm: bool,
    no_input: bool,
    repo_dir: Optional[Path],
    auto_commit: bool,
):
    """Commits current work and builds to a separate branch. Then deploys."""
    if repo_dir is None:
        repo_dir = Path()

    r = Repo(repo_dir)
    curr_head = r.head.reference

    try:
        r.create_head("build", "HEAD")
    except OSError:
        # build already exists
        # no need to create it
        pass

    try:
        r.heads.build.checkout()
    except GitCommandError:
        if not auto_commit:
            raise click.ClickException(
                "You have unsaved work. Commit it before deploying."
            )
        else:
            curr_head.index.commit("Automated source Constellate commit")
            curr_head = r.head.reference
            r.heads.build.checkout()

    shutil.copytree(SERVER_DIR, repo_dir / "constellate-server", dirs_exist_ok=True)
    _build(
        inputs,
        confirm,
        no_input,
        repo_dir / "constellate-server" / "public" / "constellations",
    )

    r.index.add([str(repo_dir.absolute() / "constellate-server" / ".gitignore")])
    r.index.add([str(repo_dir.absolute() / "constellate-server")], force=False)
    r.index.commit("Automated Constellate build")
    curr_head.checkout()
