import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import FigmaLayout from '../templates/FigmaLayout';
import FigmaScreen from '../templates/FigmaScreen';
import FigmaHeader from '../molecules/FigmaHeader';
import FigmaFormField from '../molecules/FigmaFormField';
import FigmaInput from '../atoms/FigmaInput';
import FigmaDropdown from '../atoms/FigmaDropdown';
import FigmaToggle from '../atoms/FigmaToggle';
import FigmaButton from '../atoms/FigmaButton';
import FigmaImageUpload from '../atoms/FigmaImageUpload';

/**
 * FigmaAddPlantScreen - Add plant screen (Design 26-170)
 * Form to add a new plant with name, type, watering frequency, and reminders
 */
const FigmaAddPlantScreen: React.FC = () => {
  const navigate = useNavigate();
  const addPlant = useStore(state => state.addPlant);
  const addTask = useStore(state => state.addTask);
  const addImage = useStore(state => state.addImage);

  // Form state
  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plant type options
  const plantTypes = [
    'Houseplant',
    'Succulent',
    'Herb',
    'Flowering Plant',
    'Fern',
    'Cactus',
    'Tree',
    'Vine'
  ];

  const handleBack = () => {
    navigate('/figma/plants');
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const parseWateringFrequency = (frequency: string): number => {
    // Parse "Every X days" format
    const match = frequency.match(/(\d+)/);
    return match ? parseInt(match[1]) : 7; // Default to 7 days
  };

  const handleSubmit = async () => {
    if (!plantName.trim()) {
      alert('Please enter a plant name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create plant
      const plantId = await addPlant({
        name: plantName.trim(),
        roomId: 'default-room' // Default room for Figma plants
      });

      // Save plant image if selected
      if (selectedImage && plantId) {
        // Convert File to base64 dataURL
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataURL = event.target?.result as string;
          if (dataURL) {
            try {
              await addImage({
                plantId,
                timestamp: Date.now(),
                dataURL
              });
            } catch (error) {
              console.error('Failed to save plant image:', error);
            }
          }
        };
        reader.readAsDataURL(selectedImage);
      }

      // Create watering task if frequency is specified
      if (wateringFrequency && plantId) {
        const frequencyDays = parseWateringFrequency(wateringFrequency);
        await addTask({
          plantId,
          type: 'Watering',
          dueDate: Date.now() + (frequencyDays * 24 * 60 * 60 * 1000),
          done: false,
          recurring: true,
          recurrencePattern: {
            unit: 'days',
            interval: frequencyDays
          },
          notes: `Water every ${frequencyDays} days`
        });
      }

      // Navigate back to plant list
      navigate('/figma/plants');
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Failed to add plant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Header component
  const header = (
    <FigmaHeader
      title="Add Plant"
      actionIcon="back"
      onActionClick={handleBack}
    />
  );

  return (
    <FigmaLayout>
      <FigmaScreen header={header}>
        <div className="figma-add-plant">
          {/* Plant Name Field */}
          <FigmaFormField label="Plant Name">
            <FigmaInput
              placeholder="e.g., Fiddle Leaf Fig"
              value={plantName}
              onChange={setPlantName}
            />
          </FigmaFormField>

          {/* Plant Type Field */}
          <FigmaFormField label="Plant Type">
            <FigmaDropdown
              placeholder="Select Plant Type"
              options={plantTypes}
              value={plantType}
              onChange={setPlantType}
            />
          </FigmaFormField>

          {/* Watering Frequency Field */}
          <FigmaFormField label="Watering Frequency">
            <FigmaInput
              placeholder="e.g., Every 7 days"
              value={wateringFrequency}
              onChange={setWateringFrequency}
            />
          </FigmaFormField>

          {/* Plant Photo Field */}
          <FigmaFormField label="Plant Photo">
            <FigmaImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onImageRemove={handleImageRemove}
            />
          </FigmaFormField>

          {/* Reminders Section */}
          <div className="figma-add-plant-reminders">
            <div className="figma-add-plant-reminders-content">
              <div className="figma-add-plant-reminders-text">
                <div className="figma-add-plant-reminders-label">
                  <span className="figma-text-body-medium">Reminders</span>
                </div>
                <div className="figma-add-plant-reminders-description">
                  <span className="figma-text-small">
                    Get notified when it's time to water your plant.
                  </span>
                </div>
              </div>
              <div className="figma-add-plant-reminders-toggle">
                <FigmaToggle
                  checked={remindersEnabled}
                  onChange={setRemindersEnabled}
                />
              </div>
            </div>
          </div>

          {/* Add Plant Button */}
          <div className="figma-add-plant-actions">
            <FigmaButton
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !plantName.trim()}
              className="figma-add-plant-button"
            >
              {isSubmitting ? 'Adding Plant...' : 'Add Plant'}
            </FigmaButton>
          </div>
        </div>
      </FigmaScreen>
    </FigmaLayout>
  );
};

export default FigmaAddPlantScreen;