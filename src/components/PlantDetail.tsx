import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { analyzePlantImage, OpenAIError } from '../services/openai';
import { generateTasksFromTips, formatCareTipsForDisplay } from '../services/taskGenerator';
import LoadingSpinner from './LoadingSpinner';
import ApiKeyDialog from './ApiKeyDialog';
import { archivePlant } from '../services/db';

const PlantDetail: React.FC = () => {
  const { roomId, plantId } = useParams<{ roomId: string; plantId: string }>();
  const navigate = useNavigate();
  const rooms = useStore(state => state.rooms);
  const plants = useStore(state => state.plants);
  const images = useStore(state => state.images);
  const tasks = useStore(state => state.tasks);
  const tips = useStore(state => state.tips);
  const loadRooms = useStore(state => state.loadRooms);
  const loadPlants = useStore(state => state.loadPlants);
  const loadImages = useStore(state => state.loadImages);
  const loadTasks = useStore(state => state.loadTasks);
  const loadTips = useStore(state => state.loadTips);
  const updateTask = useStore(state => state.updateTask);
  const addImage = useStore(state => state.addImage);
  const addTip = useStore(state => state.addTip);
  const addTask = useStore(state => state.addTask);
  const settings = useStore(state => state.settings);
  const loadSettings = useStore(state => state.loadSettings);
  const saveSettings = useStore(state => state.saveSettings);

  const [uploading, setUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [pendingImageData, setPendingImageData] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
    loadPlants();
    loadImages();
    loadTasks();
    loadTips();
    loadSettings();
  }, [loadRooms, loadPlants, loadImages, loadTasks, loadTips, loadSettings]);

  const plant = plants.find(p => p.id === plantId);
  if (!plant) {
    return (
      <div className="p-6">
        <Link to={`/rooms/${roomId}`} className="text-blue-600 hover:underline">&larr; Zurück</Link>
        <p className="mt-4 text-red-600">Pflanze nicht gefunden.</p>
      </div>
    );
  }
  const room = rooms.find(r => r.id === plant.roomId);

  // Images sorted desc timestamp
  const plantImages = images
    .filter(img => img.plantId === plant.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Tasks for plant
  const plantTasks = tasks
    .filter(t => t.plantId === plant.id)
    .sort((a, b) => a.dueDate - b.dueDate);

  // Tips for plant, newest first
  const plantTips = tips
    .filter(t => t.plantId === plant.id)
    .sort((a, b) => b.generatedAt - a.generatedAt);

  const handleTaskToggle = async (taskId: string, done: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask({ ...task, done: !done });
    }
  };

  // Handle API key save from dialog
  const handleApiKeySave = async (apiKey: string) => {
    setTempApiKey(apiKey);
    setIsApiKeyDialogOpen(false);
    await saveSettings({ openAiApiKey: apiKey });
    
    // Process the pending image if there is one
    if (pendingImageData) {
      await analyzeAndSaveImage(pendingImageData);
      setPendingImageData(null);
    }
  };

  // Analyze image and generate tips and tasks
  const analyzeAndSaveImage = async (dataURL: string) => {
    if (!plant || !room) return;
    
    setIsAnalyzing(true);
    setErrorMessage(null);
    
    try {
      // Use either the temp API key or the one from settings
      const apiKey = tempApiKey || settings?.openAiApiKey;
      if (!apiKey) {
        throw new Error('No API key available');
      }
      
      // 1. Save the image first
      const timestamp = Date.now();
      await addImage({ plantId: plant.id, timestamp, dataURL });
      
      // 2. Analyze the image with OpenAI
      const analysis = await analyzePlantImage(
        dataURL,
        {
          name: plant.name,
          windowDistanceCm: plant.windowDistanceCm,
          nearHeater: plant.nearHeater,
          sizeCm: plant.sizeCm,
          potSizeCm: plant.potSizeCm
        },
        {
          name: room?.name,
          lightDirection: room?.lightDirection,
          indoor: room?.indoor
        },
        apiKey
      );
      
      // 3. Save the tip
      const tipContent = formatCareTipsForDisplay(analysis.careTips);
      await addTip({
        plantId: plant.id,
        generatedAt: timestamp,
        content: tipContent
      });
      
      // 4. Generate and save tasks
      const newTasks = generateTasksFromTips(plant.id, analysis.careTips);
      for (const task of newTasks) {
        await addTask(task);
      }
      
      // 5. Reload data
      await Promise.all([loadTips(), loadTasks()]);
      
    } catch (err) {
      console.error('Fehler bei KI-Analyse:', err);
      
      // Handle different error types
      if (err instanceof OpenAIError) {
        if (err.status === 401) {
          setErrorMessage('Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihren OpenAI API-Schlüssel.');
          // Store the image data for later processing
          setPendingImageData(dataURL);
          // Show API key dialog
          setIsApiKeyDialogOpen(true);
        } else {
          setErrorMessage(`Fehler bei der Pflanzen-Analyse: ${err.message}`);
        }
      } else {
        setErrorMessage('Fehler bei der Pflanzen-Analyse. Bitte erneut versuchen.');
      }
    } finally {
      setIsAnalyzing(false);
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = reader.result as string;
      
      // Check if we have an API key
      if (!settings?.openAiApiKey) {
        // Store the image data for later processing
        setPendingImageData(dataURL);
        // Show API key dialog
        setIsApiKeyDialogOpen(true);
        return;
      }
      
      // Analyze and save the image
      await analyzeAndSaveImage(dataURL);
    };
    reader.readAsDataURL(file);
  };

  const handleArchive = async () => {
    if (window.confirm('Pflanze wirklich archivieren? Sie wird in den Pflanzen-Friedhof verschoben.')) {
      await archivePlant(plant.id);
      navigate(`/rooms/${roomId}`);
    }
  };

  return (
    <div className="p-6">
      <Link to={`/rooms/${roomId}`} className="text-blue-600 hover:underline">&larr; Zurück</Link>
      <h1 className="text-3xl font-bold mt-2 mb-4">{plant.name}</h1>

      {/* Image header */}
      <div className="flex space-x-2 mb-6">
        {plantImages.slice(0, 3).map((img, idx) => (
          <img
            key={img.id}
            src={img.dataURL}
            alt={`Bild ${idx + 1}`}
            className={idx === 0 ? 'w-48 h-48 object-cover rounded' : 'w-24 h-24 object-cover rounded'}
          />
        ))}
      </div>

      {/* Plant info */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <p><strong>Raum:</strong> {room?.name || '-'}</p>
        <p><strong>Abstand zum Fenster:</strong> {plant.windowDistanceCm ?? '-'} cm</p>
        <p><strong>Nahe Heizung:</strong> {plant.nearHeater ? 'Ja' : 'Nein'}</p>
        <p><strong>Größe:</strong> {plant.sizeCm ?? '-'} cm</p>
        <p><strong>Topfgröße:</strong> {plant.potSizeCm ?? '-'} cm</p>
      </div>

      {/* Tips */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Tipps</h2>
        {plantTips.length === 0 && <p>Keine Tipps vorhanden.</p>}
        {plantTips.map(tip => (
          <div key={tip.id} className="mb-2">
            <p className="text-sm text-gray-500">{new Date(tip.generatedAt).toLocaleString()}</p>
            <p>{tip.content}</p>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Aufgaben</h2>
        {plantTasks.length === 0 && <p>Keine Aufgaben.</p>}
        <ul>
          {plantTasks.map(task => (
            <li key={task.id} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleTaskToggle(task.id, task.done)}
              />
              <span className={task.done ? 'line-through text-gray-500' : ''}>
                {task.type} am {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upload Image */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Foto hinzufügen</h2>
        <p className="text-sm text-gray-600 mb-2">
          Fügen Sie ein neues Foto hinzu, um den aktuellen Zustand zu dokumentieren und neue Pflegetipps zu erhalten.
        </p>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          disabled={uploading || isAnalyzing} 
          className="mb-2"
        />
        {(uploading || isAnalyzing) && (
          <div className="flex items-center mt-2">
            <LoadingSpinner size="small" color="primary" />
            <span className="ml-2 text-sm text-gray-600">
              {isAnalyzing ? 'Pflanze wird analysiert...' : 'Foto wird hochgeladen...'}
            </span>
          </div>
        )}
      </div>

      {/* Archive Plant */}
      <div className="mb-6">
        <button
          onClick={handleArchive}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Pflanze archivieren
        </button>
      </div>
      
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
        onClose={() => {
          setIsApiKeyDialogOpen(false);
          setPendingImageData(null); // Clear pending image if dialog is closed
        }}
        onSave={handleApiKeySave}
      />
    </div>
  );
};

export default PlantDetail;
