import React from 'react';
import Estimates from './Estimates';
import '../style.css';

function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Estimates />
      </div>
    </div>
  );
}

export default App;