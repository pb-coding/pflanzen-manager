import React, { useEffect, useState, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plant, PlantImage, Task } from '../types/models';

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

  const [name, setName] = useState('');
  const [windowDistanceCm, setWindowDistanceCm] = useState<number | ''>('');
  const [nearHeater, setNearHeater] = useState(false);
  const [sizeCm, setSizeCm] = useState<number | ''>('');
  const [potSizeCm, setPotSizeCm] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRooms();
    loadPlants();
    loadImages();
    loadTasks();
  }, [loadRooms, loadPlants, loadImages, loadTasks]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await addPlant({
        roomId: room.id,
        name: name.trim(),
        windowDistanceCm: windowDistanceCm === '' ? undefined : windowDistanceCm,
        nearHeater,
        sizeCm: sizeCm === '' ? undefined : sizeCm,
        potSizeCm: potSizeCm === '' ? undefined : potSizeCm,
      });
      setName(''); setWindowDistanceCm(''); setNearHeater(false);
      setSizeCm(''); setPotSizeCm('');
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Neue Pflanze"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Abstand (cm)</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={windowDistanceCm}
            onChange={e => setWindowDistanceCm(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="z.B. 50"
          />
        </div>
        <div className="flex items-center mt-6 space-x-2">
          <input
            type="checkbox"
            checked={nearHeater}
            onChange={e => setNearHeater(e.target.checked)}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium text-gray-700">Nahe Heizung</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Größe (cm)</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={sizeCm}
            onChange={e => setSizeCm(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="z.B. 30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Topf Ø (cm)</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={potSizeCm}
            onChange={e => setPotSizeCm(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="z.B. 15"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Erstellen...' : 'Neue Pflanze'}
          </button>
        </div>
      </form>
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
    </div>
  );
};

export default RoomDetail;