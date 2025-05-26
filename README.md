# Estimates in the browser
Browser-based IDE for writing proofs with the [`estimates`](https://github.com/teorth/estimates) library.

This is supported by three pieces of work:
1. Creating a pyodide-compatible z3 wheel by wrapping the WASM build in a python shim
2. Building estimates as a wheel
3. `vite` app that loads the `z3` and `estimates` wheels via pyodide and exposes a web-based editor interface

## Pyodide-compatible z3 wheel
Estimates has a dependency on `z3`, which does not load in Pyodide (it requires native code), but does have WASM bindings. These WASM bindings have a js-friendly interface that doesn't match the interface expected in `estimates`. By wrapping the JS calls in a python shim that mirrors the python interface, we can use `z3`'s wasm build in python in Pyodide under the interface that we expect.

### How this can break
The most common failure mode of the whole project likely will come from differences in behavior between how the actual z3 python library with native code works and how our shim works. This could look like:
1. Missing methods or exports from the shim that are available in normal z3 code
2. Implementation differences in the shim and the native code
3. Confusing behavior around concurrency that haven't been fully explored in this shim

### How you can help this piece of work
We need a unit testing suite that confirms this code is working as expected! Right now the python shim covers just a small section of the overall z3 api. We should both validate that its behavior matches the underlying z3 api to the best of our ability, and extend supported methods to other methods that `estimates` may use in the future. Building a pure python `z3` is in of itself a project of value, as the `z3` project is currently actively researching how to export an official Pyodide-compatible build.

## Building estimates as a wheel
Given the relevant items below to serving `estimates` via Pyodide in the browser:
1. Pyodide works with python 3.12 while `estimates` is built by default with 3.13
2. Estimates has two dependencies: `z3` and `sympy`. We are shimming `z3` and Pyodide loads `sympy` by default
We build the `estimates` wheel in `.github/workflows/pages.yml` by replacing the default `pyproject.toml` in `estimates` with `estimates-pyproject.toml`.

### How this can break
If there are upstream dependency changes in `estimates`, this process of building new wheels may fail and in turn kill future builds in this repository.

### How you can help this work
It could be worth declaring the build parameters for this "web" build directly in the `estimates` `pyproject.toml` file, as this would decrease the likelihood that upstream dependency changes in the `estimates` project break functionality within this repository.

## Vite app
With pure python `z3` and `estimates` wheels, we can now load them in any Pyodide-compatible environment. In the folder `ui` we have a 

### How this can break
This can break in all the classic ways that web apps can break! This site is built on top of two non-thoroughly-tested python wheels, and can run into all of the classic issues of any web app. 

### How you can help this work
**Build out core editor functionality:** This is a new project! There is a lot to be done. Before contributing in this way please open a ticket.
**Add in core web tooling**: This project should have linting, branch protection, and all of the other classic elements of a real build pipeline.
**Add in unit testing suites**: While potentially encapsulated in the above, this is worth calling out distinctly. 
**Check out the issues section**: I've added good first issues that would help move the project forward!