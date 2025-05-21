/**
 * AidCraft Workshop Simulation - State Manager
 * Responsible for managing the global state of the simulation, providing
 * controlled access to read and update state, and handling persistence.
 */

(function() {
    'use strict';

    // Default initial state
    const DEFAULT_STATE = {
        // Current simulation state
        currentPhase: 'analysis', // analysis, funding, negotiation, outcome
        phaseProgress: {
            analysis: 0,
            funding: 0,
            negotiation: 0,
            outcome: 0
        },
        
        // Player choices and decisions
        decisions: {},
        
        // Stakeholder relationships
        stakeholderRelationships: {},
        
        // Resources and metrics
        resources: {
            budget: 1000000,
            politicalCapital: 75,
            timeRemaining: 6 // in months
        },
        
        // User profile
        user: {
            id: null,
            name: 'Workshop Participant',
            completedSimulations: 0,
            currentProgress: 0
        },
        
        // System state
        system: {
            initialized: false,
            lastSaved: null,
            version: '1.0.0'
        }
    };

    /**
     * StateManager - Manages the global state for the AidCraft simulation
     */
    const StateManager = {
        state: JSON.parse(JSON.stringify(DEFAULT_STATE)),
        
        /**
         * Initialize the state manager
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            return new Promise((resolve) => {
                console.log('Initializing State Manager...');
                
                // Try to load saved state
                this.loadState();
                
                // Mark as initialized
                this.setState('system.initialized', true);
                this.setState('system.lastSaved', Date.now());
                
                console.log('State Manager initialized');
                resolve();
            });
        },
        
        /**
         * Get a value from state by path
         * @param {string} path - Dot notation path to the state value
         * @param {*} defaultValue - Default value to return if path doesn't exist
         * @returns {*} Value at path or defaultValue if not found
         */
        getState: function(path, defaultValue = null) {
            if (!path) return this.state;
            
            const keys = path.split('.');
            let value = this.state;
            
            for (const key of keys) {
                if (value === undefined || value === null || !Object.prototype.hasOwnProperty.call(value, key)) {
                    return defaultValue;
                }
                value = value[key];
            }
            
            return value;
        },
        
        /**
         * Set a value in state by path
         * @param {string} path - Dot notation path to set
         * @param {*} value - Value to set
         * @param {boolean} persist - Whether to persist state after update (default: false)
         */
        setState: function(path, value, persist = false) {
            if (!path) {
                console.error('Path is required for setState');
                return;
            }
            
            const keys = path.split('.');
            const lastKey = keys.pop();
            let target = this.state;
            
            // Navigate to the final object that will contain the property
            for (const key of keys) {
                if (!Object.prototype.hasOwnProperty.call(target, key) || target[key] === null || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                target = target[key];
            }
            
            // Update the value
            target[lastKey] = value;
            
            // Dispatch state change event
            document.dispatchEvent(new CustomEvent('aidcraft:statechange', {
                detail: {
                    path: path,
                    value: value
                }
            }));
            
            // Persist if requested
            if (persist) {
                this.saveState();
            }
        },
        
        /**
         * Reset the state to default values
         * @param {boolean} persist - Whether to persist after reset (default: true)
         */
        resetState: function(persist = true) {
            this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            
            document.dispatchEvent(new CustomEvent('aidcraft:resetstate', {
                detail: { timestamp: Date.now() }
            }));
            
            if (persist) {
                this.saveState();
            }
        },
        
        /**
         * Save state to localStorage
         * @returns {boolean} Success or failure
         */
        saveState: function() {
            try {
                // Update last saved timestamp
                this.state.system.lastSaved = Date.now();
                
                // Serialize and save
                localStorage.setItem('aidcraft_state', JSON.stringify(this.state));
                console.log('State saved to localStorage');
                return true;
            } catch (error) {
                console.error('Failed to save state:', error);
                return false;
            }
        },
        
        /**
         * Load state from localStorage
         * @returns {boolean} Success or failure
         */
        loadState: function() {
            try {
                const savedState = localStorage.getItem('aidcraft_state');
                
                if (savedState) {
                    this.state = JSON.parse(savedState);
                    console.log('State loaded from localStorage');
                    return true;
                }
                
                console.log('No saved state found, using default state');
                return false;
            } catch (error) {
                console.error('Failed to load state:', error);
                return false;
            }
        },
        
        /**
         * Create a snapshot of the current state
         * @returns {Object} Copy of the current state
         */
        createSnapshot: function() {
            return JSON.parse(JSON.stringify(this.state));
        }
    };
    
    // Make StateManager available globally
    window.stateManager = StateManager;
})(); 