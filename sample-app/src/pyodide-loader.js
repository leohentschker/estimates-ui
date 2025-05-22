import { loadPyodide, version as pyodideVersion } from "pyodide";

async function initPyodide() {
  const pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
  });
  return pyodide;
}

export async function loadAndRunPyodide() {
  try {
    const pyodide = await initPyodide();
    await pyodide.loadPackage("micropip");
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install("micropip")
      await micropip.install("sympy")
    `);
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install("file:./z3-0.1.0-py3-none-any.whl")
      import z3
      await z3._init()
      await micropip.install("file:./estimates-0.1.0-py3-none-any.whl")
    `);
    return pyodide;
  } catch (error) {
    console.error(error);
  }
}