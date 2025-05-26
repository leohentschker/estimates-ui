import { useMemo, useState } from "react";
import { loadAndRunPyodide } from "../../pyodide-loader";
import { PyodideInterface } from "pyodide";
import useOnce from "../hooks";
import { useDebounce } from "use-debounce";

export function usePyodideOutput({
  code,
}: {
  code: string;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [stdout, setStdOut] = useState<string[]>([]);

  const addToStdOut = (
    message: string
  ): void => {
    setStdOut(prev => [...prev, message]);
  }

  const loadPyodide = async (): Promise<void> => {
    setPyodide(null);
    setResult(null);
    setStdOut([]);
    const pyodide = await loadAndRunPyodide({
      stdout: addToStdOut,
    });
    if (pyodide) {
      setPyodide(pyodide);
    }
  }

  useOnce(() => {
    void loadPyodide();
  }, []);

  const [debouncedCode] = useDebounce(code, 200);

  const runProof = async (): Promise<void> => {
    if (!pyodide) {
      return;
    }
    setLoading(true);
    setResult(null);
    setStdOut([]);
    try {
      const result = await pyodide.runPythonAsync(code);
      setResult(result);
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
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useOnce(() => {
    if (!pyodide) {
      return;
    }
    void runProof();
  }, [debouncedCode, !!pyodide]);

  const serializedResult = useMemo(() => {
    if (!result) {
      return null;
    }
    if (typeof result === 'string') {
      return result;
    }
    try {
      return (result as any).toString();
    } catch (error) {
      console.error('Error stringifying result:', error);
      return JSON.stringify(result, null, 2);
    }
  }, [result]);

  const isError = useMemo(() => {
    return result && typeof result === 'string' && result.includes('Error: Traceback');
  }, [result]);

  const isJaspiError = useMemo(() => {
    return result && typeof result === 'string' && result.includes('WebAssembly stack switching not supported in this JavaScript runtime');
  }, [result]);

  return {
    result,
    loading,
    pyodide,
    serializedResult,
    isError,
    isJaspiError,
    stdout,
    loadPyodide,
  }
}