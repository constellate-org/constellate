from constellate.constellation import Constellation

# con = Constellation.from_ipynb_file(
#     "/home/nicholas/programs/constellate/tests/test-namespaces.ipynb"
# )

# con._save_all_matplotlib(
#     "/home/nicholas/programs/constellations/metropolis-hastings/images"
# )

con = Constellation.from_ipynb_file(
    "/home/nicholas/programs/constellations/metropolis-hastings/mcmc1.ipynb"
)

con.to_file(
    "/home/nicholas/programs/constellations/metropolis-hastings/mcmc1.constellate"
)

con._save_all_matplotlib(
    "/home/nicholas/programs/constellations/metropolis-hastings/images"
)
