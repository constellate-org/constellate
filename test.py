from constellate.constellation import Constellation
import subprocess
from pathlib import Path
import glob
import os

# con = Constellation.from_ipynb_file(
#     "/home/nicholas/programs/constellate/tests/test-namespaces.ipynb"
# )

# con._save_all_matplotlib(
#     "/home/nicholas/programs/constellations/metropolis-hastings/images"
# )

con = Constellation.from_ipynb_file(
    "/home/nicholas/programs/constellations/metropolis-hastings/mcmc1.ipynb"
)

con.to_file("/home/nicholas/programs/prho-eui/mcmc1.constellate.json")

# subprocess.call("rm /home/nicholas/programs/prho-eui/dist/images/*.png", shell=True)
# subprocess.call("rm /home/nicholas/programs/prho-eui/static/images/*.png", shell=True)
# con._save_all_matplotlib("/home/nicholas/programs/prho-eui/dist/images")
# subprocess.call(
#     "cp /home/nicholas/programs/prho-eui/dist/images/*.png /home/nicholas/programs/prho-eui/static/images/",
#     shell=True,
# )

panel_path = Path("/home/nicholas/programs/constellations/metropolis-hastings/servers/")
py_files = glob.glob(str(panel_path / "*.py"))
for py_file in py_files:
    os.remove(py_file)

con._save_all_panel(panel_path)
print("Done!")
