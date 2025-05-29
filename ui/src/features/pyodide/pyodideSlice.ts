import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { loadAndRunPyodide } from './loader';
import { handleProofComplete } from '../proof/proofSlice';

let customPyodide: { runPythonAsync: (code: string) => Promise<null | { result: string, stdResults: string[], output: Record<string, string>; proofComplete: boolean }>, stdResults: string[] } | null = null;
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
      try {
        result = await pyodide.runPythonAsync(code);
      } catch (error) {
        console.log('ERROR', error);
        return null;
      }
      let output: any;
      try {
        output = pyodide.globals.get('output');
      } catch (error) {
        console.log('ERROR get', error);
        return null;
      }
      let pyodideOutput: Record<string, string>;
      try {
        pyodideOutput = output.toJs();
      } catch (error) {
        console.log('ERROR toJs', error);
        return null;
      }
      const map = Object.fromEntries(Object.entries(pyodideOutput));
      const proofComplete = !!stdResults.find(line => line.includes('Proof complete!'));
      if (proofComplete) {
        dispatch(handleProofComplete());
      }
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
    builder.addCase(runProof.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      const { result: pyodideResult, error: pyodideError } = action.payload;
      if (!pyodideResult) {
        state.loading = false;
        return;
      }
      const { result, stdResults, output, proofComplete } = pyodideResult;
      state.loading = false;
      state.serializedResult = result;
      state.error = pyodideError ? pyodideError : result && result.includes('Error: Traceback') ? result : null;
      state.isJaspiError = !!result && result.includes('WebAssembly stack switching not supported in this JavaScript runtime');
      state.stdout = stdResults;
      state.proofOutput = output;
      state.proofComplete = proofComplete;
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

export default pyodideSlice.reducer;