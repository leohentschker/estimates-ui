import React, { useState, useEffect } from 'react';
import { loadAndRunPyodide } from '../pyodide-loader';

interface ProofProps {
  code: string;
  proofName: string;
}

function Proof({ code, proofName }: ProofProps): React.ReactElement {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const runProof = async (): Promise<void> => {
      const pyodide = await loadAndRunPyodide();
      if (pyodide) {
        const result = await pyodide.runPythonAsync(code);
        setResult(result);
        setLoading(false);
      }
    };
    runProof();
  }, [code]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4">{proofName}</h3>
      <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4">{code}</pre>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-indigo-600">Processing...</span>
        </div>
      ) : (
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4 border-green-500">{result}</pre>
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

export default function Estimates(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 pb-4">
        Z3 Pyodide Proof Assistant Demo
      </h1>
      <div className="space-y-6">
        <Proof code={PROOF_1} proofName="Case Split" />
      </div>
    </div>
  );
}
