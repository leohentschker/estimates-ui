import VisualEditor from './VisualEditor';

export default function Editor() {
  return (
    <div className='lg:flex-3 h-full flex flex-col min-h-[25vh] lg:min-h-[30vh]'>
      <div className='rounded-md flex-1 flex'>
        <div className='flex-1 mt-14 lg:mt-0 flex flex-col gap-2'>
          <VisualEditor />
        </div>
      </div>
    </div>
  )
}