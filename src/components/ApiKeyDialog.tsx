import React, { useState } from 'react';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-organic animate-slide-up">
        <h2 className="text-2xl font-semibold mb-4">OpenAI API-Schlüssel benötigt</h2>
        <p className="mb-6 text-gray-600">
          Um Pflanzen automatisch zu erkennen, wird ein OpenAI API-Schlüssel benötigt. 
          Dieser wird sicher auf Ihrem Gerät gespeichert und nicht an Dritte weitergegeben.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              API-Schlüssel
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-organic"
              placeholder="sk-..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-secondary"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
