/**
 * AidCraft Workshop Simulation - Storage Manager
 * 
 * Manages client-side data storage using localStorage.
 * Handles user data persistence, session management, and game saves.
 */

(function() {
    'use strict';

    /**
     * Storage Manager Module
     */
    const StorageManager = {
        initialized: false,
        storagePrefix: 'aidcraft_',
        storageEnabled: false,

        /**
         * Initialize the storage manager
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }
            
            return new Promise((resolve) => {
                console.log('Initializing Storage Manager...');
                
                // Check if localStorage is available
                this.storageEnabled = this._checkStorageAvailability();
                
                this.initialized = true;
                console.log('Storage Manager initialized');
                resolve();
            });
        },

        /**
         * Save data to localStorage
         * @param {string} key - Storage key (will be prefixed)
         * @param {any} data - Data to store (will be JSON stringified)
         * @returns {boolean} Success or failure
         */
        saveData: function(key, data) {
            if (!this.initialized || !this.storageEnabled) {
                console.error('Storage not available');
                return false;
            }
            
            try {
                const prefixedKey = this.storagePrefix + key;
                const serializedData = JSON.stringify(data);
                
                localStorage.setItem(prefixedKey, serializedData);
                return true;
            } catch (error) {
                console.error('Error saving data:', error);
                return false;
            }
        },

        /**
         * Load data from localStorage
         * @param {string} key - Storage key (will be prefixed)
         * @param {any} defaultValue - Default value if key doesn't exist
         * @returns {any} Parsed data or default value
         */
        loadData: function(key, defaultValue = null) {
            if (!this.initialized || !this.storageEnabled) {
                return defaultValue;
            }
            
            try {
                const prefixedKey = this.storagePrefix + key;
                const serializedData = localStorage.getItem(prefixedKey);
                
                if (serializedData === null) {
                    return defaultValue;
                }
                
                return JSON.parse(serializedData);
            } catch (error) {
                console.error('Error loading data:', error);
                return defaultValue;
            }
        },

        /**
         * Remove data from localStorage
         * @param {string} key - Storage key (will be prefixed)
         * @returns {boolean} Success or failure
         */
        removeData: function(key) {
            if (!this.initialized || !this.storageEnabled) {
                return false;
            }
            
            try {
                const prefixedKey = this.storagePrefix + key;
                localStorage.removeItem(prefixedKey);
                return true;
            } catch (error) {
                console.error('Error removing data:', error);
                return false;
            }
        },

        /**
         * Clear all AidCraft data from localStorage
         * @returns {boolean} Success or failure
         */
        clearAllData: function() {
            if (!this.initialized || !this.storageEnabled) {
                return false;
            }
            
            try {
                // Only remove keys with the AidCraft prefix
                const keysToRemove = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.storagePrefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                return true;
            } catch (error) {
                console.error('Error clearing data:', error);
                return false;
            }
        },

        /**
         * Export all AidCraft data to a JSON object
         * @returns {Object} All AidCraft data as an object
         */
        exportData: function() {
            if (!this.initialized || !this.storageEnabled) {
                return {};
            }
            
            try {
                const exportData = {};
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.storagePrefix)) {
                        const unprefixedKey = key.substring(this.storagePrefix.length);
                        exportData[unprefixedKey] = this.loadData(unprefixedKey);
                    }
                }
                
                return exportData;
            } catch (error) {
                console.error('Error exporting data:', error);
                return {};
            }
        },

        /**
         * Import data from a JSON object
         * @param {Object} data - Data to import
         * @param {boolean} overwrite - Whether to overwrite existing data
         * @returns {boolean} Success or failure
         */
        importData: function(data, overwrite = false) {
            if (!this.initialized || !this.storageEnabled || !data) {
                return false;
            }
            
            try {
                const keys = Object.keys(data);
                
                for (const key of keys) {
                    // Check if key exists and we're not overwriting
                    if (!overwrite && this.loadData(key) !== null) {
                        continue;
                    }
                    
                    this.saveData(key, data[key]);
                }
                
                return true;
            } catch (error) {
                console.error('Error importing data:', error);
                return false;
            }
        },

        /**
         * Check if localStorage is available
         * @returns {boolean} Whether localStorage is available
         * @private
         */
        _checkStorageAvailability: function() {
            try {
                const testKey = this.storagePrefix + 'test';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                return true;
            } catch (error) {
                console.warn('localStorage not available:', error);
                return false;
            }
        },

        /**
         * Storage keys
         */
        KEYS: {
            STATE: 'aidcraft_state',
            USER_PROFILE: 'aidcraft_user_profile',
            GAME_SAVES: 'aidcraft_saves',
            SETTINGS: 'aidcraft_settings',
            SESSION: 'aidcraft_session'
        },

        /**
         * Save user profile data
         * @param {object} profileData - User profile data
         * @returns {boolean} True if save was successful
         */
        saveUserProfile: function(profileData) {
            return this.saveData(this.KEYS.USER_PROFILE, profileData);
        },

        /**
         * Load user profile data
         * @returns {object|null} User profile data or null if not found
         */
        loadUserProfile: function() {
            return this.loadData(this.KEYS.USER_PROFILE, null);
        },

        /**
         * Save application settings
         * @param {object} settings - Application settings
         * @returns {boolean} True if save was successful
         */
        saveSettings: function(settings) {
            return this.saveData(this.KEYS.SETTINGS, settings);
        },

        /**
         * Load application settings
         * @returns {object} Application settings
         */
        loadSettings: function() {
            return this.loadData(this.KEYS.SETTINGS, {
                soundEnabled: true,
                musicEnabled: true,
                tutorialEnabled: true,
                highContrastMode: false,
                largeTextMode: false,
                animationsReduced: false
            });
        },

        /**
         * Save a named game state
         * @param {string} saveName - Name of the save
         * @param {object} stateData - Game state data
         * @returns {boolean} True if save was successful
         */
        saveGameState: function(saveName, stateData) {
            if (!saveName) {
                console.error('Cannot save game state without a name');
                return false;
            }
            
            // Load existing saves
            const saves = this.loadData(this.KEYS.GAME_SAVES, {});
            
            // Add/update this save
            saves[saveName] = {
                state: stateData,
                timestamp: Date.now(),
                version: stateData.system?.version || '1.0.0'
            };
            
            // Save back to storage
            return this.saveData(this.KEYS.GAME_SAVES, saves);
        },

        /**
         * Load a named game state
         * @param {string} saveName - Name of the save to load
         * @returns {object|null} Game state data or null if not found
         */
        loadGameState: function(saveName) {
            if (!saveName) {
                console.error('Cannot load game state without a name');
                return null;
            }
            
            // Load all saves
            const saves = this.loadData(this.KEYS.GAME_SAVES, {});
            
            // Find the requested save
            const save = saves[saveName];
            
            if (!save) {
                console.warn(`Save "${saveName}" not found`);
                return null;
            }
            
            return save.state;
        },

        /**
         * Get a list of available game saves
         * @returns {object} Object with save names as keys and metadata as values
         */
        getGameSaves: function() {
            const saves = this.loadData(this.KEYS.GAME_SAVES, {});
            
            // Create metadata-only version (without full state)
            const savesMetadata = {};
            
            for (const [name, save] of Object.entries(saves)) {
                savesMetadata[name] = {
                    timestamp: save.timestamp,
                    version: save.version,
                    phase: save.state?.currentPhase || 'unknown'
                };
            }
            
            return savesMetadata;
        },

        /**
         * Delete a game save
         * @param {string} saveName - Name of the save to delete
         * @returns {boolean} True if deletion was successful
         */
        deleteGameSave: function(saveName) {
            if (!saveName) {
                console.error('Cannot delete game save without a name');
                return false;
            }
            
            // Load existing saves
            const saves = this.loadData(this.KEYS.GAME_SAVES, {});
            
            // Check if save exists
            if (!saves[saveName]) {
                console.warn(`Save "${saveName}" not found, nothing to delete`);
                return false;
            }
            
            // Remove the save
            delete saves[saveName];
            
            // Save back to storage
            return this.saveData(this.KEYS.GAME_SAVES, saves);
        },

        /**
         * Export all data to a JSON file
         * @returns {string} Data URL for the exported JSON file
         */
        exportAllData: function() {
            const exportData = {
                profile: this.loadUserProfile(),
                settings: this.loadSettings(),
                saves: this.loadData(this.KEYS.GAME_SAVES, {}),
                currentState: this.loadData(this.KEYS.STATE, {}),
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            return dataUri;
        },

        /**
         * Initialize session tracking
         * @private
         */
        _initSession: function() {
            if (!this.storageEnabled) {
                return;
            }
            
            // Load or create session data
            const sessionData = this.loadData(this.KEYS.SESSION, {
                id: this._generateSessionId(),
                startTime: Date.now(),
                visits: 0,
                lastVisit: null
            });
            
            // Update session data
            sessionData.visits++;
            sessionData.lastVisit = Date.now();
            
            // Save updated session
            this.saveData(this.KEYS.SESSION, sessionData);
        },

        /**
         * Generate a unique session ID
         * @returns {string} Unique session ID
         * @private
         */
        _generateSessionId: function() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    };

    // Expose the storage manager globally
    window.storageManager = StorageManager;
})(); 