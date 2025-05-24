import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoomsOverview from './components/RoomsOverview';
import RoomDetail from './components/RoomDetail';
import PlantDetail from './components/PlantDetail';
import PlantCemetery from './components/PlantCemetery';
import FigmaDesignTest from './components/FigmaDesignTest';
import FigmaPlantListScreen from './components/figma/screens/FigmaPlantListScreen';

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-100">
    <BrowserRouter basename="/pflanzen-manager">
      <Routes>
        <Route path="/" element={<RoomsOverview />} />
        <Route path="/rooms/:roomId" element={<RoomDetail />} />
        <Route path="/rooms/:roomId/plants/:plantId" element={<PlantDetail />} />
        <Route path="/cemetery" element={<PlantCemetery />} />
        <Route path="/figma-test" element={<FigmaDesignTest />} />
        
        {/* Figma Design Implementation Routes */}
        <Route path="/figma/plants" element={<FigmaPlantListScreen />} />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
