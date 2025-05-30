import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { loadAndRunPyodide } from './loader';
import { fixLayout, handleProofComplete, handleProofIncomplete } from '../proof/proofSlice';
import { Edge } from '@xyflow/react';
import { Variable, Relation, Goal } from '../proof/proofSlice';

let customPyodide: { 
  runPythonAsync: (code: string) => Promise<{ error?: string; result?: string, stdResults?: string[], output?: Record<string, string>; proofComplete?: boolean }>, 
  stdResults?: string[],
} | null = null;
export const loadCustomPyodide = createAsyncThunk('pyodide/loadCustomPyodide', async (_, { dispatch }) => {
  let stdResults: string[] = [];

  const pyodide = await loadAndRunPyodide({ stdout: line => stdResults.push(line) });
  if (!pyodide) {
    return null;
  }

  customPyodide = {
    runPythonAsync: async (code: string) => {
      stdResults = [];
      let result: any;
      const augmentedCode = `
from sympy.parsing.latex import parse_latex
global output
output = {}
def store_output(key):
	try:
		output[key] = str(p);
	except:
		pass
${code}
`.trim();
      try {
        result = await pyodide.runPythonAsync(augmentedCode);
      } catch (error) {
        console.log('ERROR', error);
        return { error: `${error}` };
      }
      let output: any;
      try {
        output = pyodide.globals.get('output');
      } catch (error) {
        console.log('ERROR get', error);
        return { error: `${error}` };
      }
      let pyodideOutput: Record<string, string>;
      try {
        pyodideOutput = output.toJs();
      } catch (error) {
        console.log('ERROR toJs', error);
        return { error: `${error}` };
      }
      const map = Object.fromEntries(Object.entries(pyodideOutput));
      const proofComplete = !!stdResults.find(line => line.includes('Proof complete!'));
      if (proofComplete) {
        dispatch(handleProofComplete());
      } else {
        dispatch(handleProofIncomplete());
      }
      dispatch(fixLayout());
      return {
        result,
        stdResults,
        output: map,
        proofComplete,
      }
    },
    stdResults
  }
  return !!customPyodide;
});

export const runProof = createAsyncThunk('pyodide/runProof', async (code: string) => {
  if (!customPyodide) {
    return
  }
  try {
    const result = await customPyodide.runPythonAsync(code);
    return { result, error: null };
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      if (error.message.includes('PythonError')) {
        errorMessage = `Python Error: ${error.message.replace('PythonError: ', '')}`;
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'An unexpected error occurred';
    }
    return { result: null, error: errorMessage };
  }
});

export const convertProofGraphToCode = createAsyncThunk('pyodide/convertProofGraphToCode', async (
  { edges, variables, relations, goal }: { edges: Edge[], variables: Variable[], relations: Relation[], goal: Goal }
) => {
  const codeLines = [
    'from estimates.main import *',
    'from sympy import *',
    'p = ProofAssistant();',
  ];
  for (const variable of variables) {
    if (!variable.name) {
      continue;
    }
    codeLines.push(`${variable.name} = p.var("${variable.type}", "${variable.name}");`);
  }
  for (const relation of relations) {
    if (!relation.input) {
      continue;
    }
    codeLines.push(`p.assume(${relation.input}, "${relation.name}");`);
  }

  if (goal.input) {
    codeLines.push(`p.begin_proof(${goal.input});`);
  }

  for (const edge of edges) {
    const tacticName = (edge.data?.tactic ?? '').toString();
    const isLemma = edge.data?.isLemma ?? false;
    if (!['sorry', 'win'].includes(tacticName)) {
      if (isLemma) {
        codeLines.push(`p.use_lemma(${tacticName});`);
      } else {
        codeLines.push(`p.use(${tacticName});`);
      }
      codeLines.push(`store_output("${edge.target}");`);
    }
  }
  codeLines.push(`p.proof()`);
  const code = codeLines.join('\n');
  return code;
});

interface PyodideState {
  code: string;
  pyodideLoaded: boolean;
  error: string | null;
  isJaspiError: boolean;
  serializedResult: string | null;
  stdout: string[];
  loading: boolean;
  proofOutput: Record<string, string> | null;
  proofComplete: boolean;
}

const initialState: PyodideState = {
  code: '',
  pyodideLoaded: false,
  error: null,
  isJaspiError: false,
  serializedResult: null,
  stdout: [],
  loading: false,
  proofOutput: null,
  proofComplete: false,
};

export const pyodideSlice = createSlice({
  name: 'pyodide',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadCustomPyodide.fulfilled, (state, action) => {
      state.pyodideLoaded = !!action.payload;
    });
    builder.addCase(runProof.pending, (state) => {
      state.loading = true;
      state.proofOutput = null;
      state.serializedResult = null;
      state.error = null;
      state.isJaspiError = false;
      state.stdout = [];
    });
    builder.addCase(convertProofGraphToCode.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      state.code = action.payload;
    });
    builder.addCase(runProof.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      const { result: pyodideResult, error: pyodideError } = action.payload;
      if (!pyodideResult) {
        state.loading = false;
        return;
      }
      const { result, stdResults, output, proofComplete, error } = pyodideResult;

      if (error) {
        state.loading = false;
        state.error = error;
        return;
      }

      state.loading = false;
      state.serializedResult = result || null;
      state.error = pyodideError ? pyodideError : result && result.includes('Error: Traceback') ? result : null;
      state.isJaspiError = !!result && result.includes('WebAssembly stack switching not supported in this JavaScript runtime');
      state.stdout = stdResults || [];
      state.proofOutput = output || null;
      state.proofComplete = proofComplete || false;
    });
  },
});

export const { setCode } = pyodideSlice.actions;

export const selectCode = (state: RootState) => state.pyodide.code;
export const selectPyodideLoaded = (state: RootState) => state.pyodide.pyodideLoaded;
export const selectIsJaspiError = (state: RootState) => state.pyodide.isJaspiError;
export const selectSerializedResult = (state: RootState) => state.pyodide.serializedResult;
export const selectError = (state: RootState) => state.pyodide.error;
export const selectStdout = (state: RootState) => state.pyodide.stdout;
export const selectLoading = (state: RootState) => state.pyodide.loading;
export const selectProofOutput = (state: RootState) => state.pyodide.proofOutput;
export const selectProofComplete = (state: RootState) => state.pyodide.proofComplete;
export const selectProofError = (state: RootState) => state.pyodide.error;

export default pyodideSlice.reducer;