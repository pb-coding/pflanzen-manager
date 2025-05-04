import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plant } from '../types/models';

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
  const deletePlant = useStore(state => state.deletePlant);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRooms();
    loadPlants();
    loadImages();
    loadTasks();
    loadTips();
  }, [loadRooms, loadPlants, loadImages, loadTasks, loadTips]);

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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = reader.result as string;
      await addImage({ plantId: plant.id, timestamp: Date.now(), dataURL });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (window.confirm('Pflanze wirklich löschen?')) {
      await deletePlant(plant.id);
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
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
      </div>

      {/* Delete Plant */}
      <div className="mb-6">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Pflanze löschen
        </button>
      </div>
    </div>
  );
};

export default PlantDetail;