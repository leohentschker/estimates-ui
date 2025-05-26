import TutorialContainer from '../Tutorial';
import TextEditor from './TextEditor';

export default function Editor({
  code,
  setCode
}: {
  code: string;
  setCode: (code: string) => void;
}) {
  return (
    <div className='lg:flex-3 h-full lg:p-1 flex flex-col min-h-[25vh] lg:min-h-[30vh]'>
      <div className='rounded-md flex-1 lg:p-3 flex'>
        <div className='flex-1 mt-14 lg:mt-0'>
          <TextEditor
            code={code}
            setCode={setCode}
          />
        </div>
        <TutorialContainer />
      </div>
    </div>
  )
}
