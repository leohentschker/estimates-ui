import { useState } from 'react';
import { TypographyH2 } from '../Typography';
import { Button } from '../Button';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setShowTutorial } from '../../features/ui/uiSlice';
import OverviewTab from './OverviewTab';
import CreatingProblemsTab from './CreatingProblemsTab';
import OrdersOfMagnitudeTab from './OrdersOfMagnitudeTab';
import LemmasTab from './LemmasTab';

const LEMMAS_TAB_ID = 'lemmas';
const HOW_IT_WORKS_TAB_ID = 'how-it-works';
const CREATING_PROBLEMS_TAB_ID = 'creating-problems';
const ORDERS_OF_MAGNITUDE_TAB_ID = 'orders-of-magnitude';
const tabs = [
  {
    id: HOW_IT_WORKS_TAB_ID,
    label: 'Overview',
    component: <OverviewTab />,
  },
  {
    id: CREATING_PROBLEMS_TAB_ID,
    label: 'Creating Problems',
    component: <CreatingProblemsTab />,
  },
  {
    id: ORDERS_OF_MAGNITUDE_TAB_ID,
    label: 'Asymptotic analysis',
    component: <OrdersOfMagnitudeTab />,
  },
  {
    id: LEMMAS_TAB_ID,
    label: 'Lemmas',
    component: <LemmasTab />,
  }
]

export default function Tutorial(): React.ReactElement {
  const [activeTab, setActiveTab] = useState(HOW_IT_WORKS_TAB_ID);
  const dispatch = useDispatch();

  return (
    <div
      className='w-2xl min-w-md border-r border-gray-200 h-full flex flex-col overflow-y-auto'
    >
      <div className='bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between'>
        <TypographyH2>Tutorials</TypographyH2>
        <Button variant="ghost" size="sm" onClick={() => dispatch(setShowTutorial(false))}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className='sticky top-0 bg-white z-10 border-b border-gray-200'>
        <div className='flex items-center gap-2 p-4 overflow-x-auto'>
          {
            tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'ghost-active' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                size="sm"
              >
                {tab.label}
              </Button>
            ))
          }
        </div>
      </div>
      <div className='p-4'>
        {
          tabs.find((tab) => tab.id === activeTab)?.component
        }
      </div>
    </div>
  )
}
