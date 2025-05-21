/**
 * Save-Load Utility
 * Provides functions for saving and loading game state in the AidCraft simulation
 */
(function() {
    const SaveLoad = {
        /**
         * Save the current game state to localStorage
         * @param {string} [slotName='default'] - Optional slot name for multiple save files
         * @returns {boolean} True if save was successful
         */
        saveGame: function(slotName = 'default') {
            try {
                // Get the current state from state manager
                const currentState = window.stateManager.state;
                
                if (!currentState) {
                    console.error('No state available to save');
                    return false;
                }
                
                // Create save object with metadata
                const saveObject = {
                    state: currentState,
                    timestamp: Date.now(),
                    version: window.stateManager.getState('system.version', '1.0.0'),
                    slotName: slotName
                };
                
                // Serialize and save to localStorage
                const saveKey = `aidcraft_save_${slotName}`;
                localStorage.setItem(saveKey, JSON.stringify(saveObject));
                
                // Update save slot metadata
                this.updateSaveSlotMetadata(slotName, saveObject);
                
                console.log(`Game saved to slot: ${slotName}`);
                return true;
            } catch (error) {
                console.error('Failed to save game:', error);
                return false;
            }
        },
        
        /**
         * Load a saved game state from localStorage
         * @param {string} [slotName='default'] - Optional slot name to load
         * @returns {boolean} True if load was successful
         */
        loadGame: function(slotName = 'default') {
            try {
                // Get save data from localStorage
                const saveKey = `aidcraft_save_${slotName}`;
                const saveData = localStorage.getItem(saveKey);
                
                if (!saveData) {
                    console.error(`No save data found for slot: ${slotName}`);
                    return false;
                }
                
                // Parse saved state
                const saveObject = JSON.parse(saveData);
                
                // Check version compatibility
                const currentVersion = window.stateManager.getState('system.version', '1.0.0');
                if (!this.isVersionCompatible(saveObject.version, currentVersion)) {
                    console.warn(`Save version (${saveObject.version}) may not be compatible with current version (${currentVersion})`);
                    // Continue loading, but warn the user
                }
                
                // Load state into state manager
                window.stateManager.resetState();
                window.stateManager.setState('', saveObject.state);
                
                console.log(`Game loaded from slot: ${slotName}`);
                
                // Trigger loaded event for other components to react
                document.dispatchEvent(new CustomEvent('aidcraft:gameLoaded', {
                    detail: { slotName, timestamp: saveObject.timestamp }
                }));
                
                return true;
            } catch (error) {
                console.error('Failed to load game:', error);
                return false;
            }
        },
        
        /**
         * Check if save exists for a specific slot
         * @param {string} [slotName='default'] - Slot name to check
         * @returns {boolean} True if save exists
         */
        saveExists: function(slotName = 'default') {
            const saveKey = `aidcraft_save_${slotName}`;
            return localStorage.getItem(saveKey) !== null;
        },
        
        /**
         * Get information about a saved game
         * @param {string} [slotName='default'] - Slot name to get info for
         * @returns {Object|null} Save info object or null if not found
         */
        getSaveInfo: function(slotName = 'default') {
            try {
                const saveKey = `aidcraft_save_${slotName}`;
                const saveData = localStorage.getItem(saveKey);
                
                if (!saveData) {
                    return null;
                }
                
                const saveObject = JSON.parse(saveData);
                
                // Extract relevant info without the full state
                return {
                    slotName: saveObject.slotName,
                    timestamp: saveObject.timestamp,
                    version: saveObject.version,
                    date: new Date(saveObject.timestamp).toLocaleString(),
                    currentPhase: saveObject.state.currentPhase,
                    phaseProgress: saveObject.state.phaseProgress
                };
            } catch (error) {
                console.error('Failed to get save info:', error);
                return null;
            }
        },
        
        /**
         * Get list of all save slots
         * @returns {Array} Array of save slot info objects
         */
        getAllSaveSlots: function() {
            try {
                // Get save slot metadata
                const metadataKey = 'aidcraft_save_slots';
                const metadataJson = localStorage.getItem(metadataKey);
                
                if (!metadataJson) {
                    return [];
                }
                
                const metadata = JSON.parse(metadataJson);
                return Object.values(metadata);
            } catch (error) {
                console.error('Failed to get save slots:', error);
                return [];
            }
        },
        
        /**
         * Delete a saved game
         * @param {string} slotName - Slot name to delete
         * @returns {boolean} True if deletion was successful
         */
        deleteSave: function(slotName) {
            try {
                if (!slotName) {
                    console.error('No slot name provided for deletion');
                    return false;
                }
                
                const saveKey = `aidcraft_save_${slotName}`;
                
                // Check if save exists
                if (!localStorage.getItem(saveKey)) {
                    console.error(`No save found for slot: ${slotName}`);
                    return false;
                }
                
                // Delete save
                localStorage.removeItem(saveKey);
                
                // Update metadata
                this.removeSaveSlotMetadata(slotName);
                
                console.log(`Save deleted from slot: ${slotName}`);
                return true;
            } catch (error) {
                console.error('Failed to delete save:', error);
                return false;
            }
        },
        
        /**
         * Export the current game state as a JSON file
         * @param {string} [fileName='aidcraft_save'] - Optional file name
         * @returns {boolean} True if export was successful
         */
        exportSave: function(fileName = 'aidcraft_save') {
            try {
                // Get current state
                const currentState = window.stateManager.state;
                
                if (!currentState) {
                    console.error('No state available to export');
                    return false;
                }
                
                // Create export object
                const exportObject = {
                    state: currentState,
                    timestamp: Date.now(),
                    version: window.stateManager.getState('system.version', '1.0.0'),
                    exportDate: new Date().toISOString()
                };
                
                // Convert to JSON string
                const jsonString = JSON.stringify(exportObject, null, 2);
                
                // Create download link
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute('href', dataStr);
                downloadAnchorNode.setAttribute('download', `${fileName}.json`);
                
                // Add to document, click, and remove
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                
                console.log('Game state exported to file');
                return true;
            } catch (error) {
                console.error('Failed to export game:', error);
                return false;
            }
        },
        
        /**
         * Import a game state from a JSON file
         * @param {File} file - JSON file to import
         * @returns {Promise<boolean>} Promise resolving to true if import was successful
         */
        importSave: function(file) {
            return new Promise((resolve, reject) => {
                try {
                    if (!file) {
                        console.error('No file provided for import');
                        reject(new Error('No file provided'));
                        return;
                    }
                    
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        try {
                            // Parse the file content
                            const importObject = JSON.parse(event.target.result);
                            
                            // Validate import data
                            if (!importObject.state || !importObject.version) {
                                console.error('Invalid save file format');
                                reject(new Error('Invalid save file format'));
                                return;
                            }
                            
                            // Check version compatibility
                            const currentVersion = window.stateManager.getState('system.version', '1.0.0');
                            if (!this.isVersionCompatible(importObject.version, currentVersion)) {
                                console.warn(`Save version (${importObject.version}) may not be compatible with current version (${currentVersion})`);
                                // Continue import, but warn the user
                            }
                            
                            // Import state
                            window.stateManager.resetState();
                            window.stateManager.setState('', importObject.state);
                            
                            // Trigger imported event for other components to react
                            document.dispatchEvent(new CustomEvent('aidcraft:gameImported', {
                                detail: { 
                                    timestamp: importObject.timestamp,
                                    importDate: new Date().toISOString()
                                }
                            }));
                            
                            console.log('Game imported from file');
                            resolve(true);
                        } catch (parseError) {
                            console.error('Failed to parse import file:', parseError);
                            reject(parseError);
                        }
                    };
                    
                    reader.onerror = (error) => {
                        console.error('Error reading import file:', error);
                        reject(error);
                    };
                    
                    // Read the file as text
                    reader.readAsText(file);
                } catch (error) {
                    console.error('Failed to import game:', error);
                    reject(error);
                }
            });
        },
        
        /**
         * Create a quick save in the default slot
         * @returns {boolean} True if quick save was successful
         */
        quickSave: function() {
            return this.saveGame('quicksave');
        },
        
        /**
         * Load the quick save
         * @returns {boolean} True if quick load was successful
         */
        quickLoad: function() {
            return this.loadGame('quicksave');
        },
        
        /**
         * Check if versions are compatible
         * @param {string} saveVersion - Version from save
         * @param {string} currentVersion - Current application version
         * @returns {boolean} True if versions are compatible
         */
        isVersionCompatible: function(saveVersion, currentVersion) {
            // Simple version check - compare major version only
            const saveMajor = saveVersion.split('.')[0];
            const currentMajor = currentVersion.split('.')[0];
            
            return saveMajor === currentMajor;
        },
        
        /**
         * Update save slot metadata
         * @param {string} slotName - Slot name
         * @param {Object} saveObject - Save object
         * @private
         */
        updateSaveSlotMetadata: function(slotName, saveObject) {
            // Get existing metadata
            const metadataKey = 'aidcraft_save_slots';
            const metadataJson = localStorage.getItem(metadataKey);
            let metadata = {};
            
            if (metadataJson) {
                try {
                    metadata = JSON.parse(metadataJson);
                } catch (error) {
                    console.error('Failed to parse save slot metadata:', error);
                    metadata = {};
                }
            }
            
            // Update metadata for this slot
            metadata[slotName] = {
                slotName: slotName,
                timestamp: saveObject.timestamp,
                version: saveObject.version,
                date: new Date(saveObject.timestamp).toLocaleString(),
                currentPhase: saveObject.state.currentPhase,
                phaseProgress: saveObject.state.phaseProgress
            };
            
            // Save updated metadata
            localStorage.setItem(metadataKey, JSON.stringify(metadata));
        },
        
        /**
         * Remove a slot from metadata
         * @param {string} slotName - Slot name to remove
         * @private
         */
        removeSaveSlotMetadata: function(slotName) {
            // Get existing metadata
            const metadataKey = 'aidcraft_save_slots';
            const metadataJson = localStorage.getItem(metadataKey);
            
            if (!metadataJson) {
                return;
            }
            
            try {
                const metadata = JSON.parse(metadataJson);
                
                // Remove slot
                if (metadata[slotName]) {
                    delete metadata[slotName];
                }
                
                // Save updated metadata
                localStorage.setItem(metadataKey, JSON.stringify(metadata));
            } catch (error) {
                console.error('Failed to update save slot metadata:', error);
            }
        },
        
        /**
         * Clear all saved games
         * @returns {boolean} True if clear was successful
         */
        clearAllSaves: function() {
            try {
                // Get all save slots
                const saveSlots = this.getAllSaveSlots();
                
                // Delete each save
                saveSlots.forEach(slot => {
                    const saveKey = `aidcraft_save_${slot.slotName}`;
                    localStorage.removeItem(saveKey);
                });
                
                // Clear metadata
                localStorage.removeItem('aidcraft_save_slots');
                
                console.log('All saves cleared');
                return true;
            } catch (error) {
                console.error('Failed to clear all saves:', error);
                return false;
            }
        }
    };
    
    // Register the module
    window.saveLoad = SaveLoad;
})(); 