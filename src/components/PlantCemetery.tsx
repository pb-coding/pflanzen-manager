import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getArchivedPlants, restorePlant, permanentlyDeletePlant } from '../services/db';

const PlantCemetery: React.FC = () => {
  // We don't need plants from the store since we're getting archived plants directly from the DB
  const images = useStore(state => state.images);
  const rooms = useStore(state => state.rooms);
  const loadPlants = useStore(state => state.loadPlants);
  const loadImages = useStore(state => state.loadImages);
  const loadRooms = useStore(state => state.loadRooms);
  
  // State for archived plants
  const [archivedPlants, setArchivedPlants] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPlants(), loadImages(), loadRooms()]);
      const archived = await getArchivedPlants();
      setArchivedPlants(archived);
      setLoading(false);
    };
    
    loadData();
  }, [loadPlants, loadImages, loadRooms]);

  const getProfileImage = (plantId: string): string | undefined => {
    const imgs = images
      .filter(img => img.plantId === plantId)
      .sort((a, b) => b.timestamp - a.timestamp);
    return imgs.length > 0 ? imgs[0].dataURL : undefined;
  };

  const getRoomName = (roomId: string): string => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unbekannter Raum';
  };

  const handleRestore = async (plantId: string) => {
    if (window.confirm('Pflanze wiederherstellen?')) {
      await restorePlant(plantId);
      // Refresh the list
      const archived = await getArchivedPlants();
      setArchivedPlants(archived);
      // Reload plants in the store
      await loadPlants();
    }
  };

  const handlePermanentDelete = async (plantId: string) => {
    if (window.confirm('Pflanze endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      await permanentlyDeletePlant(plantId);
      // Refresh the list
      const archived = await getArchivedPlants();
      setArchivedPlants(archived);
    }
  };

  return (
    <div className="p-6">
      <Link to="/" className="text-blue-600 hover:underline">&larr; Zurück zur Übersicht</Link>
      <h1 className="text-3xl font-bold mt-2 mb-4">Pflanzen-Friedhof</h1>
      
      {loading ? (
        <p>Lade archivierte Pflanzen...</p>
      ) : archivedPlants.length === 0 ? (
        <p>Keine archivierten Pflanzen vorhanden.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {archivedPlants.map(plant => (
            <div 
              key={plant.id}
              className="bg-white shadow rounded p-4 flex flex-col items-center"
            >
              {getProfileImage(plant.id) ? (
                <img
                  src={getProfileImage(plant.id)}
                  alt={plant.name}
                  className="h-24 w-24 object-cover rounded-full mb-2 grayscale"
                />
              ) : (
                <div className="h-24 w-24 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-500">
                  Foto
                </div>
              )}
              <h3 className="text-lg font-semibold">{plant.name}</h3>
              <p className="text-sm text-gray-600">Raum: {getRoomName(plant.roomId)}</p>
              {plant.archivedAt && (
                <p className="text-sm text-gray-600">
                  Archiviert am: {new Date(plant.archivedAt).toLocaleDateString()}
                </p>
              )}
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleRestore(plant.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Wiederherstellen
                </button>
                <button
                  onClick={() => handlePermanentDelete(plant.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Endgültig löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantCemetery;
