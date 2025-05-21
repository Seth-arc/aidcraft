/**
 * AidCraft Workshop Simulation - Game Engine
 * Core game mechanics and logic for processing decisions and calculating outcomes.
 */

(function() {
  'use strict';

  /**
   * Game Engine - Handles core simulation mechanics and calculations
   */
  const GameEngine = {
    initialized: false,
    stateManager: window.stateManager,
    gameData: null,
    
    /**
     * Initialize the game engine
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        console.log('Initializing Game Engine...');
        
        // Load game data first
        if (window.dataLoader) {
          window.dataLoader.loadData()
            .then(data => {
              this.gameData = data;
              
              // Initialize event listeners
              this._setupEventListeners();
              
              this.initialized = true;
              console.log('Game Engine initialized');
              resolve();
            })
            .catch(error => {
              console.error('Failed to initialize Game Engine:', error);
              reject(error);
            });
        } else {
          console.error('Data Loader not available');
          reject(new Error('Data Loader not available'));
        }
      });
    },
    
    /**
     * Process a player decision
     * @param {string} decisionId - ID of the decision
     * @param {string} choiceId - ID of the chosen option
     * @returns {Object} Effects and outcomes of the decision
     */
    processDecision: function(decisionId, choiceId) {
      if (!this.initialized || !this.gameData) {
        console.error('Game Engine not initialized');
        return null;
      }
      
      console.log(`Processing decision: ${decisionId}, choice: ${choiceId}`);
      
      // Find the decision and choice in game data
      const decision = this.gameData.decisions[decisionId];
      if (!decision) {
        console.error(`Decision not found: ${decisionId}`);
        return null;
      }
      
      const choice = decision.choices.find(c => c.id === choiceId);
      if (!choice) {
        console.error(`Choice not found: ${choiceId} in decision ${decisionId}`);
        return null;
      }
      
      // Record the decision in state
      this.stateManager.setState(`decisions.${decisionId}`, choiceId);
      
      // Apply immediate effects
      const effects = {};
      
      if (choice.effects) {
        // Apply resource changes
        if (choice.effects.resources) {
          effects.resources = this.applyResourceChanges(choice.effects.resources);
        }
        
        // Apply stakeholder relationship changes
        if (choice.effects.stakeholderRelationships) {
          effects.stakeholderRelationships = this.updateStakeholderRelationships(choice.effects.stakeholderRelationships);
        }
        
        // Apply hidden debt changes if present
        if (choice.effects.hiddenDebt) {
          effects.hiddenDebt = this.applyHiddenDebtChanges(choice.effects.hiddenDebt);
        }
      }
      
      // Check for triggered events
      if (choice.triggersEvents && choice.triggersEvents.length > 0) {
        effects.triggeredEvents = [];
        
        choice.triggersEvents.forEach(eventId => {
          if (window.eventSystem) {
            window.eventSystem.queueEvent(eventId);
            effects.triggeredEvents.push(eventId);
          }
        });
      }
      
      // Check if phase completion criteria are met
      const currentPhase = this.stateManager.getState('currentPhase');
      if (currentPhase) {
        const isPhaseComplete = this.checkPhaseCompletionCriteria(currentPhase);
        effects.phaseComplete = isPhaseComplete;
      }
      
      // Dispatch decision processed event
      document.dispatchEvent(new CustomEvent('aidcraft:decisionprocessed', {
        detail: {
          decisionId,
          choiceId,
          effects
        }
      }));
      
      return effects;
    },
    
    /**
     * Apply changes to resources
     * @param {Object} resourceChanges - Resource changes to apply
     * @returns {Object} Updated resources
     */
    applyResourceChanges: function(resourceChanges) {
      const currentResources = this.stateManager.getState('resources', {});
      const updatedResources = { ...currentResources };
      
      // Apply each resource change
      Object.entries(resourceChanges).forEach(([resource, change]) => {
        const currentValue = updatedResources[resource] || 0;
        
        // Handle percentage changes
        if (typeof change === 'string' && change.includes('%')) {
          const percentChange = parseFloat(change.replace('%', ''));
          updatedResources[resource] = currentValue * (1 + (percentChange / 100));
        } else {
          // Handle absolute changes
          updatedResources[resource] = currentValue + change;
        }
        
        // Ensure values are within valid ranges
        if (resource === 'budget' && updatedResources[resource] < 0) {
          updatedResources[resource] = 0;
        }
        
        if (resource === 'politicalCapital') {
          updatedResources[resource] = Math.min(Math.max(updatedResources[resource], 0), 100);
        }
      });
      
      // Update state with new resource values
      this.stateManager.setState('resources', updatedResources);
      
      return updatedResources;
    },
    
    /**
     * Update stakeholder relationships based on changes
     * @param {Object} relationshipChanges - Relationship changes to apply
     * @returns {Object} Updated stakeholder relationships
     */
    updateStakeholderRelationships: function(relationshipChanges) {
      const currentRelationships = this.stateManager.getState('stakeholderRelationships', {});
      const updatedRelationships = { ...currentRelationships };
      
      // Apply each relationship change
      Object.entries(relationshipChanges).forEach(([stakeholder, change]) => {
        if (!updatedRelationships[stakeholder]) {
          updatedRelationships[stakeholder] = { strength: 0.5, type: 'neutral' };
        }
        
        // Update relationship strength
        if (change.strength !== undefined) {
          const currentStrength = updatedRelationships[stakeholder].strength || 0.5;
          let newStrength = currentStrength + change.strength;
          
          // Ensure strength is between 0 and 1
          newStrength = Math.min(Math.max(newStrength, 0), 1);
          updatedRelationships[stakeholder].strength = newStrength;
        }
        
        // Update relationship type if provided
        if (change.type) {
          updatedRelationships[stakeholder].type = change.type;
        }
      });
      
      // Update state with new relationship values
      this.stateManager.setState('stakeholderRelationships', updatedRelationships);
      
      return updatedRelationships;
    },
    
    /**
     * Apply changes to hidden debt
     * @param {Object} hiddenDebtChanges - Hidden debt changes to apply
     * @returns {Object} Updated hidden debt
     */
    applyHiddenDebtChanges: function(hiddenDebtChanges) {
      const currentHiddenDebt = this.stateManager.getState('hiddenDebt', {
        total: 0,
        sources: {}
      });
      
      const updatedHiddenDebt = { ...currentHiddenDebt };
      
      // Apply changes to hidden debt
      if (hiddenDebtChanges.amount) {
        updatedHiddenDebt.total = (updatedHiddenDebt.total || 0) + hiddenDebtChanges.amount;
      }
      
      // If there's a source, record it
      if (hiddenDebtChanges.source) {
        if (!updatedHiddenDebt.sources[hiddenDebtChanges.source]) {
          updatedHiddenDebt.sources[hiddenDebtChanges.source] = 0;
        }
        
        updatedHiddenDebt.sources[hiddenDebtChanges.source] += hiddenDebtChanges.amount;
      }
      
      // Update state with new hidden debt values
      this.stateManager.setState('hiddenDebt', updatedHiddenDebt, true);
      
      return updatedHiddenDebt;
    },
    
    /**
     * Check if phase completion criteria are met
     * @param {string} phase - Phase to check
     * @returns {boolean} Whether phase completion criteria are met
     */
    checkPhaseCompletionCriteria: function(phase) {
      if (!this.gameData || !this.gameData.phases || !this.gameData.phases[phase]) {
        return false;
      }
      
      const phaseConfig = this.gameData.phases[phase];
      
      // If no completion criteria defined, assume complete
      if (!phaseConfig.completionCriteria) {
        return true;
      }
      
      // Check required decisions
      if (phaseConfig.completionCriteria.requiredDecisions) {
        const playerDecisions = this.stateManager.getState('decisions', {});
        
        for (const requiredDecision of phaseConfig.completionCriteria.requiredDecisions) {
          if (!playerDecisions[requiredDecision]) {
            return false;
          }
        }
      }
      
      // Check resource thresholds
      if (phaseConfig.completionCriteria.resourceThresholds) {
        const resources = this.stateManager.getState('resources', {});
        
        for (const [resource, threshold] of Object.entries(phaseConfig.completionCriteria.resourceThresholds)) {
          if (resources[resource] === undefined || resources[resource] < threshold) {
            return false;
          }
        }
      }
      
      return true;
    },
    
    /**
     * Calculate final outcomes for the simulation
     * @returns {Object} Calculated outcomes
     */
    calculateOutcomes: function() {
      const decisions = this.stateManager.getState('decisions', {});
      const resources = this.stateManager.getState('resources', {});
      const stakeholderRelationships = this.stateManager.getState('stakeholderRelationships', {});
      const hiddenDebt = this.stateManager.getState('hiddenDebt', { total: 0 });
      
      // Calculate project success
      let projectSuccessScore = 0;
      
      // Add resource contribution to success score
      if (resources.budget > 0) {
        projectSuccessScore += 20;
      }
      
      if (resources.politicalCapital > 50) {
        projectSuccessScore += 20;
      }
      
      // Add stakeholder relationship contribution
      let relationshipScore = 0;
      let stakeholderCount = 0;
      
      Object.values(stakeholderRelationships).forEach(relationship => {
        relationshipScore += relationship.strength * 100;
        stakeholderCount++;
      });
      
      if (stakeholderCount > 0) {
        projectSuccessScore += (relationshipScore / stakeholderCount) * 0.4;
      }
      
      // Subtract impact of hidden debt
      const hiddenDebtImpact = (hiddenDebt.total / 1000000) * 20;
      projectSuccessScore = Math.max(0, projectSuccessScore - hiddenDebtImpact);
      
      // Calculate sustainability
      let sustainabilityScore = 100;
      
      // Hidden debt significantly impacts sustainability
      sustainabilityScore -= (hiddenDebt.total / 500000) * 40;
      
      // Low political capital impacts sustainability
      if (resources.politicalCapital < 30) {
        sustainabilityScore -= (30 - resources.politicalCapital);
      }
      
      // Stakeholder relationships impact sustainability
      const averageRelationshipStrength = stakeholderCount > 0 ? relationshipScore / stakeholderCount : 0;
      sustainabilityScore += (averageRelationshipStrength - 50) * 0.5;
      
      // Ensure score is within valid range
      sustainabilityScore = Math.min(Math.max(sustainabilityScore, 0), 100);
      
      return {
        projectSuccess: Math.round(projectSuccessScore),
        sustainability: Math.round(sustainabilityScore),
        hiddenDebtRevealed: hiddenDebt.total,
        stakeholderSatisfaction: stakeholderCount > 0 ? Math.round(relationshipScore / stakeholderCount) : 0,
        decisions: Object.keys(decisions).length
      };
    },
    
    /**
     * Setup event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Listen for phase changes
      document.addEventListener('aidcraft:phasechange', this._handlePhaseChange.bind(this));
      
      // Listen for timer expiration
      document.addEventListener('aidcraft:timerexpired', this._handleTimerExpired.bind(this));
    },
    
    /**
     * Handle phase change events
     * @param {Event} event - Phase change event
     * @private
     */
    _handlePhaseChange: function(event) {
      const { previousPhase, newPhase } = event.detail;
      console.log(`Phase changed from ${previousPhase} to ${newPhase}`);
      
      // Update phase-specific elements in the state
      this.stateManager.setState('currentPhase', newPhase);
      
      // Check if we need to trigger phase-specific events
      if (this.gameData && this.gameData.phases && this.gameData.phases[newPhase]) {
        const phaseEvents = this.gameData.phases[newPhase].entryEvents;
        
        if (phaseEvents && phaseEvents.length > 0 && window.eventSystem) {
          phaseEvents.forEach(eventId => {
            window.eventSystem.queueEvent(eventId);
          });
        }
      }
    },
    
    /**
     * Handle timer expired events
     * @param {Event} event - Timer expired event
     * @private
     */
    _handleTimerExpired: function(event) {
      const { phase } = event.detail;
      console.log(`Timer expired for phase: ${phase}`);
      
      // Apply time pressure penalties
      this.applyResourceChanges({
        politicalCapital: -10
      });
      
      // Trigger time pressure events if defined
      if (this.gameData && this.gameData.phases && this.gameData.phases[phase]) {
        const timeEvents = this.gameData.phases[phase].timeExpiredEvents;
        
        if (timeEvents && timeEvents.length > 0 && window.eventSystem) {
          const randomIndex = Math.floor(Math.random() * timeEvents.length);
          window.eventSystem.queueEvent(timeEvents[randomIndex]);
        }
      }
    }
  };
  
  // Make GameEngine available globally
  window.gameEngine = GameEngine;
})(); 