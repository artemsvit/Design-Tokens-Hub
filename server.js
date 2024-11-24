const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const archiver = require('archiver');
const fs = require('fs').promises;
const fetchUpdates = require('./scripts/fetch-updates.js');
const generateCSS = require('./scripts/generate-css.js');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Serve tokens directory
app.use('/tokens', express.static(path.join(__dirname, 'tokens')));

// API endpoint to update tokens
app.post('/api/update-tokens', async (req, res) => {
    try {
        console.log('📥 Received token update request');
        const result = await fetchUpdates();
        
        console.log('✅ Token sync complete');
        
        res.json({ 
            success: true,
            tokenCounts: result.tokenCounts,
            changes: {
                added: result.changes.added,
                updated: result.changes.updated,
                deleted: result.changes.deleted,
                hasChanges: result.changes.hasChanges
            },
            backup: result.backup
        });
    } catch (error) {
        console.error('❌ Error updating tokens:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to update tokens'
        });
    }
});

// API endpoint to sync tokens
app.post('/api/sync', async (req, res) => {
    try {
        console.log('🔄 Syncing tokens from Figma...');
        const result = await fetchUpdates();
        
        if (result.success) {
            console.log('✅ Sync completed successfully');
            res.json({ success: true });
        } else {
            console.error('❌ Sync failed:', result.error);
            res.status(500).json({ 
                success: false, 
                error: result.error || 'Failed to sync tokens' 
            });
        }
    } catch (error) {
        console.error('❌ Error during sync:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        });
    }
});

// API endpoint to download tokens as ZIP
app.get('/api/download-tokens', (req, res) => {
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    // Set the headers
    res.attachment('design-tokens.zip');
    
    // Pipe archive data to the response
    archive.pipe(res);

    // Add the files to the archive
    archive.file('tokens/tokens.json', { name: 'tokens.json' });
    archive.file('tokens/variables.css', { name: 'variables.css' });

    // Finalize the archive
    archive.finalize();
});

// API endpoint to sync with Figma
app.post('/figma/sync', async (req, res) => {
    try {
        // Use the existing fetchUpdates function
        await fetchUpdates();
        
        // Generate CSS variables
        await generateCSS();
        
        // Read the updated tokens file
        const tokens = JSON.parse(
            await fs.readFile(path.join(__dirname, 'tokens', 'tokens.json'), 'utf8')
        );

        res.json(tokens);
    } catch (error) {
        console.error('Figma sync error:', error);
        res.status(500).json({
            error: error.message || 'Failed to sync with Figma'
        });
    }
});

function processTokens(document) {
    // Initialize token categories
    const tokens = {
        global: {
            colors: {},
            typography: {},
            shadows: {}
        }
    };

    // Process the document and extract tokens
    // This is a placeholder - implement your token extraction logic here
    // based on your Figma file structure

    return tokens;
}

// Start server
app.listen(port, () => {
    console.log(`🚀 Design System server running at http://localhost:${port}`);
});
