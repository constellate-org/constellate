from setuptools import find_packages, setup

setup(
    name="constellate",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=["Click",],
    entry_points={"console_scripts": ["cons = constellate.constellate.cli.app:cli"]},
)
