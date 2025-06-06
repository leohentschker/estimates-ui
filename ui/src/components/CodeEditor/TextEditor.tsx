import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { useAppDispatch, useAppSelector } from '../../store';
import { selectCode, setCode } from '../../features/pyodide/pyodideSlice';

export default function TextEditor() {
  const code = useAppSelector(selectCode);
  const dispatch = useAppDispatch();

  return (
    <AceEditor
      mode="python"
      theme="tomorrow"
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
      onChange={code => dispatch(setCode(code))}
      value={code}
      height='100%'
      width='100%'
      fontSize={16}
      lineHeight={28}
    />
  )
}