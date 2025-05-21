/**
 * AidCraft Workshop Simulation - Data Loader
 * Handles loading and validation of game data from JSON files.
 */

(function() {
  'use strict';

  /**
   * DataLoader - Handles the loading and validation of simulation data
   */
  const DataLoader = {
    initialized: false,
    gameData: null,
    dataPath: 'assets/data/aidcraft_game_data.json',
    
    /**
     * Initialize the data loader
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve(this.gameData);
      }
      
      return this.loadData();
    },
    
    /**
     * Load game data from JSON file
     * @returns {Promise} Promise that resolves with loaded game data
     */
    loadData: function() {
      return new Promise((resolve, reject) => {
        console.log('Loading game data...');
        
        fetch(this.dataPath)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load game data: ${response.status} ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            // Validate data structure
            if (!this.validateGameData(data)) {
              throw new Error('Invalid game data format');
            }
            
            this.gameData = data;
            this.initialized = true;
            console.log('Game data loaded successfully');
            resolve(this.gameData);
          })
          .catch(error => {
            console.error('Error loading game data:', error);
            reject(error);
          });
      });
    },
    
    /**
     * Validate the loaded game data structure
     * @param {Object} data - Game data to validate
     * @returns {boolean} Whether the data is valid
     */
    validateGameData: function(data) {
      // Check top-level required objects
      if (!data || typeof data !== 'object') {
        console.error('Game data must be an object');
        return false;
      }
      
      // Check for required sections
      const requiredSections = ['meta', 'stakeholders', 'phases', 'decisions', 'events'];
      for (const section of requiredSections) {
        if (!data[section] || typeof data[section] !== 'object') {
          console.error(`Missing or invalid required section: ${section}`);
          return false;
        }
      }
      
      // Check meta data
      if (!data.meta.version || !data.meta.title) {
        console.error('Meta data missing required fields');
        return false;
      }
      
      // Validate stakeholders
      if (Object.keys(data.stakeholders).length === 0) {
        console.error('No stakeholders defined');
        return false;
      }
      
      // Validate phases
      const requiredPhases = ['analysis', 'funding', 'negotiation', 'outcome'];
      for (const phase of requiredPhases) {
        if (!data.phases[phase]) {
          console.error(`Missing required phase: ${phase}`);
          return false;
        }
      }
      
      // Basic validation - a more comprehensive validation would check all data structures
      return true;
    },
    
    /**
     * Get a list of all stakeholders
     * @returns {Object} Stakeholders object
     */
    getStakeholders: function() {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return {};
      }
      return this.gameData.stakeholders;
    },
    
    /**
     * Get a single stakeholder by ID
     * @param {string} stakeholderId - Stakeholder ID
     * @returns {Object|null} Stakeholder data or null if not found
     */
    getStakeholder: function(stakeholderId) {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return null;
      }
      return this.gameData.stakeholders[stakeholderId] || null;
    },
    
    /**
     * Get all decisions
     * @returns {Object} Decisions object
     */
    getDecisions: function() {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return {};
      }
      return this.gameData.decisions;
    },
    
    /**
     * Get a single decision by ID
     * @param {string} decisionId - Decision ID
     * @returns {Object|null} Decision data or null if not found
     */
    getDecision: function(decisionId) {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return null;
      }
      return this.gameData.decisions[decisionId] || null;
    },
    
    /**
     * Get all decisions for a specific phase
     * @param {string} phase - Phase name
     * @returns {Object} Phase-specific decisions
     */
    getPhaseDecisions: function(phase) {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return {};
      }
      
      const phaseDecisions = {};
      Object.entries(this.gameData.decisions).forEach(([id, decision]) => {
        if (decision.phase === phase) {
          phaseDecisions[id] = decision;
        }
      });
      
      return phaseDecisions;
    },
    
    /**
     * Get all events
     * @returns {Object} Events object
     */
    getEvents: function() {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return {};
      }
      return this.gameData.events;
    },
    
    /**
     * Get a single event by ID
     * @param {string} eventId - Event ID
     * @returns {Object|null} Event data or null if not found
     */
    getEvent: function(eventId) {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return null;
      }
      return this.gameData.events[eventId] || null;
    },
    
    /**
     * Get phase configuration
     * @param {string} phase - Phase name
     * @returns {Object|null} Phase configuration or null if not found
     */
    getPhaseConfig: function(phase) {
      if (!this.initialized || !this.gameData) {
        console.error('Data not loaded');
        return null;
      }
      return this.gameData.phases[phase] || null;
    }
  };
  
  // Make DataLoader available globally
  window.dataLoader = DataLoader;
})(); 