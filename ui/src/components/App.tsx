import React from 'react';
import Estimates from './Estimates';
import '../style.css';
import { ReactFlowProvider } from '@xyflow/react';

function App(): React.ReactElement {
  return (
    <div className="min-h-screen">
      <ReactFlowProvider>
        <Estimates />
      </ReactFlowProvider>
    </div>
  );
}

export default App;