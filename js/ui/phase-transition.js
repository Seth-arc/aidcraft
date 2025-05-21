/**
 * AidCraft Workshop Simulation - Phase Transition
 * Handles transitions between simulation phases with context preservation.
 */

(function() {
  'use strict';

  /**
   * PhaseTransition - Manages transitions between simulation phases
   */
  const PhaseTransition = {
    initialized: false,
    stateManager: window.stateManager,
    gameEngine: window.gameEngine,
    dataLoader: window.dataLoader,
    currentPhase: null,
    phaseHistory: [],
    phaseSequence: ['analysis', 'funding', 'negotiation', 'outcome'],
    phaseTemplates: {
      analysis: 'templates/phases/analysis.html',
      funding: 'templates/phases/funding.html',
      negotiation: 'templates/phases/negotiation.html',
      outcome: 'templates/phases/outcome.html'
    },
    
    /**
     * Initialize the phase transition system
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve) => {
        console.log('Initializing Phase Transition...');
        
        // Get initial phase from state
        this.currentPhase = this.stateManager.getState('currentPhase', 'analysis');
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Initialize navigation controls
        this._initNavigationControls();
        
        this.initialized = true;
        console.log('Phase Transition initialized');
        resolve();
      });
    },
    
    /**
     * Navigate to a specific phase
     * @param {string} phase - Phase identifier
     * @returns {Promise} Promise that resolves when navigation is complete
     */
    navigateToPhase: function(phase) {
      if (!this.initialized) {
        return Promise.reject(new Error('Phase Transition not initialized'));
      }
      
      if (!this.phaseSequence.includes(phase)) {
        return Promise.reject(new Error(`Invalid phase: ${phase}`));
      }
      
      const previousPhase = this.currentPhase;
      
      // Check if we can exit the current phase
      if (previousPhase && !this._canExitPhase(previousPhase)) {
        console.log(`Cannot exit ${previousPhase} phase yet - completion criteria not met`);
        
        if (window.uiInteractions) {
          window.uiInteractions.showNotification(
            'You must complete all required tasks before proceeding to the next phase.',
            'warning'
          );
        }
        
        return Promise.reject(new Error('Phase exit criteria not met'));
      }
      
      console.log(`Navigating from ${previousPhase || 'none'} to ${phase}`);
      
      // Save current phase to history if transitioning to a different phase
      if (previousPhase && previousPhase !== phase) {
        this._addToPhaseHistory(previousPhase);
      }
      
      // Update current phase
      this.currentPhase = phase;
      this.stateManager.setState('currentPhase', phase);
      
      // Update UI to reflect current phase
      this._updatePhaseIndicator();
      
      // Load the phase template
      return this._loadPhaseTemplate(phase)
        .then(html => {
          // Insert the template into the content area
          const contentContainer = document.getElementById('simulation-content');
          if (contentContainer) {
            contentContainer.innerHTML = html;
          }
          
          // Initialize phase-specific JavaScript
          return this._initPhaseModule(phase);
        })
        .then(() => {
          // Dispatch phase change event
          document.dispatchEvent(new CustomEvent('aidcraft:phasechange', {
            detail: {
              previousPhase: previousPhase,
              newPhase: phase
            }
          }));
          
          // Start the timer for this phase if available
          if (window.phaseTimer) {
            window.phaseTimer.startTimer(phase);
          }
          
          return Promise.resolve();
        })
        .catch(error => {
          console.error(`Error navigating to phase ${phase}:`, error);
          return Promise.reject(error);
        });
    },
    
    /**
     * Navigate to the next phase in sequence
     * @returns {Promise} Promise that resolves when navigation is complete
     */
    navigateToNextPhase: function() {
      if (!this.currentPhase) {
        return this.navigateToPhase(this.phaseSequence[0]);
      }
      
      const currentIndex = this.phaseSequence.indexOf(this.currentPhase);
      
      if (currentIndex < 0 || currentIndex >= this.phaseSequence.length - 1) {
        console.log('Already at the last phase or invalid phase');
        return Promise.reject(new Error('Cannot navigate to next phase'));
      }
      
      const nextPhase = this.phaseSequence[currentIndex + 1];
      return this.navigateToPhase(nextPhase);
    },
    
    /**
     * Navigate to the previous phase in sequence
     * @returns {Promise} Promise that resolves when navigation is complete
     */
    navigateToPreviousPhase: function() {
      if (!this.currentPhase) {
        return Promise.reject(new Error('No current phase'));
      }
      
      const currentIndex = this.phaseSequence.indexOf(this.currentPhase);
      
      if (currentIndex <= 0) {
        console.log('Already at the first phase or invalid phase');
        return Promise.reject(new Error('Cannot navigate to previous phase'));
      }
      
      const prevPhase = this.phaseSequence[currentIndex - 1];
      return this.navigateToPhase(prevPhase);
    },
    
    /**
     * Get phase completion status
     * @param {string} phase - Phase identifier
     * @returns {boolean} Whether phase is complete
     */
    isPhaseComplete: function(phase) {
      if (!this.gameEngine) {
        return false;
      }
      
      return this.gameEngine.checkPhaseCompletionCriteria(phase);
    },
    
    /**
     * Add current phase state to history
     * @param {string} phase - Phase to save
     * @private
     */
    _addToPhaseHistory: function(phase) {
      const phaseState = {
        phase: phase,
        timestamp: Date.now(),
        decisions: this.stateManager.getState('decisions', {}),
        resources: this.stateManager.getState('resources', {}),
        relationships: this.stateManager.getState('stakeholderRelationships', {})
      };
      
      this.phaseHistory.push(phaseState);
      
      // Save to state manager
      this.stateManager.setState('phaseHistory', this.phaseHistory);
      
      console.log(`Added ${phase} to phase history`);
    },
    
    /**
     * Check if the current phase can be exited
     * @param {string} phase - Phase to check
     * @returns {boolean} Whether phase can be exited
     * @private
     */
    _canExitPhase: function(phase) {
      // If we're navigating back, always allow it
      if (this.navigatingBackward) {
        return true;
      }
      
      // If going to outcome phase, always allow it
      if (this.phaseSequence.indexOf(this.currentPhase) < this.phaseSequence.indexOf('outcome')) {
        return true;
      }
      
      // Check phase completion criteria
      return this.isPhaseComplete(phase);
    },
    
    /**
     * Load the template for a phase
     * @param {string} phase - Phase identifier
     * @returns {Promise<string>} Promise resolving to the template HTML
     * @private
     */
    _loadPhaseTemplate: function(phase) {
      const templatePath = this.phaseTemplates[phase];
      
      if (!templatePath) {
        return Promise.reject(new Error(`No template found for phase: ${phase}`));
      }
      
      return fetch(templatePath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .catch(error => {
          console.error(`Error loading phase template for ${phase}:`, error);
          
          // Fallback template if load fails
          return `
            <div class="phase-container phase-${phase}">
              <h1 class="phase-title">${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase</h1>
              <p class="phase-error">Failed to load phase content. Please try refreshing the page.</p>
            </div>
          `;
        });
    },
    
    /**
     * Initialize the phase-specific module
     * @param {string} phase - Phase identifier
     * @returns {Promise} Promise that resolves when initialization is complete
     * @private
     */
    _initPhaseModule: function(phase) {
      const phaseModule = window[`${phase}Phase`];
      
      if (phaseModule && typeof phaseModule.init === 'function') {
        return Promise.resolve(phaseModule.init());
      }
      
      return Promise.resolve();
    },
    
    /**
     * Update the phase indicator in the UI
     * @private
     */
    _updatePhaseIndicator: function() {
      const phaseNameElement = document.getElementById('phase-name');
      
      if (phaseNameElement && this.currentPhase) {
        // Get phase title from data if available
        let phaseTitle = this.currentPhase.charAt(0).toUpperCase() + this.currentPhase.slice(1);
        
        if (this.dataLoader) {
          const phaseConfig = this.dataLoader.getPhaseConfig(this.currentPhase);
          if (phaseConfig && phaseConfig.title) {
            phaseTitle = phaseConfig.title;
          }
        }
        
        phaseNameElement.textContent = phaseTitle;
      }
      
      // Update navigation button states
      this._updateNavigationControls();
    },
    
    /**
     * Initialize navigation controls
     * @private
     */
    _initNavigationControls: function() {
      const prevButton = document.getElementById('prev-phase');
      const nextButton = document.getElementById('next-phase');
      
      if (prevButton) {
        prevButton.addEventListener('click', () => {
          this.navigatingBackward = true;
          this.navigateToPreviousPhase()
            .catch(error => console.error('Error navigating to previous phase:', error))
            .finally(() => {
              this.navigatingBackward = false;
            });
        });
      }
      
      if (nextButton) {
        nextButton.addEventListener('click', () => {
          this.navigateToNextPhase()
            .catch(error => console.error('Error navigating to next phase:', error));
        });
      }
      
      this._updateNavigationControls();
    },
    
    /**
     * Update navigation control states
     * @private
     */
    _updateNavigationControls: function() {
      const prevButton = document.getElementById('prev-phase');
      const nextButton = document.getElementById('next-phase');
      
      if (!this.currentPhase) return;
      
      const currentIndex = this.phaseSequence.indexOf(this.currentPhase);
      
      // Update prev button
      if (prevButton) {
        if (currentIndex <= 0) {
          prevButton.disabled = true;
          prevButton.classList.add('btn-disabled');
        } else {
          prevButton.disabled = false;
          prevButton.classList.remove('btn-disabled');
        }
      }
      
      // Update next button
      if (nextButton) {
        const isLastPhase = currentIndex >= this.phaseSequence.length - 1;
        const isPhaseComplete = this.isPhaseComplete(this.currentPhase);
        
        if (isLastPhase) {
          nextButton.disabled = true;
          nextButton.classList.add('btn-disabled');
        } else if (!isPhaseComplete && this.currentPhase !== 'outcome') {
          nextButton.disabled = false;
          nextButton.classList.add('btn-warning');
          nextButton.textContent = 'Skip to Next Phase';
        } else {
          nextButton.disabled = false;
          nextButton.classList.remove('btn-disabled', 'btn-warning');
          nextButton.textContent = 'Next Phase';
        }
      }
    },
    
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Listen for phase completion to update navigation
      document.addEventListener('aidcraft:decisionprocessed', () => {
        this._updateNavigationControls();
      });
      
      // Listen for direct phase navigation events
      document.addEventListener('aidcraft:navigatephase', (event) => {
        const { phase } = event.detail;
        this.navigateToPhase(phase)
          .catch(error => console.error(`Error navigating to phase ${phase}:`, error));
      });
    }
  };
  
  // Make PhaseTransition available globally
  window.phaseTransition = PhaseTransition;
})(); 