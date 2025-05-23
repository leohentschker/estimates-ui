import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { useState } from 'react';
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/react/16/solid';
import Tutorial from './Tutorial';
import classNames from 'classnames';

export default function Editor({
  code,
  setCode
}: {
  code: string;
  setCode: (code: string) => void;
}) {
  const [showTutorial, setShowTutorial] = useState(false);
  return (
    <div className='rounded-md flex-1 lg:p-3 flex'>
      <div className='flex-1 mt-14 lg:mt-0'>
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
      <div
        className={
          classNames(
            'bg-white py-4 rounded-t-md lg:rounded-t-none lg:rounded-b-md border-t border-gray-200 text-slate-800 border-b border-gray-200 lg:shadow-lg absolute top-0 lg:top-auto lg:bottom-0 left-0 right-0 z-10 bg-white h-14 bg-white z-20 lg:w-3/5',
            showTutorial && 'h-screen lg:h-auto'
          )
        }
      >
        <div
          className='flex items-center justify-between cursor-pointer pb-2'
          onClick={() => setShowTutorial(!showTutorial)}
        >
          <div className='px-4'>
            Learn more about estimates
          </div>
          {
            !showTutorial ? (
              <>
                <ChevronDoubleUpIcon className='w-4 h-4 hidden lg:block' />
                <ChevronDoubleDownIcon className='w-4 h-4 block lg:hidden' />
              </>
            ) : (
              <>
                <ChevronDoubleDownIcon className='w-4 h-4 hidden lg:block' />
                <ChevronDoubleUpIcon className='w-4 h-4 block lg:hidden' />
              </>
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