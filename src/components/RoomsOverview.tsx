import React, { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LightDirection, Room } from '../types/models';
import FloatingActionButton from './FloatingActionButton';
import LoadingSpinner from './LoadingSpinner';

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
    <div className="p-6" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-anthracite)' }}>Räume</h1>
        <Link 
          to="/cemetery" 
          className="flex items-center px-3 py-2 rounded-full" 
          style={{ 
            backgroundColor: 'rgba(139, 90, 43, 0.1)', 
            color: 'var(--color-brown-primary)'
          }}
        >
          <span className="mr-2">🪦</span> Pflanzen-Friedhof
        </Link>
      </div>
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {rooms.map(room => (
            <Link
              to={`/rooms/${room.id}`}
              key={room.id}
              className="organic-card p-5 animate-fade-in"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{room.name}</h2>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ 
                    backgroundColor: room.indoor 
                      ? 'rgba(91, 192, 235, 0.15)' 
                      : 'rgba(249, 200, 14, 0.15)',
                    color: room.indoor 
                      ? 'var(--color-blue-light)' 
                      : 'var(--color-yellow-primary)'
                  }}
                  title={`${room.lightDirection} ${room.indoor ? '(Innen)' : '(Außen)'}`}
                >
                  {directionIcon(room.lightDirection)}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plants.filter(p => p.roomId === room.id).slice(0, 3).map(p => (
                  <span
                    key={p.id}
                    className="badge badge-green"
                  >
                    {p.name}
                  </span>
                ))}
                {plants.filter(p => p.roomId === room.id).length > 3 && (
                  <span className="badge" style={{ backgroundColor: 'rgba(45, 48, 51, 0.1)', color: 'var(--color-anthracite)' }}>
                    +{plants.filter(p => p.roomId === room.id).length - 3} mehr
                  </span>
                )}
              </div>
              {countOpenTasks(room) > 0 && (
                <div className="mt-3 flex items-center" style={{ color: 'var(--color-error)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span className="text-sm font-medium">
                    {countOpenTasks(room)} offene Aufgabe{countOpenTasks(room) > 1 ? 'n' : ''}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 organic-card animate-fade-in mb-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-green-primary)', marginBottom: '1.5rem' }}>
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            <path d="M15.1 2.8c-.1-.1-.1-.1 0 0-4 4-5 8-5 8s4 1 8-3c0 0 .1-.1 0 0"></path>
            <path d="M16 8l-4 4"></path>
            <path d="M18 2c-1.8 1.8-4 3-6.5 3.5C8 6 2 12 2 12s5.5 6 12 6c1.3 0 2.5-.2 3.6-.5"></path>
          </svg>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-anthracite)' }}>Willkommen bei deinem Pflanzen-Manager</h2>
          <p className="text-center mb-6 max-w-lg" style={{ color: 'var(--color-anthracite)' }}>
            Hier kannst du deine Pflanzen organisieren und ihre Pflege verwalten. Beginne, indem du deinen ersten Raum hinzufügst.
          </p>
          <button 
            onClick={openDialog}
            className="btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14m-7-7h14"></path>
            </svg>
            Ersten Raum erstellen
          </button>
        </div>
      )}

      {/* Modal dialog for new room creation */}
      {isDialogOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleSubmit} className="modal-organic animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4">Neuen Raum hinzufügen</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                className="input-organic"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Neuer Raum"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Licht</label>
              <select
                className="input-organic"
                value={lightDirection}
                onChange={e => setLightDirection(e.target.value as LightDirection)}
              >
                <option value="North">Norden</option>
                <option value="East">Osten</option>
                <option value="South">Süden</option>
                <option value="West">Westen</option>
              </select>
            </div>
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={indoor}
                onChange={e => setIndoor(e.target.checked)}
                className="checkbox-leaf"
                id="indoor-checkbox"
              />
              <label htmlFor="indoor-checkbox" className="text-sm font-medium">Innenraum</label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Erstellen...</span>
                  </div>
                ) : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={openDialog} 
        color="primary" 
        ariaLabel="Neuen Raum hinzufügen" 
      />
    </div>
  );
};

export default RoomsOverview;
