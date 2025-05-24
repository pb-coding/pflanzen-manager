import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import { WaterManagementService, FigmaPlantView } from '../../../services/waterManagement';
import FigmaLayout from '../templates/FigmaLayout';
import FigmaScreen from '../templates/FigmaScreen';
import FigmaHeader from '../molecules/FigmaHeader';
import FigmaPlantImage from '../atoms/FigmaPlantImage';
import FigmaWateringSchedule from '../molecules/FigmaWateringSchedule';
import FigmaNotesSection from '../molecules/FigmaNotesSection';
import FigmaWateringHistory from '../molecules/FigmaWateringHistory';
import FigmaButton from '../atoms/FigmaButton';

/**
 * FigmaPlantDetailScreen - Plant detail screen (Design 27-2)
 * Shows plant details, watering schedule, notes, and history
 */
const FigmaPlantDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Store data
  const plants = useStore(state => state.plants);
  const tasks = useStore(state => state.tasks);
  const images = useStore(state => state.images);
  const addTask = useStore(state => state.addTask);
  const loadPlants = useStore(state => state.loadPlants);
  const loadTasks = useStore(state => state.loadTasks);
  const loadImages = useStore(state => state.loadImages);

  const [plantView, setPlantView] = useState<FigmaPlantView | null>(null);
  const [isWatering, setIsWatering] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadPlants();
    loadTasks();
    loadImages();
  }, [loadPlants, loadTasks, loadImages]);

  // Find and map plant data
  useEffect(() => {
    if (!id || plants.length === 0) return;

    const plant = plants.find(p => p.id === id);
    if (!plant) {
      navigate('/figma/plants');
      return;
    }

    const mappedPlant = WaterManagementService.mapPlantToFigmaView(
      plant,
      tasks,
      images
    );
    setPlantView(mappedPlant);
  }, [id, plants, tasks, images, navigate]);

  const handleBack = () => {
    navigate('/figma/plants');
  };

  const handleWaterNow = async () => {
    if (!plantView || isWatering) return;

    setIsWatering(true);
    try {
      await WaterManagementService.addWateringEntry(
        plantView.id,
        new Date(),
        'Watered via Figma UI',
        addTask
      );
      
      // Reload data to update UI
      await loadTasks();
      
      // Update plant view with new data
      const plant = plants.find(p => p.id === plantView.id);
      if (plant) {
        const updatedPlantView = WaterManagementService.mapPlantToFigmaView(
          plant,
          tasks,
          images
        );
        setPlantView(updatedPlantView);
      }
    } catch (error) {
      console.error('Failed to add watering entry:', error);
    } finally {
      setIsWatering(false);
    }
  };

  if (!plantView) {
    return (
      <FigmaLayout>
        <FigmaScreen
          header={
            <FigmaHeader
              title="Loading..."
              actionIcon="back"
              onActionClick={handleBack}
            />
          }
        >
          <div className="figma-loading">
            <span className="figma-text-body">Loading plant details...</span>
          </div>
        </FigmaScreen>
      </FigmaLayout>
    );
  }

  // Get watering history
  const wateringHistory = WaterManagementService.getWateringHistory(
    plantView.id,
    tasks
  );

  // Header component
  const header = (
    <FigmaHeader
      title={plantView.name}
      actionIcon="back"
      onActionClick={handleBack}
    />
  );

  return (
    <FigmaLayout>
      <FigmaScreen header={header}>
        <div className="figma-plant-detail">
          {/* Plant Image */}
          <FigmaPlantImage
            imageUrl={plantView.imageUrl}
            plantName={plantView.name}
          />

          {/* Watering Schedule */}
          <FigmaWateringSchedule
            nextWatering={plantView.nextWatering}
            wateringFrequencyDays={plantView.wateringFrequencyDays}
            wateringStatus={plantView.wateringStatus}
          />

          {/* Notes Section */}
          <FigmaNotesSection
            notes={plantView.notes}
          />

          {/* Watering History */}
          <FigmaWateringHistory
            wateringEntries={wateringHistory}
          />

          {/* Water Now Button */}
          <div className="figma-plant-detail-actions">
            <FigmaButton
              variant="primary"
              onClick={handleWaterNow}
              disabled={isWatering}
              className="figma-water-now-button"
            >
              {isWatering ? 'Watering...' : 'Water Now'}
            </FigmaButton>
          </div>
        </div>
      </FigmaScreen>
    </FigmaLayout>
  );
};

export default FigmaPlantDetailScreen;