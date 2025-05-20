import { loadPyodide } from "pyodide";
import { readFile } from "node:fs/promises";

async function main() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("sympy");
  const shim = await readFile("z3shim.py", "utf8");
  await pyodide.runPythonAsync(shim);

  await pyodide.loadPackage("micropip");
  await pyodide.runPythonAsync(`
      import micropip, asyncio
      await micropip.install("file:./estimates-0.1.0-py3-none-any.whl")
  `);

  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node runShim.mjs <script.py>");
    process.exit(1);
  }
  const code = await readFile(target, "utf8");
  await pyodide.runPythonAsync(code);
}

main();
