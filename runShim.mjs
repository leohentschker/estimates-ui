import { loadPyodide } from "pyodide";

const PROOF = `
from estimates.main import *
p = split_exercise()
p.use(SplitHyp("h1"))
p.use(SplitHyp("h2"))
p.use(SplitGoal())
p.use(Linarith())
p.use(Linarith())
p.proof()
`

async function main() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("sympy");
  await pyodide.loadPackage("micropip");
  await pyodide.runPythonAsync(`
      import micropip, asyncio, time
      await micropip.install("file:./dist/z3-0.1.0-py3-none-any.whl")
      import z3
      await z3._init()
      import z3
      time.sleep(2)
      await micropip.install("file:./estimates-0.1.0-py3-none-any.whl")
  `);

  const result = await pyodide.runPythonAsync(PROOF);
  console.log(result);
}

main();
