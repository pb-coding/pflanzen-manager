import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoomsOverview from './components/RoomsOverview';
import RoomDetail from './components/RoomDetail';

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-100">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomsOverview />} />
        <Route path="/rooms/:roomId" element={<RoomDetail />} />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
