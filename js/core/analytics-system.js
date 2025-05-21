/**
 * AidCraft Workshop Simulation - Analytics System
 * Tracks user interactions and decision patterns for analysis.
 */

(function() {
  'use strict';

  /**
   * AnalyticsSystem - Tracks user interactions and decisions
   */
  const AnalyticsSystem = {
    initialized: false,
    stateManager: window.stateManager,
    storageManager: window.storageManager,
    trackingEnabled: true,
    sessionId: null,
    sessionStartTime: null,
    events: [],
    metrics: {},
    
    /**
     * Initialize the analytics system
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve) => {
        console.log('Initializing Analytics System...');
        
        // Generate session ID and start time
        this.sessionId = this._generateSessionId();
        this.sessionStartTime = Date.now();
        
        // Check if analytics tracking is enabled in user settings
        if (window.userProfile) {
          const userData = window.userProfile.getUserData();
          if (userData && userData.settings) {
            this.trackingEnabled = userData.settings.analytics !== false;
          }
        }
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Initialize metrics
        this._initializeMetrics();
        
        this.initialized = true;
        console.log('Analytics System initialized');
        resolve();
      });
    },
    
    /**
     * Track an event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Optional event label
     * @param {number} value - Optional event value
     * @returns {boolean} Success or failure
     */
    trackEvent: function(category, action, label = null, value = null) {
      if (!this.initialized || !this.trackingEnabled) {
        return false;
      }
      
      const event = {
        category: category,
        action: action,
        label: label,
        value: value,
        timestamp: Date.now()
      };
      
      this.events.push(event);
      
      // Save to storage if available and we have accumulated enough events
      if (this.storageManager && this.events.length >= 10) {
        this._persistEvents();
      }
      
      return true;
    },
    
    /**
     * Track a decision made by the user
     * @param {string} decisionId - ID of the decision
     * @param {string} choiceId - ID of the choice made
     * @returns {boolean} Success or failure
     */
    trackDecision: function(decisionId, choiceId) {
      return this.trackEvent('Decision', 'Made', decisionId, choiceId);
    },
    
    /**
     * Track a phase transition
     * @param {string} fromPhase - Phase transitioning from
     * @param {string} toPhase - Phase transitioning to
     * @returns {boolean} Success or failure
     */
    trackPhaseTransition: function(fromPhase, toPhase) {
      return this.trackEvent('Phase', 'Transition', `${fromPhase} to ${toPhase}`);
    },
    
    /**
     * Track time spent in a phase
     * @param {string} phase - Phase identifier
     * @param {number} timeSpentMs - Time spent in milliseconds
     * @returns {boolean} Success or failure
     */
    trackPhaseTime: function(phase, timeSpentMs) {
      return this.trackEvent('Phase', 'TimeSpent', phase, Math.floor(timeSpentMs / 1000));
    },
    
    /**
     * Update a metric
     * @param {string} metricName - Name of the metric
     * @param {number} value - Value to update with
     * @param {string} operation - Operation to perform ('set', 'increment', 'max', 'min')
     * @returns {boolean} Success or failure
     */
    updateMetric: function(metricName, value, operation = 'set') {
      if (!this.initialized || !this.trackingEnabled) {
        return false;
      }
      
      if (!this.metrics[metricName]) {
        this.metrics[metricName] = 0;
      }
      
      switch (operation) {
        case 'set':
          this.metrics[metricName] = value;
          break;
        case 'increment':
          this.metrics[metricName] += value;
          break;
        case 'max':
          this.metrics[metricName] = Math.max(this.metrics[metricName], value);
          break;
        case 'min':
          this.metrics[metricName] = Math.min(this.metrics[metricName], value);
          break;
        default:
          console.error(`Unknown metric operation: ${operation}`);
          return false;
      }
      
      return true;
    },
    
    /**
     * Enable or disable analytics tracking
     * @param {boolean} enabled - Whether tracking should be enabled
     * @returns {boolean} Success or failure
     */
    setTrackingEnabled: function(enabled) {
      if (!this.initialized) {
        return false;
      }
      
      this.trackingEnabled = enabled;
      
      // Update user settings if available
      if (window.userProfile) {
        window.userProfile.updateSettings({ analytics: enabled });
      }
      
      return true;
    },
    
    /**
     * Get session duration in seconds
     * @returns {number} Session duration in seconds
     */
    getSessionDuration: function() {
      if (!this.initialized || !this.sessionStartTime) {
        return 0;
      }
      
      return Math.floor((Date.now() - this.sessionStartTime) / 1000);
    },
    
    /**
     * Get analytics data
     * @returns {Object} Analytics data including events and metrics
     */
    getAnalyticsData: function() {
      if (!this.initialized) {
        return null;
      }
      
      return {
        sessionId: this.sessionId,
        sessionStart: this.sessionStartTime,
        sessionDuration: this.getSessionDuration(),
        events: this.events,
        metrics: this.metrics
      };
    },
    
    /**
     * Export analytics data as JSON
     * @returns {string} JSON string with analytics data
     */
    exportAnalyticsData: function() {
      if (!this.initialized) {
        return '{}';
      }
      
      return JSON.stringify(this.getAnalyticsData(), null, 2);
    },
    
    /**
     * Clear all collected analytics data
     * @returns {boolean} Success or failure
     */
    clearAnalyticsData: function() {
      if (!this.initialized) {
        return false;
      }
      
      this.events = [];
      this._initializeMetrics();
      
      return true;
    },
    
    /**
     * Persist events to storage
     * @private
     */
    _persistEvents: function() {
      if (!this.storageManager || this.events.length === 0) return;
      
      // Get existing events
      const storedEvents = this.storageManager.loadData('analyticsEvents', []);
      
      // Add current events
      const updatedEvents = [...storedEvents, ...this.events];
      
      // Save back to storage
      this.storageManager.saveData('analyticsEvents', updatedEvents);
      
      // Clear in-memory events
      this.events = [];
    },
    
    /**
     * Initialize metrics with default values
     * @private
     */
    _initializeMetrics: function() {
      this.metrics = {
        totalDecisions: 0,
        phaseCompletions: 0,
        averageDecisionTime: 0,
        hiddenDebtRecognized: 0,
        stakeholderSatisfaction: 0,
        totalScore: 0
      };
    },
    
    /**
     * Generate a unique session ID
     * @returns {string} Unique session ID
     * @private
     */
    _generateSessionId: function() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    },
    
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Track phase changes
      document.addEventListener('aidcraft:phasechange', (event) => {
        const { previousPhase, newPhase } = event.detail;
        if (previousPhase) {
          this.trackPhaseTransition(previousPhase, newPhase);
        }
      });
      
      // Track decisions
      document.addEventListener('aidcraft:decisionprocessed', (event) => {
        const { decisionId, choiceId } = event.detail;
        this.trackDecision(decisionId, choiceId);
        this.updateMetric('totalDecisions', 1, 'increment');
      });
      
      // Track phase completions
      document.addEventListener('aidcraft:phasecomplete', (event) => {
        const { phase } = event.detail;
        this.trackEvent('Phase', 'Complete', phase);
        this.updateMetric('phaseCompletions', 1, 'increment');
      });
      
      // Track simulation completion
      document.addEventListener('aidcraft:simulationcomplete', (event) => {
        const { outcomes } = event.detail;
        
        this.trackEvent('Simulation', 'Complete');
        
        // Record final metrics
        if (outcomes) {
          this.updateMetric('totalScore', outcomes.totalScore);
          this.updateMetric('stakeholderSatisfaction', outcomes.stakeholderSatisfaction);
          this.updateMetric('hiddenDebtRecognized', outcomes.hiddenDebtRecognized ? 1 : 0);
        }
        
        // Persist all remaining events and metrics
        this._persistEvents();
        this.storageManager.saveData('analyticsMetrics', this.metrics);
      });
      
      // Track window close to save analytics
      window.addEventListener('beforeunload', () => {
        // Persist any remaining events
        this._persistEvents();
        
        // Save metrics
        if (this.storageManager) {
          this.storageManager.saveData('analyticsMetrics', this.metrics);
        }
      });
    }
  };
  
  // Make AnalyticsSystem available globally
  window.analyticsSystem = AnalyticsSystem;
})(); 