from setuptools import setup, find_packages

setup(
    name="rushigo-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Add your dependencies here
        "pydantic",
        "pydantic-settings",
    ],
    python_requires=">=3.8",
)
