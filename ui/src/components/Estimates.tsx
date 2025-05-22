import React, { useState, useEffect } from 'react';
import { loadAndRunPyodide } from '../pyodide-loader';
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { PyodideInterface } from 'pyodide';

interface ProofProps {
  code: string;
}

function Proof({ code }: ProofProps): React.ReactElement {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);

  const loadPyodide = async (): Promise<void> => {
    const pyodide = await loadAndRunPyodide();
    if (pyodide) {
      setPyodide(pyodide);
    }
  }

  useEffect(() => {
    void loadPyodide();
  }, []);

  const runProof = async (): Promise<void> => {
    if (!pyodide) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const result = await pyodide.runPythonAsync(code);
      setResult(result);
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Unknown error');
    }
    setLoading(false);
  }

  return (
    <div className="h-full w-full">
      <div className='bg-slate-200 w-full flex'>
        <div
          className={`bg-indigo-900 text-white rounded-r-md pl-2 pr-4 py-1 ${pyodide ? 'cursor-pointer hover:bg-indigo-800' : 'opacity-50 cursor-not-allowed'} transition-colors duration-200`}
          onClick={pyodide ? runProof : undefined}
        >
          <span>
            Execute
          </span>
        </div>
        <div className='flex-1' />
      </div>
      {
        !pyodide && (
          <div className='flex items-center justify-center py-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500'></div>
            <span className='ml-2 text-indigo-600'>Loading estimates...</span>
          </div>
        )
      }

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-indigo-600">Processing...</span>
        </div>
      )}
      {
        result && (
          <div className='p-4'>
            <pre className='bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4 border-green-500 whitespace-pre-wrap break-words'>
              {result}
            </pre>
          </div>
        )
      }
    </div>
  );
}

const DEFAULT_PROOF = `
from estimates.main import *
p = split_exercise()
p.use(SplitHyp("h1"))
p.use(SplitHyp("h2"))
p.use(SplitGoal())
p.use(Linarith())
p.use(Linarith())
p.proof()
`.trim();

export default function Estimates(): React.ReactElement {
  const [code, setCode] = useState(DEFAULT_PROOF);
  return (
    <div className="h-screen grid grid-cols-5">
      <div className='col-span-3 h-full p-1 flex flex-col'>
        <div className='rounded-md border border-pink-300 flex-1 p-3'>
          <AceEditor
            mode="python"
            theme="tomorrow"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            onChange={setCode}
            value={code}
            height='100%'
            width='100%'
            fontSize={16}
            lineHeight={28}
          />
        </div>
      </div>
      <div className='col-span-2'>
        <Proof code={code} />
      </div>
    </div>
  );
}
