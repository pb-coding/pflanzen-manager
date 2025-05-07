import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { analyzePlantImage, OpenAIError } from '../services/openai';
import { generateTasksFromTips, formatCareTipsForDisplay } from '../services/taskGenerator';
import LoadingSpinner from './LoadingSpinner';
import ApiKeyDialog from './ApiKeyDialog';
import { archivePlant } from '../services/db';
import { Task } from '../types/models';

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

  /**
   * Calculate the next due date for a recurring task
   */
  const calculateNextDueDate = (task: Task): number => {
    if (!task.recurrencePattern) {
      return Date.now() + 7 * 24 * 60 * 60 * 1000; // Default to 1 week if no pattern
    }
    
    const { interval, unit, seasonalAdjustment } = task.recurrencePattern;
    let nextInterval = interval;
    
    // Apply seasonal adjustments if enabled
    if (seasonalAdjustment) {
      const currentMonth = new Date().getMonth();
      // Summer months (May-August): shorter intervals for watering
      if (currentMonth >= 4 && currentMonth <= 7 && task.type === 'Watering') {
        nextInterval = Math.max(1, Math.floor(interval * 0.7)); // 30% shorter intervals in summer
      }
      // Winter months (November-February): longer intervals for watering, fertilizing
      else if ((currentMonth >= 10 || currentMonth <= 1) && 
               (task.type === 'Watering' || task.type === 'Fertilizing')) {
        nextInterval = Math.ceil(interval * 1.3); // 30% longer intervals in winter
      }
    }
    
    // Calculate milliseconds based on unit
    let msToAdd = 0;
    switch (unit) {
      case 'days':
        msToAdd = nextInterval * 24 * 60 * 60 * 1000;
        break;
      case 'weeks':
        msToAdd = nextInterval * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'months':
        // Approximate months as 30 days
        msToAdd = nextInterval * 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return Date.now() + msToAdd;
  };

  /**
   * Handle task completion and create new recurring tasks
   */
  const handleTaskToggle = async (taskId: string, done: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // If already done, just toggle back to undone
    if (done) {
      await updateTask({ ...task, done: false });
      return;
    }
    
    // Update completion history
    const updatedTask = { 
      ...task, 
      done: true,
      completionHistory: [
        ...(task.completionHistory || []),
        { date: Date.now() }
      ]
    };
    
    // Save the completed task
    await updateTask(updatedTask);
    
    // If this is a recurring task, create the next instance
    if (task.recurring && task.recurrencePattern) {
      const nextDueDate = calculateNextDueDate(task);
      
      // Create a new task for the next occurrence
      const newTask: Omit<Task, 'id'> = {
        plantId: task.plantId,
        type: task.type,
        dueDate: nextDueDate,
        done: false,
        notes: task.notes,
        recurring: true,
        recurrencePattern: task.recurrencePattern,
        parentTaskId: task.id,
        createdAt: Date.now(),
        completionHistory: []
      };
      
      // Add the new task
      await addTask(newTask);
      
      // Reload tasks to show the new one
      await loadTasks();
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
    <div className="p-6" style={{ backgroundColor: 'var(--color-cream)' }}>
      <Link 
        to={`/rooms/${roomId}`} 
        className="flex items-center mb-4"
        style={{ color: 'var(--color-brown-light)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Zurück
      </Link>
      
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-anthracite)' }}>{plant.name}</h1>

      {/* Image gallery */}
      <div className="organic-card p-5 mb-6 animate-fade-in overflow-hidden">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(124, 181, 24, 0.1)', color: 'var(--color-green-primary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Bildergalerie</h2>
        </div>
        
        <div className="flex flex-col items-center">
          {plantImages.length > 0 ? (
            <div className="w-full">
              {/* Main image */}
              <div className="mb-4 relative rounded-lg overflow-hidden" style={{ maxHeight: '300px' }}>
                <img
                  src={plantImages[0].dataURL}
                  alt={`${plant.name} - Hauptbild`}
                  className="w-full object-cover"
                  style={{ maxHeight: '300px' }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 py-2 px-3 text-xs"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                    color: 'white'
                  }}
                >
                  {new Date(plantImages[0].timestamp).toLocaleDateString()}
                </div>
              </div>
              
              {/* Thumbnails */}
              {plantImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {plantImages.slice(1).map((img, idx) => (
                    <div key={img.id} className="flex-shrink-0 relative">
                      <img
                        src={img.dataURL}
                        alt={`Bild ${idx + 2}`}
                        className="w-20 h-20 object-cover rounded-lg border-2"
                        style={{ borderColor: 'var(--color-beige)' }}
                      />
                      <div 
                        className="absolute bottom-0 left-0 right-0 text-center text-xs py-1"
                        style={{ 
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          borderBottomLeftRadius: '0.5rem',
                          borderBottomRightRadius: '0.5rem'
                        }}
                      >
                        {new Date(img.timestamp).toLocaleDateString().split('.')[0]}.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-48 rounded-lg flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(124, 181, 24, 0.05)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-green-light)', marginBottom: '0.5rem' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p className="text-center" style={{ color: 'var(--color-anthracite)' }}>Noch keine Bilder vorhanden</p>
            </div>
          )}
        </div>
      </div>

      {/* Plant info */}
      <div className="organic-card p-5 mb-6 animate-fade-in">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(124, 181, 24, 0.1)', color: 'var(--color-green-primary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22l10-10"></path>
              <path d="M16 8l-4 4"></path>
              <path d="M18 2c-1.8 1.8-4 3-6.5 3.5C8 6 2 12 2 12s5.5 6 12 6c1.3 0 2.5-.2 3.6-.5"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Pflanzendaten</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="w-8 text-center mr-2" style={{ color: 'var(--color-green-soft)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"></path>
              </svg>
            </span>
            <div>
              <p className="text-sm opacity-70">Raum</p>
              <p className="font-medium">{room?.name || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-8 text-center mr-2" style={{ color: 'var(--color-green-soft)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16l6-3 6 3V4z"></path>
              </svg>
            </span>
            <div>
              <p className="text-sm opacity-70">Fensterabstand</p>
              <p className="font-medium">{plant.windowDistanceCm ?? '-'} cm</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-8 text-center mr-2" style={{ color: plant.nearHeater ? 'var(--color-warning)' : 'var(--color-green-soft)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8"></path>
                <path d="M9 15v6"></path>
                <path d="M15 15v6"></path>
                <path d="M12 15v6"></path>
                <path d="M6 15a6 6 0 0 1-4-10 8 8 0 0 1 16 0 6 6 0 0 1-4 10"></path>
              </svg>
            </span>
            <div>
              <p className="text-sm opacity-70">Nahe Heizung</p>
              <p className="font-medium">{plant.nearHeater ? 'Ja' : 'Nein'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-8 text-center mr-2" style={{ color: 'var(--color-green-soft)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22V2M2 12h20"></path>
              </svg>
            </span>
            <div>
              <p className="text-sm opacity-70">Größe</p>
              <p className="font-medium">{plant.sizeCm ?? '-'} cm</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-8 text-center mr-2" style={{ color: 'var(--color-green-soft)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </span>
            <div>
              <p className="text-sm opacity-70">Topfgröße</p>
              <p className="font-medium">{plant.potSizeCm ?? '-'} cm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="organic-card p-5 mb-6 animate-fade-in">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(166, 124, 82, 0.1)', color: 'var(--color-brown-primary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Pflegetipps</h2>
        </div>
        
        {plantTips.length === 0 ? (
          <div 
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: 'rgba(166, 124, 82, 0.05)' }}
          >
            <p style={{ color: 'var(--color-anthracite)' }}>
              Noch keine Tipps vorhanden. Füge ein Foto hinzu, um Pflegetipps zu erhalten.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {plantTips.map(tip => (
              <div key={tip.id} className="pb-3 border-b" style={{ borderColor: 'var(--color-beige)' }}>
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brown-light)' }} className="mr-2">
                    <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M12 2v2"></path>
                    <path d="M12 6v14"></path>
                    <path d="M16 20H8"></path>
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>
                    {new Date(tip.generatedAt).toLocaleString()}
                  </p>
                </div>
                <p style={{ color: 'var(--color-anthracite)' }}>{tip.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="organic-card p-5 mb-6 animate-fade-in">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(124, 181, 24, 0.1)', color: 'var(--color-green-primary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Aufgaben</h2>
        </div>
        
        {plantTasks.length === 0 ? (
          <div 
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: 'rgba(124, 181, 24, 0.05)' }}
          >
            <p style={{ color: 'var(--color-anthracite)' }}>
              Keine Aufgaben vorhanden. Aufgaben werden automatisch aus den Pflegetipps generiert.
            </p>
          </div>
        ) : (
          <div>
            {/* Filter tabs for tasks */}
            <div className="flex mb-4 border-b" style={{ borderColor: 'var(--color-beige)' }}>
              <button 
                className="px-4 py-2 font-medium border-b-2 -mb-px"
                style={{ 
                  borderColor: 'var(--color-green-primary)',
                  color: 'var(--color-green-primary)'
                }}
              >
                Anstehend
              </button>
              <button 
                className="px-4 py-2 font-medium opacity-70"
                style={{ borderColor: 'transparent' }}
              >
                Erledigt
              </button>
              <button 
                className="px-4 py-2 font-medium opacity-70"
                style={{ borderColor: 'transparent' }}
              >
                Alle
              </button>
            </div>
            
            <ul className="task-list">
              {plantTasks.filter(t => !t.done).map(task => (
                <li key={task.id} className="task-item mb-3 pb-3 border-b" style={{ borderColor: 'var(--color-beige)' }}>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleTaskToggle(task.id, task.done)}
                      className="checkbox-leaf mt-1"
                    />
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{task.type}</p>
                        {task.recurring && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: 'rgba(124, 181, 24, 0.1)', 
                              color: 'var(--color-green-primary)'
                            }}
                          >
                            Wiederkehrend
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm mt-1" style={{ color: 'var(--color-anthracite)' }}>
                        {task.notes}
                      </p>
                      
                      <div className="flex items-center mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-green-soft)' }} className="mr-1">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <p className="text-xs" style={{ color: 'var(--color-green-soft)' }}>
                          Fällig am {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        
                        {task.recurring && task.recurrencePattern && (
                          <div className="ml-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-green-soft)' }} className="mr-1">
                              <path d="M17 2.1l4 4-4 4"></path>
                              <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"></path>
                              <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"></path>
                            </svg>
                            <p className="text-xs" style={{ color: 'var(--color-green-soft)' }}>
                              Alle {task.recurrencePattern.interval} {
                                task.recurrencePattern.unit === 'days' ? 'Tage' : 
                                task.recurrencePattern.unit === 'weeks' ? 'Wochen' : 'Monate'
                              }
                              {task.recurrencePattern.seasonalAdjustment && ' (saisonal angepasst)'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              
              {plantTasks.filter(t => !t.done).length === 0 && (
                <div className="text-center py-4">
                  <p style={{ color: 'var(--color-anthracite)', opacity: 0.7 }}>
                    Keine anstehenden Aufgaben. Gut gemacht! 🌱
                  </p>
                </div>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Upload Image */}
      <div className="organic-card p-5 mb-6 animate-fade-in">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(166, 124, 82, 0.1)', color: 'var(--color-brown-primary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Foto hinzufügen</h2>
        </div>
        
        <p className="mb-4" style={{ color: 'var(--color-anthracite)' }}>
          Füge ein neues Foto hinzu, um den aktuellen Zustand zu dokumentieren und neue Pflegetipps zu erhalten.
        </p>
        
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center mb-4"
          style={{ borderColor: 'var(--color-beige)' }}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            disabled={uploading || isAnalyzing} 
            className="hidden"
            id="photo-upload"
          />
          <label 
            htmlFor="photo-upload"
            className="btn-primary inline-flex items-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Foto auswählen
          </label>
          <p className="mt-2 text-sm opacity-70">oder Datei hierher ziehen</p>
        </div>
        
        {(uploading || isAnalyzing) && (
          <div className="flex items-center justify-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(124, 181, 24, 0.05)' }}>
            <LoadingSpinner size="small" color="primary" />
            <span className="ml-3" style={{ color: 'var(--color-anthracite)' }}>
              {isAnalyzing ? 'Pflanze wird analysiert...' : 'Foto wird hochgeladen...'}
            </span>
          </div>
        )}
      </div>

      {/* Archive Plant */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleArchive}
          className="btn-secondary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Pflanze archivieren
        </button>
      </div>
      
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
