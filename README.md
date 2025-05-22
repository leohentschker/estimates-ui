# Estimates in the browser
Browser-based IDE for writing proofs with the [`estimates`](https://github.com/teorth/estimates) library.

### Serving z3 via Pyodide
Estimates has a dependency on `z3`, which does not load in Pyodide by default, but does have WASM bindings. In order to circumvent this issue, we write a python shim that loads the WASM bindings and matches python's default interface for z3. For more on this see [`src/z3`](./src/z3)

When [this issue](https://github.com/Z3Prover/z3/issues/7418) is resolved, the shim can be replaced by a more formal Pyodide release.
