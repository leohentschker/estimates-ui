import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";


export default function TextEditor({
  code,
  setCode
}: {
  code: string;
  setCode: (code: string) => void;
}) {
  return (
    <AceEditor
      mode="python"
      theme="tomorrow"
      name="Estimates Editor"
      editorProps={{ $blockScrolling: true }}
      onChange={setCode}
      value={code}
      height='100%'
      width='100%'
      fontSize={16}
      lineHeight={28}
    />
  )
}