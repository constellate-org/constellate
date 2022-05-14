from constellate.constellation import Constellation
import subprocess
from pathlib import Path
import glob
import os

# con = Constellation.from_ipynb_file(
#     "/home/nicholas/programs/constellations/metropolis-hastings/mcmc1.ipynb"
# )
# con = Constellation.from_ipynb_file("/home/nicholas/programs/test/multivar.ipynb")
# con = Constellation.from_ipynb_file(
#     "/home/nicholas/programs/constellations/mcmc-in-action/real-world-bayes.ipynb"
# )
con = Constellation.from_ipynb_file(
    "/home/nicholas/programs/constellate/docs/constellate-tutorial.ipynb"
)

con._save_all_matplotlib()

con.to_file(
    "/home/nicholas/programs/constellations/metropolis-hastings/mcmc.constellate.json"
)

con.to_file("/home/nicholas/programs/constellate-server/public/mcmc.constellate.json")

panel_path = Path("/home/nicholas/programs/constellate-server/panel-servers/")
py_files = glob.glob(str(panel_path / "*.py"))
for py_file in py_files:
    os.remove(py_file)

con._save_all_panel(panel_path)
print("Done!")
