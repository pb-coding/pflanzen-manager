import React, { useEffect, useState, FormEvent, useRef, ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plant, PlantImage, Task } from '../types/models';
import { analyzePlantImage, OpenAIError, PlantAnalysisResult } from '../services/openai';
import { generateTasksFromTips, formatCareTipsForDisplay } from '../services/taskGenerator';
import FloatingActionButton from './FloatingActionButton';
import ApiKeyDialog from './ApiKeyDialog';
import LoadingSpinner from './LoadingSpinner';

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const rooms = useStore(state => state.rooms);
  const plants = useStore(state => state.plants);
  const images = useStore(state => state.images);
  const tasks = useStore(state => state.tasks);
  const loadRooms = useStore(state => state.loadRooms);
  const loadPlants = useStore(state => state.loadPlants);
  const loadImages = useStore(state => state.loadImages);
  const loadTasks = useStore(state => state.loadTasks);
  const addPlant = useStore(state => state.addPlant);
  const settings = useStore(state => state.settings);
  const loadSettings = useStore(state => state.loadSettings);
  const saveSettings = useStore(state => state.saveSettings);
  const addImage = useStore(state => state.addImage);
  const addTip = useStore(state => state.addTip);
  const addTask = useStore(state => state.addTask);
  const loadTips = useStore(state => state.loadTips);

  // Dialog states
  const [isPlantDialogOpen, setIsPlantDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Plant dialog state
  const [dialogName, setDialogName] = useState('');
  const [dialogWindowDistanceCm, setDialogWindowDistanceCm] = useState<number | ''>('');
  const [dialogNearHeater, setDialogNearHeater] = useState(false);
  const [dialogSizeCm, setDialogSizeCm] = useState<number | ''>('');
  const [dialogPotSizeCm, setDialogPotSizeCm] = useState<number | ''>('');
  const [dialogDataUrl, setDialogDataUrl] = useState<string>('');
  const [plantAnalysis, setPlantAnalysis] = useState<PlantAnalysisResult | null>(null);
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Temporary API key for the current operation
  const [tempApiKey, setTempApiKey] = useState<string>('');

  useEffect(() => {
    // Load user settings (e.g., stored OpenAI API key) and data on mount
    loadSettings();
    loadRooms();
    loadPlants();
    loadImages();
    loadTasks();
    loadTips();
  }, [loadSettings, loadRooms, loadPlants, loadImages, loadTasks, loadTips]);

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return (
      <div className="p-6">
        <Link to="/" className="text-blue-600 hover:underline">&larr; Zurück</Link>
        <p className="mt-4 text-red-600">Raum nicht gefunden.</p>
      </div>
    );
  }

  const roomPlants = plants.filter(p => p.roomId === room.id);

  // Handle FAB click to open file chooser
  const handleFabClick = () => {
    fileInputRef.current?.click();
  };

  // Handle API key save from dialog
  const handleApiKeySave = async (apiKey: string) => {
    setTempApiKey(apiKey);
    setIsApiKeyDialogOpen(false);
    await saveSettings({ openAiApiKey: apiKey });
    await processSelectedImage();
  };
  
  // Process the selected image with the API key
  const processSelectedImage = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setIsLoading(true);
      
      try {
        // Clear any previous errors
        setErrorMessage(null);
        
        // Use either the temp API key or the one from settings
        const apiKey = tempApiKey || settings?.openAiApiKey;
        if (!apiKey) {
          throw new Error('No API key available');
        }
        
        // Analyze plant image via OpenAI
        const analysis = await analyzePlantImage(
          dataUrl, 
          {}, // No plant info yet
          { 
            name: room.name,
            lightDirection: room.lightDirection,
            indoor: room.indoor
          },
          apiKey
        );
        
        // Store analysis for later use
        setPlantAnalysis(analysis);
        
        // Open dialog prefilled with recognized name and image
        setDialogDataUrl(dataUrl);
        setDialogName(analysis.plantName);
        setDialogWindowDistanceCm('');
        setDialogNearHeater(false);
        setDialogSizeCm('');
        setDialogPotSizeCm('');
        setIsPlantDialogOpen(true);
      } catch (err) {
        console.error('Fehler bei KI-Analyse:', err);
        
        // Handle different error types
        if (err instanceof OpenAIError) {
          if (err.status === 401) {
            setErrorMessage('Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihren OpenAI API-Schlüssel.');
            // Show API key dialog again
            setIsApiKeyDialogOpen(true);
          } else {
            setErrorMessage(`Fehler bei der Pflanzen-Analyse: ${err.message}`);
          }
        } else {
          setErrorMessage('Fehler bei der Pflanzen-Analyse. Bitte erneut versuchen.');
        }
      } finally {
        setIsLoading(false);
        // Reset the file input to allow selecting the same file again
        fileInput.value = '';
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle file selection (capture)
  const handleFileCapture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Ensure settings loaded
    if (settings === undefined) {
      await loadSettings();
    }
    
    // Check if we have an API key
    const apiKey = settings?.openAiApiKey;
    if (!apiKey) {
      // Show API key dialog
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    // Process the image with the existing API key
    await processSelectedImage();
  };

  // Handle plant dialog form submission
  const handlePlantDialogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dialogName.trim()) return;
    
    try {
      setIsLoading(true);
      
      // 1. Create the plant
      const plantId = await addPlant({
        roomId: room.id,
        name: dialogName.trim(),
        windowDistanceCm: dialogWindowDistanceCm === '' ? undefined : dialogWindowDistanceCm,
        nearHeater: dialogNearHeater,
        sizeCm: dialogSizeCm === '' ? undefined : dialogSizeCm,
        potSizeCm: dialogPotSizeCm === '' ? undefined : dialogPotSizeCm,
      });
      
      // 2. Add the image
      const timestamp = Date.now();
      await addImage({ plantId, timestamp, dataURL: dialogDataUrl });
      
      // 3. If we have plant analysis, add tips and tasks
      if (plantAnalysis) {
        // Add formatted tip
        const tipContent = formatCareTipsForDisplay(plantAnalysis.careTips);
        await addTip({
          plantId,
          generatedAt: timestamp,
          content: tipContent
        });
        
        // Generate and add tasks
        const tasks = generateTasksFromTips(plantId, plantAnalysis.careTips);
        for (const task of tasks) {
          await addTask(task);
        }
      }
      
      setIsPlantDialogOpen(false);
    } catch (error) {
      console.error('Fehler beim Speichern der Pflanze:', error);
      setErrorMessage('Fehler beim Speichern der Pflanze. Bitte erneut versuchen.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileImage = (plantId: string): string | undefined => {
    const imgs = images
      .filter(img => img.plantId === plantId)
      .sort((a, b) => b.timestamp - a.timestamp);
    return imgs.length > 0 ? imgs[0].dataURL : undefined;
  };

  const countOpenTasks = (plantId: string): number =>
    tasks.filter(t => t.plantId === plantId && !t.done).length;

  return (
    <div className="p-6">
      <Link to="/" className="text-blue-600 hover:underline">&larr; Zurück</Link>
      <h1 className="text-3xl font-bold mt-2 mb-4">{room.name}</h1>
      {/* Plant creation handled via floating button and dialog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {roomPlants.map(plant => (
          <Link
            to={`/rooms/${room.id}/plants/${plant.id}`}
            key={plant.id}
            className="block bg-white shadow rounded p-4 flex flex-col items-center hover:shadow-md"
          >
            {getProfileImage(plant.id) ? (
              <img
                src={getProfileImage(plant.id)}
                alt={plant.name}
                className="h-24 w-24 object-cover rounded-full mb-2"
              />
            ) : (
              <div className="h-24 w-24 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-500">
                Foto
              </div>
            )}
            <h3 className="text-lg font-semibold">{plant.name}</h3>
            {countOpenTasks(plant.id) > 0 && (
              <span className="mt-1 text-sm text-red-600">
                {countOpenTasks(plant.id)} offene Aufgabe{countOpenTasks(plant.id) > 1 ? 'n' : ''}
              </span>
            )}
          </Link>
        ))}
      </div>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <LoadingSpinner size="large" color="blue" message="Pflanze wird analysiert..." />
          </div>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Fehler</h3>
            <p className="mb-4">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* API Key Dialog */}
      <ApiKeyDialog 
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={handleApiKeySave}
      />
      
      {/* Modal dialog for new plant creation */}
      {isPlantDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handlePlantDialogSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md grid gap-4">
            <h2 className="text-xl font-semibold">Neue Pflanze hinzufügen</h2>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                className="mt-1 block w-full border rounded px-2 py-1"
                value={dialogName}
                onChange={e => setDialogName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fensterabstand (cm)</label>
              <input
                type="number"
                className="mt-1 block w-full border rounded px-2 py-1"
                value={dialogWindowDistanceCm}
                onChange={e => setDialogWindowDistanceCm(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dialogNearHeater}
                onChange={e => setDialogNearHeater(e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Nahe Heizung</label>
            </div>
            <div>
              <label className="block text-sm font-medium">Größe (cm)</label>
              <input
                type="number"
                className="mt-1 block w-full border rounded px-2 py-1"
                value={dialogSizeCm}
                onChange={e => setDialogSizeCm(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Topf Ø (cm)</label>
              <input
                type="number"
                className="mt-1 block w-full border rounded px-2 py-1"
                value={dialogPotSizeCm}
                onChange={e => setDialogPotSizeCm(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setIsPlantDialogOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Hidden file input for camera capture */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileCapture}
        className="hidden"
      />
      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={handleFabClick} 
        color="blue" 
        ariaLabel="Neue Pflanze hinzufügen" 
      />
    </div>
  );
};

export default RoomDetail;
