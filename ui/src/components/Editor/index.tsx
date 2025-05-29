import TextEditor from './TextEditor';
import { Tabs, TabsList, TabsTrigger } from "../Tabs"
import { useState } from 'react';
import VisualEditor from './VisualEditor';


export default function Editor({
  code,
  setCode
}: {
  code: string;
  setCode: (code: string) => void;
}) {
  const [tab, setTab] = useState('visual');
  return (
    <div className='lg:flex-3 h-full flex flex-col min-h-[25vh] lg:min-h-[30vh]'>
      <div className='rounded-md flex-1 flex'>
        <div className='flex-1 mt-14 lg:mt-0 flex flex-col gap-2'>
          <div className='mx-auto'>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="visual" className='cursor-pointer'>
                  Visual
                </TabsTrigger>
                <TabsTrigger value="code" className='cursor-pointer'>
                  Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {
            tab === 'code' && (
              <TextEditor code={code} setCode={setCode} />
            )
          }
          {
            tab === 'visual' && (
              <VisualEditor setCode={setCode} />
            )
          }
        </div>
      </div>
    </div>
  )
}