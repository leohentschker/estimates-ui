import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { useState } from 'react';
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/react/16/solid';
import Tutorial from './Tutorial';

export default function Editor({
  code,
  setCode
}: {
  code: string;
  setCode: (code: string) => void;
}) {
  const [showTutorial, setShowTutorial] = useState(true);
  return (
    <div className='rounded-md flex-1 p-3 flex flex-col'>
      <div className='flex-1'>
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
      <div className='bg-white p-4 rounded-b-md border-t border-gray-200 text-slate-800 shadow-lg'>
        <div className='flex items-center justify-between cursor-pointer pb-2' onClick={() => setShowTutorial(!showTutorial)}>
          <div>
            Learn more about estimates
          </div>
          {
            !showTutorial ? (
              <ChevronDoubleUpIcon className='w-4 h-4' />
            ) : (
              <ChevronDoubleDownIcon className='w-4 h-4' />
            )
          }
        </div>
        {showTutorial && (
          <Tutorial />
        )}
      </div>
    </div>
  )
}