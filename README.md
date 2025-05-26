# Estimates in the browser
Browser-based IDE for writing proofs with the [`estimates`](https://github.com/teorth/estimates) library, currently available at https://math.llm.dev.

![Sample image](assets/sample_screenshot.jpg)

For more in-depth documentation on how the site is built see [`ui/`](ui)

## How it works
This is supported by three pieces of work:
1. [`src/z3`](src/z3) pyodide-compatible z3 wheel by wrapping the z3 WASM build in a python shim and building as a pure-python wheel
2. [estimates-pyproject.toml](estimates-pyproject.toml) pure-python `estimates` wheel
3. [ui](ui) `vite` app that loads the uses Pyodide to serve `estimates` wheel, after injecting custom `z3` dependency

### Pyodide-compatible z3 wheel
Estimates has a dependency on `z3`, which does not load in Pyodide (it requires native code), but does have WASM bindings. By wrapping the JS calls in a python shim that mirrors the python interface, we can create a pure python alternative to `z3`. This code is in [`src/z3`](src/z3) and is built into a wheel in [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Building a pure python `z3` may independently be a project of value, as the `z3` project is currently [actively researching](https://github.com/pyodide/pyodide/issues/5203) how to export an official Pyodide-compatible build.

#### How this can break
The most common failure mode of the whole project likely will come from differences in behavior between how the actual z3 python library with native code works and how our shim works. This could look like:
1. Missing methods or exports from the shim that are available in normal z3 code
2. Implementation differences in the shim and the native code
3. Confusing behavior around concurrency that haven't been fully explored in this shim

#### How you can help this piece of work
We need a unit testing suite that makes sure our python shim behaves identically to the native `z3` library.  We should both validate that its behavior matches the underlying z3 api to the best of our ability, and extend supported methods to other methods that `estimates` may use in the future, as it currently only supports a subset.

### Building estimates as a wheel
1. Pyodide works with python 3.12 while `estimates` is built by default with 3.13
2. Estimates has two dependencies: `z3` and `sympy`
3. With the work above we can shim `z3` and Pyodide loads `sympy` by default
In order to build a Pyodide-compatible version of `estimates`, we replace the default `pyproject.toml` in `estimates` with `estimates-pyproject.toml`. See [`.github/workflows/pages.yml`](.github/workflows/pages.yml) for the full build pipeline.

#### How this can break
If there are upstream dependency changes in `estimates`, this process of building new wheels may fail and in turn kill future builds in this repository.

#### How you can help this work
It's likely worth figuring out a better way to manage this build process, as right now the upstream `estimates` repo has no visibility into the fact that meaningful changes to its dependency patterns would in turn harm this repo.

### Vite app
With pure python `z3` and `estimates` wheels, we can now load them in any Pyodide-compatible environment. In the folder `ui` we have a vite app that loads the website at [`https://math.llm.dev`](https://math.llm.dev).

You can run this with the following:
```
cd ui
npm run install
npm run dev
```

#### How this can break
This can break in all the classic ways that web apps can break! This site is built on top of two non-thoroughly-tested python wheels, and can run into all of the classic issues of any web app. 

## Contributing
Please review the issues tagged with `good-first-issue` or submit an issue of your own! This is a very early-stage project, so contributors are actively encouraged.