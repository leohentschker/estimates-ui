import { loadPyodide, version as pyodideVersion, PyodideInterface } from "pyodide";

async function initPyodide({
  stdout = (message: string) => console.log(message),
}: {
  stdout: (message: string) => void;
}): Promise<PyodideInterface> {
  const pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
    stdout,
  });
  return pyodide;
}

export async function loadAndRunPyodide({
  stdout = (message: string) => console.log(message),
}: {
  stdout: (message: string) => void;
}): Promise<PyodideInterface | undefined> {
  try {
    const pyodide = await initPyodide({
      stdout
    });
    await pyodide.loadPackage("micropip");
    await pyodide.runPythonAsync(`
        import micropip
        await micropip.install("micropip")
        await micropip.install("sympy")
        await micropip.install("antlr4-python3-runtime==4.11")
        print ('antlr4-python3-runtime installed')
    `);
    console.log("installing z3");
    await pyodide.runPythonAsync(`
        import micropip
        await micropip.install("file:./z3-0.2.0-py3-none-any.whl")
        import z3
        await z3._init()
        await micropip.install("file:./estimates-0.3.0-py3-none-any.whl")
    `);
    console.log('Completed installations');
    return pyodide;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}