/**
 * AidCraft Workshop Simulation - Event System
 * Handles scheduled and dynamic events throughout the simulation.
 */

(function() {
  'use strict';

  /**
   * Event System - Manages events and their lifecycle
   */
  const EventSystem = {
    initialized: false,
    stateManager: window.stateManager,
    gameData: null,
    dataLoader: window.dataLoader,
    eventQueue: [],
    activeEvent: null,
    
    /**
     * Initialize the event system
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        console.log('Initializing Event System...');
        
        // Get dependencies
        if (!this.stateManager || !this.dataLoader) {
          reject(new Error('Dependencies not available for Event System'));
          return;
        }
        
        // Get game data
        this.dataLoader.loadData()
          .then(data => {
            this.gameData = data;
            
            // Set up event listeners
            this._setupEventListeners();
            
            this.initialized = true;
            console.log('Event System initialized');
            resolve();
          })
          .catch(error => {
            console.error('Failed to initialize Event System:', error);
            reject(error);
          });
      });
    },
    
    /**
     * Queue an event to be triggered
     * @param {string} eventId - ID of the event to queue
     * @param {number} delay - Optional delay in milliseconds (default: 0)
     * @returns {boolean} Success or failure
     */
    queueEvent: function(eventId, delay = 0) {
      if (!this.initialized || !this.gameData) {
        console.error('Event System not initialized');
        return false;
      }
      
      // Get event from game data
      const event = this.dataLoader.getEvent(eventId);
      if (!event) {
        console.error(`Event not found: ${eventId}`);
        return false;
      }
      
      // Check if conditions are met
      if (event.conditions && !this.checkEventConditions(event.conditions)) {
        console.log(`Event conditions not met for ${eventId}, skipping`);
        return false;
      }
      
      console.log(`Queueing event: ${eventId}${delay > 0 ? ` with ${delay}ms delay` : ''}`);
      
      // Queue the event
      const queuedEvent = {
        id: eventId,
        event: event,
        timeoutId: null
      };
      
      if (delay > 0) {
        // Delayed event
        queuedEvent.timeoutId = setTimeout(() => {
          this.triggerEvent(eventId);
        }, delay);
      } else {
        // Immediate event, check if we can trigger it now
        if (!this.activeEvent) {
          this.triggerEvent(eventId);
          return true;
        }
      }
      
      // Add to queue
      this.eventQueue.push(queuedEvent);
      return true;
    },
    
    /**
     * Trigger an event immediately
     * @param {string} eventId - ID of the event to trigger
     * @returns {boolean} Success or failure
     */
    triggerEvent: function(eventId) {
      if (!this.initialized || !this.gameData) {
        console.error('Event System not initialized');
        return false;
      }
      
      // If there's an active event, just queue this one
      if (this.activeEvent) {
        console.log(`Event already active, queueing ${eventId}`);
        return this.queueEvent(eventId);
      }
      
      // Find event in queue or get it from game data
      let eventToTrigger = this.eventQueue.find(e => e.id === eventId);
      
      if (eventToTrigger) {
        // Remove from queue if it's there
        this.eventQueue = this.eventQueue.filter(e => e.id !== eventId);
        
        // Cancel timeout if it has one
        if (eventToTrigger.timeoutId) {
          clearTimeout(eventToTrigger.timeoutId);
        }
        
        // Use event object from queue
        this.activeEvent = eventToTrigger.event;
      } else {
        // Get event from game data
        const event = this.dataLoader.getEvent(eventId);
        if (!event) {
          console.error(`Event not found: ${eventId}`);
          return false;
        }
        
        // Check conditions
        if (event.conditions && !this.checkEventConditions(event.conditions)) {
          console.log(`Event conditions not met for ${eventId}, skipping`);
          return false;
        }
        
        this.activeEvent = event;
      }
      
      console.log(`Triggering event: ${eventId}`);
      
      // Notify that an event should be displayed
      document.dispatchEvent(new CustomEvent('aidcraft:showevent', {
        detail: {
          eventId: eventId,
          event: this.activeEvent
        }
      }));
      
      // Record that this event has been seen
      const seenEvents = this.stateManager.getState('seenEvents', []);
      if (!seenEvents.includes(eventId)) {
        seenEvents.push(eventId);
        this.stateManager.setState('seenEvents', seenEvents);
      }
      
      return true;
    },
    
    /**
     * Handle a player's choice for an event
     * @param {string} eventId - ID of the event
     * @param {string} choiceId - ID of the chosen option
     * @returns {Object} Effects and outcomes of the choice
     */
    handleEventChoice: function(eventId, choiceId) {
      if (!this.initialized || !this.activeEvent || this.activeEvent.id !== eventId) {
        console.error(`Cannot handle choice: no active event or event ID mismatch (active: ${this.activeEvent?.id}, requested: ${eventId})`);
        return null;
      }
      
      console.log(`Handling event choice: ${eventId}, choice: ${choiceId}`);
      
      // Find the choice
      const choice = this.activeEvent.choices.find(c => c.id === choiceId);
      if (!choice) {
        console.error(`Choice not found: ${choiceId} in event ${eventId}`);
        return null;
      }
      
      // Apply effects if any
      const effects = {};
      
      if (choice.effects) {
        // Apply resource changes
        if (choice.effects.resources && window.gameEngine) {
          effects.resources = window.gameEngine.applyResourceChanges(choice.effects.resources);
        }
        
        // Apply stakeholder relationship changes
        if (choice.effects.stakeholderRelationships && window.gameEngine) {
          effects.stakeholderRelationships = window.gameEngine.updateStakeholderRelationships(choice.effects.stakeholderRelationships);
        }
        
        // Apply hidden debt changes
        if (choice.effects.hiddenDebt && window.gameEngine) {
          effects.hiddenDebt = window.gameEngine.applyHiddenDebtChanges(choice.effects.hiddenDebt);
        }
      }
      
      // Record choice in state
      this.stateManager.setState(`eventChoices.${eventId}`, choiceId);
      
      // Check for triggered events
      if (choice.triggersEvents && choice.triggersEvents.length > 0) {
        effects.triggeredEvents = [];
        
        choice.triggersEvents.forEach(triggeredEventId => {
          if (this.queueEvent(triggeredEventId)) {
            effects.triggeredEvents.push(triggeredEventId);
          }
        });
      }
      
      // Clear active event
      this.activeEvent = null;
      
      // Dispatch event choice processed event
      document.dispatchEvent(new CustomEvent('aidcraft:eventchoiceprocessed', {
        detail: {
          eventId,
          choiceId,
          effects
        }
      }));
      
      // Check for next event in queue
      this._processNextQueuedEvent();
      
      return effects;
    },
    
    /**
     * Check if event conditions are met
     * @param {Object} conditions - Conditions to check
     * @returns {boolean} Whether conditions are met
     */
    checkEventConditions: function(conditions) {
      // Check current phase
      if (conditions.currentPhase) {
        const currentPhase = this.stateManager.getState('currentPhase');
        if (conditions.currentPhase !== currentPhase) {
          return false;
        }
      }
      
      // Check resource conditions
      if (conditions.resources) {
        const resources = this.stateManager.getState('resources', {});
        
        for (const [resource, condition] of Object.entries(conditions.resources)) {
          const currentValue = resources[resource] || 0;
          
          if (condition.min !== undefined && currentValue < condition.min) {
            return false;
          }
          
          if (condition.max !== undefined && currentValue > condition.max) {
            return false;
          }
        }
      }
      
      // Check required decisions
      if (conditions.decisions) {
        const decisions = this.stateManager.getState('decisions', {});
        
        for (const [decisionId, requiredChoice] of Object.entries(conditions.decisions)) {
          if (decisions[decisionId] !== requiredChoice) {
            return false;
          }
        }
      }
      
      // Check prior event choices
      if (conditions.eventChoices) {
        const eventChoices = this.stateManager.getState('eventChoices', {});
        
        for (const [eventId, requiredChoice] of Object.entries(conditions.eventChoices)) {
          if (eventChoices[eventId] !== requiredChoice) {
            return false;
          }
        }
      }
      
      return true;
    },
    
    /**
     * Check for and possibly trigger a random curveball event
     * @param {string} phase - Current phase to check curveball events for
     * @returns {boolean} Whether a curveball event was triggered
     */
    checkForCurveballEvent: function(phase) {
      if (!this.initialized || !this.gameData) {
        return false;
      }
      
      // Get curveball events for the current phase
      const curveballEvents = this.gameData.events.filter(e => 
        e.type === 'curveball' && 
        e.phase === phase &&
        (!e.conditions || this.checkEventConditions(e.conditions))
      );
      
      if (curveballEvents.length === 0) {
        return false;
      }
      
      // Determine if we should trigger one (20% chance)
      const shouldTrigger = Math.random() < 0.2;
      if (!shouldTrigger) {
        return false;
      }
      
      // Select a random curveball event
      const randomIndex = Math.floor(Math.random() * curveballEvents.length);
      const eventId = curveballEvents[randomIndex].id;
      
      // Queue with a short delay
      this.queueEvent(eventId, 3000);
      return true;
    },
    
    /**
     * Process the next event in the queue
     * @private
     */
    _processNextQueuedEvent: function() {
      // Make sure we're not already processing an event
      if (this.activeEvent) {
        return;
      }
      
      // Get the next event from the queue
      if (this.eventQueue.length > 0) {
        const nextEvent = this.eventQueue.shift();
        this.triggerEvent(nextEvent.id);
      }
    },
    
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Listen for phase changes to check for phase entry events
      document.addEventListener('aidcraft:phasechange', this._handlePhaseChange.bind(this));
      
      // Listen for event choice requests
      document.addEventListener('aidcraft:chooseeventoption', this._handleEventChoiceRequest.bind(this));
      
      // Listen for event dismissal
      document.addEventListener('aidcraft:dismissevent', this._handleEventDismissal.bind(this));
    },
    
    /**
     * Handle phase change events
     * @param {Event} event - Phase change event
     * @private
     */
    _handlePhaseChange: function(event) {
      const { newPhase } = event.detail;
      
      // Check for phase entry events
      if (!this.gameData || !this.gameData.phases || !this.gameData.phases[newPhase]) {
        return;
      }
      
      // Queue phase entry events
      const phaseConfig = this.gameData.phases[newPhase];
      if (phaseConfig.entryEvents && Array.isArray(phaseConfig.entryEvents)) {
        phaseConfig.entryEvents.forEach(eventId => {
          this.queueEvent(eventId, 1000); // Small delay for better UX
        });
      }
    },
    
    /**
     * Handle event choice requests
     * @param {Event} event - Event choice request event
     * @private
     */
    _handleEventChoiceRequest: function(event) {
      const { eventId, choiceId } = event.detail;
      this.handleEventChoice(eventId, choiceId);
    },
    
    /**
     * Handle event dismissal
     * @param {Event} event - Event dismissal event
     * @private
     */
    _handleEventDismissal: function(event) {
      const { eventId } = event.detail;
      
      // Clear active event if it matches
      if (this.activeEvent && this.activeEvent.id === eventId) {
        this.activeEvent = null;
        
        // Process next event in queue
        this._processNextQueuedEvent();
      }
    }
  };
  
  // Make EventSystem available globally
  window.eventSystem = EventSystem;
})(); 