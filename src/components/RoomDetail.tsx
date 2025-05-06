import React, { useEffect, useState, FormEvent, useRef, ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plant, PlantImage, Task } from '../types/models';
import { recognizePlantName } from '../services/openai';
import FloatingActionButton from './FloatingActionButton';

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

  // Dialog state for new plant creation
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('');
  const [dialogWindowDistanceCm, setDialogWindowDistanceCm] = useState<number | ''>('');
  const [dialogNearHeater, setDialogNearHeater] = useState(false);
  const [dialogSizeCm, setDialogSizeCm] = useState<number | ''>('');
  const [dialogPotSizeCm, setDialogPotSizeCm] = useState<number | ''>('');
  const [dialogDataUrl, setDialogDataUrl] = useState<string>('');

  useEffect(() => {
    // Load user settings (e.g., stored OpenAI API key) and data on mount
    loadSettings();
    loadRooms();
    loadPlants();
    loadImages();
    loadTasks();
  }, [loadSettings, loadRooms, loadPlants, loadImages, loadTasks]);

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
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle FAB click to open file chooser
  const handleFabClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection (capture)
  const handleFileCapture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Ensure settings loaded
    if (settings === undefined) {
      await loadSettings();
    }
    let apiKey = settings?.openAiApiKey;
    if (!apiKey) {
      apiKey = window.prompt('Bitte OpenAI API-Key eingeben:') || '';
      if (!apiKey) return;
      await saveSettings({ openAiApiKey: apiKey });
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        // Recognize plant name via GPT-4o
        const recognized = await recognizePlantName(dataUrl, apiKey!);
        // Open dialog prefilled with recognized name and image
        setDialogDataUrl(dataUrl);
        setDialogName(recognized);
        setDialogWindowDistanceCm('');
        setDialogNearHeater(false);
        setDialogSizeCm('');
        setDialogPotSizeCm('');
        setIsDialogOpen(true);
      } catch (err) {
        console.error('Fehler bei KI-Erkennung:', err);
        alert('Fehler bei der Pflanzen-Erkennung. Bitte erneut versuchen.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle dialog form submission
  const handleDialogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dialogName.trim()) return;
    const plantId = await addPlant({
      roomId: room.id,
      name: dialogName.trim(),
      windowDistanceCm: dialogWindowDistanceCm === '' ? undefined : dialogWindowDistanceCm,
      nearHeater: dialogNearHeater,
      sizeCm: dialogSizeCm === '' ? undefined : dialogSizeCm,
      potSizeCm: dialogPotSizeCm === '' ? undefined : dialogPotSizeCm,
    });
    await addImage({ plantId, timestamp: Date.now(), dataURL: dialogDataUrl });
    setIsDialogOpen(false);
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
      {/* Modal dialog for new plant creation */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleDialogSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md grid gap-4">
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
                onClick={() => setIsDialogOpen(false)}
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
      {/* Hidden file input for FAB image capture */}
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
