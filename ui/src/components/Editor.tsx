import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { useEffect, useState } from 'react';
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/react/16/solid';
import Tutorial, { URL_PARAM_TUTORIAL_TAB } from './Tutorial';
import classNames from 'classnames';

const URL_PARAM_SHOW_TUTORIAL = 'tutorial';

const shouldShowTutorialAtStart = () => {
  const url = new URL(window.location.href);
  const tutorialParam = url.searchParams.get(URL_PARAM_SHOW_TUTORIAL);
  if (tutorialParam === 'true') {
    return true;
  } else if (tutorialParam === 'false') {
    return false;
  }
  // Default to showing the tutorial on desktop
  return window.innerWidth > 1024;
};

export default function Editor({
  code,
  setCode
}: {
  code: string;
  setCode: (code: string) => void;
}) {
  const [showTutorial, setShowTutorial] = useState(shouldShowTutorialAtStart());

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(URL_PARAM_SHOW_TUTORIAL, showTutorial.toString());
    window.history.replaceState({}, '', url.toString());
    if (!showTutorial) {
      const url = new URL(window.location.href);
      url.searchParams.set(URL_PARAM_TUTORIAL_TAB, '');
      window.history.replaceState({}, '', url.toString());
    }
  }, [showTutorial]);


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