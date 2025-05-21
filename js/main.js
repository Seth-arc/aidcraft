/**
 * AidCraft Workshop Simulation - Main Application
 * Entry point for the simulation application, handles initialization sequence.
 */

(function() {
    'use strict';

    /**
     * Main application object
     */
    const AidCraft = {
        /**
         * Initialize the application
         */
        init: function() {
            console.log('Initializing AidCraft Workshop Simulation...');
            
            // Show loading indicator
            this.showLoadingIndicator();
            
            // Initialize core systems in sequence
            this.initializeSystems()
                .then(() => {
                    // Initialize UI components
                    return this.initializeUI();
                })
                .then(() => {
                    // Navigate to starting phase
                    this.navigateToInitialPhase();
                    
                    // Hide loading indicator
                    this.hideLoadingIndicator();
                    
                    console.log('AidCraft Workshop Simulation initialized successfully');
                })
                .catch(error => {
                    console.error('Initialization failed:', error);
                    this.showErrorMessage('Failed to initialize simulation. Please refresh the page and try again.');
                });
        },
        
        /**
         * Initialize core systems in correct sequence
         * @returns {Promise} Promise that resolves when all systems are initialized
         */
        initializeSystems: function() {
            // Sequence matters here, each system depends on the previous one
            return window.stateManager.init()
                .then(() => window.dataLoader.init())
                .then(() => {
                    if (window.eventSystem) {
                        return window.eventSystem.init();
                    }
                    return Promise.resolve();
                })
                .then(() => window.gameEngine.init());
        },
        
        /**
         * Initialize UI components
         * @returns {Promise} Promise that resolves when UI components are initialized
         */
        initializeUI: function() {
            const uiInitPromises = [
                // Initialize UI components in parallel
                window.phaseTimer ? window.phaseTimer.init() : Promise.resolve(),
                window.userProfile ? window.userProfile.init() : Promise.resolve()
            ];
            
            return Promise.all(uiInitPromises);
        },
        
        /**
         * Navigate to the initial phase
         */
        navigateToInitialPhase: function() {
            // Determine the current phase from state or default to 'analysis'
            const currentPhase = window.stateManager.getState('currentPhase', 'analysis');
            
            // Check if phase transition system is available
            if (window.phaseTransition) {
                window.phaseTransition.navigateToPhase(currentPhase);
            } else {
                console.error('Phase transition system not available');
                // Fallback to manually loading phase content
                this.loadPhaseContent(currentPhase);
            }
        },
        
        /**
         * Fallback method to load phase content directly
         * @param {string} phase - Phase to load
         */
        loadPhaseContent: function(phase) {
            const contentContainer = document.getElementById('simulation-content');
            
            if (!contentContainer) {
                console.error('Content container not found');
                return;
            }
            
            // Set phase name in UI
            const phaseNameElement = document.getElementById('phase-name');
            if (phaseNameElement) {
                phaseNameElement.textContent = phase.charAt(0).toUpperCase() + phase.slice(1) + ' Phase';
            }
            
            // Load phase content
            fetch(`templates/phases/${phase}.html`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load phase template: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    contentContainer.innerHTML = html;
                    
                    // Initialize phase-specific JS
                    const phaseModule = window[`${phase}Phase`];
                    if (phaseModule && typeof phaseModule.init === 'function') {
                        phaseModule.init();
                    }
                    
                    // Start phase timer if available
                    if (window.phaseTimer) {
                        window.phaseTimer.startTimer(phase);
                    }
                })
                .catch(error => {
                    console.error(`Error loading phase content: ${error}`);
                    contentContainer.innerHTML = `<div class="error-message">Failed to load ${phase} phase content.</div>`;
                });
        },
        
        /**
         * Show loading indicator
         */
        showLoadingIndicator: function() {
            // Create loading overlay if it doesn't exist
            let loadingOverlay = document.getElementById('loading-overlay');
            
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'loading-overlay';
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading AidCraft Simulation...</p>
                `;
                document.body.appendChild(loadingOverlay);
            } else {
                loadingOverlay.style.display = 'flex';
            }
        },
        
        /**
         * Hide loading indicator
         */
        hideLoadingIndicator: function() {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        },
        
        /**
         * Show error message
         * @param {string} message - Error message to display
         */
        showErrorMessage: function(message) {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.innerHTML = `
                    <div class="error-icon">⚠️</div>
                    <p class="error-text">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                `;
                loadingOverlay.classList.add('error-state');
                loadingOverlay.style.display = 'flex';
            } else {
                alert(message);
            }
        }
    };
    
    // Initialize AidCraft when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        AidCraft.init();
    });
    
    // Make AidCraft available globally
    window.aidcraft = AidCraft;
})(); 