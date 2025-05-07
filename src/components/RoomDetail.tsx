import React, { useEffect, useState, FormEvent, useRef, ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
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
      <Link 
        to="/" 
        className="flex items-center mb-4"
        style={{ color: 'var(--color-brown-light)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Zurück
      </Link>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-anthracite)' }}>{room.name}</h1>
      
      {/* Plant creation handled via floating button and dialog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-20">
        {roomPlants.map(plant => (
          <Link
            to={`/rooms/${room.id}/plants/${plant.id}`}
            key={plant.id}
            className="organic-card p-5 flex flex-col items-center animate-fade-in"
          >
            {getProfileImage(plant.id) ? (
              <img
                src={getProfileImage(plant.id)}
                alt={plant.name}
                className="plant-image h-28 w-28 mb-4"
              />
            ) : (
              <div 
                className="h-28 w-28 rounded-full mb-4 flex items-center justify-center"
                style={{ 
                  backgroundColor: 'rgba(124, 181, 24, 0.1)', 
                  color: 'var(--color-green-primary)',
                  border: '4px solid var(--color-beige)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15.1 2.8c-.1-.1-.1-.1 0 0-4 4-5 8-5 8s4 1 8-3c0 0 .1-.1 0 0"></path>
                  <path d="M16 8l-4 4"></path>
                  <path d="M18 2c-1.8 1.8-4 3-6.5 3.5C8 6 2 12 2 12s5.5 6 12 6c1.3 0 2.5-.2 3.6-.5"></path>
                </svg>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2">{plant.name}</h3>
            {countOpenTasks(plant.id) > 0 && (
              <div className="mt-1 flex items-center" style={{ color: 'var(--color-error)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span className="text-sm font-medium">
                  {countOpenTasks(plant.id)} offene Aufgabe{countOpenTasks(plant.id) > 1 ? 'n' : ''}
                </span>
              </div>
            )}
          </Link>
        ))}
        
        {roomPlants.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-10 organic-card" style={{ backgroundColor: 'rgba(124, 181, 24, 0.05)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-green-light)', marginBottom: '1rem' }}>
              <path d="M15.1 2.8c-.1-.1-.1-.1 0 0-4 4-5 8-5 8s4 1 8-3c0 0 .1-.1 0 0"></path>
              <path d="M16 8l-4 4"></path>
              <path d="M18 2c-1.8 1.8-4 3-6.5 3.5C8 6 2 12 2 12s5.5 6 12 6c1.3 0 2.5-.2 3.6-.5"></path>
            </svg>
            <p className="text-lg mb-2" style={{ color: 'var(--color-anthracite)' }}>Noch keine Pflanzen in diesem Raum</p>
            <p className="text-sm text-center mb-4" style={{ color: 'var(--color-anthracite)', opacity: 0.7 }}>
              Füge deine erste Pflanze hinzu, indem du auf den Kamera-Button unten rechts klickst.
            </p>
          </div>
        )}
      </div>
      {/* Loading overlay */}
      {isLoading && (
        <div className="modal-overlay">
          <div className="modal-organic animate-fade-in flex flex-col items-center py-8">
            <LoadingSpinner size="large" color="secondary" message="Pflanze wird analysiert..." />
            <p className="text-sm mt-4 text-center max-w-xs" style={{ color: 'var(--color-anthracite)', opacity: 0.7 }}>
              Die KI analysiert dein Pflanzenfoto und erstellt personalisierte Pflegetipps...
            </p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="modal-overlay">
          <div className="modal-organic animate-slide-up">
            <div className="flex items-start mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(214, 64, 69, 0.1)', color: 'var(--color-error)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-error)' }}>Fehler</h3>
                <p className="mb-4" style={{ color: 'var(--color-anthracite)' }}>{errorMessage}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="btn-secondary"
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
        <div className="modal-overlay">
          <form onSubmit={handlePlantDialogSubmit} className="modal-organic animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Neue Pflanze hinzufügen</h2>
              {dialogDataUrl && (
                <div 
                  className="w-16 h-16 rounded-full overflow-hidden border-4"
                  style={{ borderColor: 'var(--color-beige)' }}
                >
                  <img 
                    src={dialogDataUrl} 
                    alt="Pflanzenfoto" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="input-organic"
                value={dialogName}
                onChange={e => setDialogName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Fensterabstand (cm)</label>
              <input
                type="number"
                className="input-organic"
                value={dialogWindowDistanceCm}
                onChange={e => setDialogWindowDistanceCm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Abstand in cm"
              />
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="near-heater-checkbox"
                checked={dialogNearHeater}
                onChange={e => setDialogNearHeater(e.target.checked)}
                className="checkbox-leaf"
              />
              <label htmlFor="near-heater-checkbox" className="text-sm font-medium ml-2">
                Nahe Heizung
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Größe (cm)</label>
                <input
                  type="number"
                  className="input-organic"
                  value={dialogSizeCm}
                  onChange={e => setDialogSizeCm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Höhe in cm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Topf Ø (cm)</label>
                <input
                  type="number"
                  className="input-organic"
                  value={dialogPotSizeCm}
                  onChange={e => setDialogPotSizeCm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Durchmesser in cm"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPlantDialogOpen(false)}
                className="btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn-primary"
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
        color="secondary" 
        icon="camera"
        ariaLabel="Neue Pflanze hinzufügen" 
      />
    </div>
  );
};

export default RoomDetail;
