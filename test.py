from constellate.constellation import Constellation
import subprocess
from pathlib import Path
import glob
import os
import slugify
import panel as pn

con_files = (
    "/home/nicholas/programs/test/multivar.ipynb",
    "/home/nicholas/programs/constellations/mcmc-in-action/real-world-bayes.ipynb",
    "/home/nicholas/programs/constellate/docs/constellate-intro.ipynb",
    "/home/nicholas/programs/constellate/docs/constellate-tutorial.ipynb",
)

panel_objects = {}

for con_file in con_files:
    con: Constellation = Constellation.from_ipynb_file(con_file)
    con_slug = slugify.slugify(con.title)
    con.save_all()

    con.to_file(
        f"/home/nicholas/programs/constellate-server/public/constellations/{con_slug}.constellate.json"
    )

    # panel_path = Path("/home/nicholas/programs/constellate-server/panel-servers/")
    # py_files = glob.glob(str(panel_path / "*.py"))
    # for py_file in py_files:
    #     os.remove(py_file)
    # con._save_all_panel(panel_path)

    for star_id, code in con.panel_code().items():
        print(star_id, "\n", code)

        def wrap_code(code):
            """Makes a wrapper function to return Panel object"""

            def f():
                global_state = {}
                exec("\n".join(code.strip().split("\n")[:-1]), global_state)
                return eval(code.strip().split("\n")[-1], global_state)

            return f

        panel_objects[f"{con_slug}_{star_id}"] = wrap_code(code)

# for k, v in panel_objects.items():
#     print(k, v())
#     print(v() is v() or v() == v())

pn.serve(
    panel_objects,
    port=5006,
    address="localhost",
    show=False,
    start=True,
    websocket_origin="*",
)
