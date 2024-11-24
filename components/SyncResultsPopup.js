import React from 'react';
import './SyncResultsPopup.css';

const SyncResultsPopup = ({ results, onClose }) => {
  if (!results) return null;

  const { backup, tokenChanges, cssGeneration, success, error } = results;

  return (
    <div className="sync-popup-overlay">
      <div className="sync-popup">
        <button className="sync-popup-close" onClick={onClose}>×</button>
        
        <div className="sync-popup-content">
          {error ? (
            <div className="sync-error">
              <h3>❌ Sync Failed</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Backup Information */}
              {backup && backup.success && (
                <div className="sync-section">
                  <h3>📦 Backup Created</h3>
                  <div className="sync-details">
                    <p>• File: {backup.fileName}</p>
                    <div className="token-counts">
                      <p>• Token Count:</p>
                      <ul>
                        <li>Colors: {backup.tokenCounts.colors}</li>
                        <li>Typography Styles: {backup.tokenCounts.typography}</li>
                        <li>Font Sizes: {backup.tokenCounts.fontSizes}</li>
                        <li>Font Weights: {backup.tokenCounts.fontWeights}</li>
                        <li>Line Heights: {backup.tokenCounts.lineHeights}</li>
                        <li>Letter Spacing: {backup.tokenCounts.letterSpacing}</li>
                      </ul>
                    </div>
                    <p>• Total Size: {backup.sizeKB}KB</p>
                  </div>
                </div>
              )}

              {/* Token Changes */}
              {tokenChanges && (
                <div className="sync-section">
                  <h3>🔄 Token Changes</h3>
                  
                  {/* New Tokens */}
                  {tokenChanges.newTokens.colors.length > 0 && (
                    <div className="change-group">
                      <h4>✨ New Colors</h4>
                      <ul>
                        {tokenChanges.newTokens.colors.map(color => (
                          <li key={color}>{color}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {tokenChanges.newTokens.typography.length > 0 && (
                    <div className="change-group">
                      <h4>✨ New Typography Styles</h4>
                      <ul>
                        {tokenChanges.newTokens.typography.map(style => (
                          <li key={style}>{style}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Updated Tokens */}
                  {tokenChanges.updatedTokens.colors.length > 0 && (
                    <div className="change-group">
                      <h4>📝 Updated Colors</h4>
                      <ul>
                        {tokenChanges.updatedTokens.colors.map(color => (
                          <li key={color}>{color}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tokenChanges.updatedTokens.typography.length > 0 && (
                    <div className="change-group">
                      <h4>📝 Updated Typography Styles</h4>
                      <ul>
                        {tokenChanges.updatedTokens.typography.map(style => (
                          <li key={style}>{style}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deleted Tokens */}
                  {tokenChanges.deletedTokens.colors.length > 0 && (
                    <div className="change-group">
                      <h4>🗑️ Removed Colors</h4>
                      <ul>
                        {tokenChanges.deletedTokens.colors.map(color => (
                          <li key={color}>{color}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tokenChanges.deletedTokens.typography.length > 0 && (
                    <div className="change-group">
                      <h4>🗑️ Removed Typography Styles</h4>
                      <ul>
                        {tokenChanges.deletedTokens.typography.map(style => (
                          <li key={style}>{style}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* CSS Generation Status */}
              <div className="sync-section">
                <h3>🎨 CSS Variables</h3>
                <p>{cssGeneration ? '✓ Updated successfully' : '❌ Update failed'}</p>
              </div>

              {/* Overall Status */}
              <div className="sync-status">
                {success ? (
                  <p className="success">✓ Sync completed successfully!</p>
                ) : (
                  <p className="error">❌ Sync failed</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncResultsPopup;
