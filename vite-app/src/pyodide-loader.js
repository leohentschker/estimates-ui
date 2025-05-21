import { loadPyodide, version as pyodideVersion } from "pyodide";

async function initPyodide() {
  const pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
  });
  return pyodide;
}

const PROOF = `
from estimates.main import *
p = split_exercise()
p.use(SplitHyp("h1"))
p.use(SplitHyp("h2"))
p.use(SplitGoal())
p.use(Linarith())
p.use(Linarith())
p.proof()
`;

export async function loadAndRunPyodide(outputElement) {
    try {
        outputElement.textContent = "Loading Pyodide...";
        const pyodide = await initPyodide();        
        await pyodide.loadPackage("micropip");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install("micropip")
            await micropip.install("sympy")
        `);

        outputElement.textContent = "Loading wheels...";
        console.log("installing z3");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install("file:./z3-0.1.0-py3-none-any.whl")
            import z3
            await z3._init()
            await micropip.install("file:./estimates-0.1.0-py3-none-any.whl")
        `);

        outputElement.textContent = "Running proof...";
        const result = await pyodide.runPythonAsync(PROOF);
        outputElement.textContent = result;
    } catch (error) {
        outputElement.textContent = "Error: " + error.message;
        console.error(error);
    }
}