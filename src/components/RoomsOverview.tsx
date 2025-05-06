import React, { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LightDirection, Room } from '../types/models';

const directionIcon = (dir: LightDirection) => {
  switch (dir) {
    case 'North': return '⬆️';
    case 'East': return '➡️';
    case 'South': return '⬇️';
    case 'West': return '⬅️';
    default: return '';
  }
};

const RoomsOverview: React.FC = () => {
  const rooms = useStore(state => state.rooms);
  const plants = useStore(state => state.plants);
  const tasks = useStore(state => state.tasks);
  const loadRooms = useStore(state => state.loadRooms);
  const loadPlants = useStore(state => state.loadPlants);
  const loadTasks = useStore(state => state.loadTasks);
  const addRoom = useStore(state => state.addRoom);

  // Modal dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [lightDirection, setLightDirection] = useState<LightDirection>('North');
  const [indoor, setIndoor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRooms();
    loadPlants();
    loadTasks();
  }, [loadRooms, loadPlants, loadTasks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await addRoom({ name: name.trim(), lightDirection, indoor });
      setName('');
      setLightDirection('North');
      setIndoor(true);
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = () => {
    setName('');
    setLightDirection('North');
    setIndoor(true);
    setIsDialogOpen(true);
  };

  const countOpenTasks = (room: Room) => {
    const plantIds = plants.filter(p => p.roomId === room.id).map(p => p.id);
    return tasks.filter(t => plantIds.includes(t.plantId) && !t.done).length;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Räume</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {rooms.map(room => (
          <Link
            to={`/rooms/${room.id}`}
            key={room.id}
            className="block bg-white shadow rounded p-4 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <span className="text-2xl" title={room.lightDirection}>
                {directionIcon(room.lightDirection)}
              </span>
            </div>
            <div className="mt-2 space-x-1">
              {plants.filter(p => p.roomId === room.id).slice(0, 3).map(p => (
                <span
                  key={p.id}
                  className="inline-block bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm"
                >
                  {p.name}
                </span>
              ))}
            </div>
            {countOpenTasks(room) > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {countOpenTasks(room)} offene Aufgabe{countOpenTasks(room) > 1 ? 'n' : ''}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Modal dialog for new room creation */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md grid gap-4">
            <h2 className="text-xl font-semibold">Neuen Raum hinzufügen</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Neuer Raum"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Licht</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                value={lightDirection}
                onChange={e => setLightDirection(e.target.value as LightDirection)}
              >
                <option value="North">Norden</option>
                <option value="East">Osten</option>
                <option value="South">Süden</option>
                <option value="West">Westen</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={indoor}
                onChange={e => setIndoor(e.target.checked)}
                className="h-4 w-4"
                id="indoor-checkbox"
              />
              <label htmlFor="indoor-checkbox" className="text-sm font-medium text-gray-700">Innenraum</label>
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
                disabled={isSubmitting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Erstellen...' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={openDialog}
        className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 focus:outline-none"
        aria-label="Neuen Raum hinzufügen"
      >
        +
      </button>
    </div>
  );
};

export default RoomsOverview;
