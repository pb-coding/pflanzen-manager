import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import { WaterManagementService } from '../../../services/waterManagement';
import FigmaLayout from '../templates/FigmaLayout';
import FigmaScreen from '../templates/FigmaScreen';
import FigmaHeader from '../molecules/FigmaHeader';
import FigmaBottomNav from '../molecules/FigmaBottomNav';
import FigmaPlantList from '../organisms/FigmaPlantList';

/**
 * FigmaPlantListScreen - Main plant list screen (Design 18-2)
 * Now using real data from the store with Water Management Service
 */
const FigmaPlantListScreen: React.FC = () => {
  const navigate = useNavigate();
  
  // Store data
  const plants = useStore(state => state.plants);
  const tasks = useStore(state => state.tasks);
  const images = useStore(state => state.images);
  const loadPlants = useStore(state => state.loadPlants);
  const loadTasks = useStore(state => state.loadTasks);
  const loadImages = useStore(state => state.loadImages);

  // Load data on mount
  useEffect(() => {
    loadPlants();
    loadTasks();
    loadImages();
  }, [loadPlants, loadTasks, loadImages]);

  // Map real data to Figma format
  const figmaPlants = WaterManagementService.mapPlantsToFigmaViews(
    plants,
    tasks,
    images
  );

  const handleAddPlant = () => {
    navigate('/figma/add-plant');
  };

  const handlePlantClick = (plantId: string) => {
    navigate(`/figma/plants/${plantId}`);
  };

  const handleNavigation = (section: string) => {
    console.log('Navigate to:', section);
    // TODO: Implement navigation
  };

  // Header component
  const header = (
    <FigmaHeader
      title="My Plants"
      onActionClick={handleAddPlant}
      actionIcon="plus"
    />
  );

  // Bottom navigation component
  const bottomNav = (
    <FigmaBottomNav
      items={[
        { icon: 'home', active: true, onClick: () => handleNavigation('home') },
        { icon: 'plant', active: false, onClick: () => handleNavigation('plants') },
        { icon: 'settings', active: false, onClick: () => handleNavigation('settings') }
      ]}
    />
  );

  return (
    <FigmaLayout>
      <FigmaScreen header={header} bottomNav={bottomNav}>
        <FigmaPlantList
          plants={figmaPlants}
          onPlantClick={handlePlantClick}
        />
      </FigmaScreen>
    </FigmaLayout>
  );
};

export default FigmaPlantListScreen;