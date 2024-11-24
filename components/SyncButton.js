import React, { useState } from 'react';
import SyncResultsPopup from './SyncResultsPopup';
import './SyncButton.css';

const SyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSyncPopup, setShowSyncPopup] = useState(false);
  const [syncResults, setSyncResults] = useState(null);

  const handleSync = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setSyncResults(results);
      setShowSyncPopup(true);
    } catch (error) {
      setSyncResults({
        success: false,
        error: `Failed to sync: ${error.message}`
      });
      setShowSyncPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`sync-button ${isLoading ? 'loading' : ''}`}
        onClick={handleSync}
        disabled={isLoading}
      >
        <span className="sync-icon">↻</span>
        <span className="sync-text">
          {isLoading ? 'Syncing...' : 'Sync with Figma'}
        </span>
      </button>

      {showSyncPopup && (
        <SyncResultsPopup
          results={syncResults}
          onClose={() => {
            setShowSyncPopup(false);
            setSyncResults(null);
          }}
        />
      )}
    </>
  );
};

export default SyncButton;
