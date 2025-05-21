import React, { useState, useEffect } from 'react';
import { loadAndRunPyodide } from '../pyodide-loader';

function Proof({ code, proofName }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const runProof = async () => {
      const pyodide = await loadAndRunPyodide();
      const result = await pyodide.runPythonAsync(code);
      setResult(result);
      setLoading(false);
    };
    runProof();
  }, [code]);

  return (
    <div>
      <h3>{proofName}</h3>
      <pre>{code}</pre>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre>{result}</pre>
      )}
    </div>
  );
}



const PROOF_1 = `
from estimates.main import *
p = split_exercise()
p.use(SplitHyp("h1"))
p.use(SplitHyp("h2"))
p.use(SplitGoal())
p.use(Linarith())
p.use(Linarith())
p.proof()
`;

const PROOF_2 = `
from estimates.main import *
p = linarith_exercise()
p.use(Linarith())
p.proof()
`;

const PROOF_3 = `
from estimates.main import *
p = linarith_impossible_example()
p.use(Linarith())
p.use(Linarith(verbose=true))
p.proof()
`;

function PyodideComponent() {

  return (
    <div>
      <h1>Z3 Pyodide Proof Assistant Demo</h1>
      <div>
        <Proof code={PROOF_1} proofName="Case Split" />
        <Proof code={PROOF_2} proofName="Linear Arithmetic" />
        <Proof code={PROOF_3} proofName="Linear Arithmetic Impossible" />
      </div>
    </div>
  );
}

export default PyodideComponent;