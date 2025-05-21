/**
 * AidCraft Workshop Simulation - Feedback System
 * Handles collecting and processing user feedback.
 */

(function() {
  'use strict';

  /**
   * FeedbackSystem - Manages user feedback collection and processing
   */
  const FeedbackSystem = {
    initialized: false,
    stateManager: window.stateManager,
    storageManager: window.storageManager,
    feedbackHistory: [],
    
    /**
     * Initialize the feedback system
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve) => {
        console.log('Initializing Feedback System...');
        
        // Load feedback history from storage
        if (this.storageManager) {
          this.feedbackHistory = this.storageManager.loadData('feedbackHistory', []);
        }
        
        // Set up event listeners
        this._setupEventListeners();
        
        this.initialized = true;
        console.log('Feedback System initialized');
        resolve();
      });
    },
    
    /**
     * Record phase rating feedback
     * @param {string} phase - Phase being rated
     * @param {number} rating - Rating value (1-5)
     * @returns {boolean} Success or failure
     */
    recordPhaseRating: function(phase, rating) {
      if (!this.initialized) {
        console.error('Feedback System not initialized');
        return false;
      }
      
      const feedbackData = {
        type: 'phaseRating',
        phase: phase,
        rating: rating,
        timestamp: Date.now()
      };
      
      return this._recordFeedback(feedbackData);
    },
    
    /**
     * Record decision feedback
     * @param {string} decisionId - ID of the decision
     * @param {string} choiceId - ID of the choice made
     * @param {number} satisfaction - Satisfaction level (1-5)
     * @param {string} comment - Optional user comment
     * @returns {boolean} Success or failure
     */
    recordDecisionFeedback: function(decisionId, choiceId, satisfaction, comment = '') {
      if (!this.initialized) {
        console.error('Feedback System not initialized');
        return false;
      }
      
      const feedbackData = {
        type: 'decision',
        decisionId: decisionId,
        choiceId: choiceId,
        satisfaction: satisfaction,
        comment: comment,
        timestamp: Date.now()
      };
      
      return this._recordFeedback(feedbackData);
    },
    
    /**
     * Record overall simulation feedback
     * @param {Object} feedbackData - Simulation feedback data
     * @returns {boolean} Success or failure
     */
    recordSimulationFeedback: function(feedbackData) {
      if (!this.initialized) {
        console.error('Feedback System not initialized');
        return false;
      }
      
      const feedback = {
        type: 'simulation',
        ...feedbackData,
        timestamp: Date.now()
      };
      
      return this._recordFeedback(feedback);
    },
    
    /**
     * Prompt user for phase rating
     * @param {string} phase - Phase to rate
     * @returns {Promise} Promise that resolves with rating or null if canceled
     */
    promptPhaseRating: function(phase) {
      if (!this.initialized || !window.uiInteractions) {
        return Promise.reject(new Error('Cannot show rating prompt'));
      }
      
      return new Promise(resolve => {
        // Get phase title from phase name
        const phaseTitle = phase.charAt(0).toUpperCase() + phase.slice(1);
        
        const content = `
          <div class="phase-rating">
            <p>How would you rate your experience in the ${phaseTitle} Phase?</p>
            
            <div class="rating-options">
              <button class="rating-option" data-rating="1">
                <span class="rating-icon">⭐</span>
                <span class="rating-label">Poor</span>
              </button>
              <button class="rating-option" data-rating="2">
                <span class="rating-icon">⭐⭐</span>
                <span class="rating-label">Fair</span>
              </button>
              <button class="rating-option" data-rating="3">
                <span class="rating-icon">⭐⭐⭐</span>
                <span class="rating-label">Good</span>
              </button>
              <button class="rating-option" data-rating="4">
                <span class="rating-icon">⭐⭐⭐⭐</span>
                <span class="rating-label">Very Good</span>
              </button>
              <button class="rating-option" data-rating="5">
                <span class="rating-icon">⭐⭐⭐⭐⭐</span>
                <span class="rating-label">Excellent</span>
              </button>
            </div>
            
            <div class="feedback-comment">
              <label for="rating-comment">Optional comments:</label>
              <textarea id="rating-comment" rows="3" class="form-control"></textarea>
            </div>
          </div>
        `;
        
        window.uiInteractions.showModal(
          `${phaseTitle} Phase Feedback`,
          content,
          [
            {
              text: 'Skip',
              action: 'skip',
              class: 'btn-secondary',
              callback: () => resolve(null)
            },
            {
              text: 'Submit',
              action: 'submit',
              class: 'btn-primary disabled',
              callback: () => {
                const selectedRating = document.querySelector('.rating-option.selected');
                const commentText = document.getElementById('rating-comment').value;
                
                if (selectedRating) {
                  const rating = parseInt(selectedRating.getAttribute('data-rating'), 10);
                  
                  // Record the rating
                  this.recordPhaseRating(phase, rating);
                  
                  // If there's a comment, record it as well
                  if (commentText.trim()) {
                    this.recordPhaseFeedbackComment(phase, commentText.trim());
                  }
                  
                  resolve(rating);
                } else {
                  resolve(null);
                }
              }
            }
          ]
        );
        
        // Set up event listeners for rating options
        setTimeout(() => {
          const ratingOptions = document.querySelectorAll('.rating-option');
          const submitButton = document.querySelector('button[data-action="submit"]');
          
          ratingOptions.forEach(option => {
            option.addEventListener('click', () => {
              // Remove selection from all options
              ratingOptions.forEach(opt => opt.classList.remove('selected'));
              
              // Add selection to clicked option
              option.classList.add('selected');
              
              // Enable submit button
              if (submitButton) {
                submitButton.classList.remove('disabled');
              }
            });
          });
        }, 100);
      });
    },
    
    /**
     * Record a feedback comment for a phase
     * @param {string} phase - Phase to comment on
     * @param {string} comment - User comment
     * @returns {boolean} Success or failure
     */
    recordPhaseFeedbackComment: function(phase, comment) {
      if (!this.initialized) {
        console.error('Feedback System not initialized');
        return false;
      }
      
      const feedbackData = {
        type: 'phaseComment',
        phase: phase,
        comment: comment,
        timestamp: Date.now()
      };
      
      return this._recordFeedback(feedbackData);
    },
    
    /**
     * Show comprehensive feedback form at end of simulation
     * @returns {Promise} Promise that resolves with feedback data or null if canceled
     */
    showComprehensiveFeedback: function() {
      if (!this.initialized || !window.uiInteractions) {
        return Promise.reject(new Error('Cannot show comprehensive feedback form'));
      }
      
      const content = `
        <form id="comprehensive-feedback" class="comprehensive-feedback">
          <div class="form-group">
            <label>Overall Simulation Rating:</label>
            <div class="rating-stars">
              <input type="radio" id="rating-5" name="overall-rating" value="5">
              <label for="rating-5">★</label>
              <input type="radio" id="rating-4" name="overall-rating" value="4">
              <label for="rating-4">★</label>
              <input type="radio" id="rating-3" name="overall-rating" value="3">
              <label for="rating-3">★</label>
              <input type="radio" id="rating-2" name="overall-rating" value="2">
              <label for="rating-2">★</label>
              <input type="radio" id="rating-1" name="overall-rating" value="1">
              <label for="rating-1">★</label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="most-valuable">What aspect of the simulation was most valuable?</label>
            <textarea id="most-valuable" rows="2" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label for="improvement-suggestion">What could be improved?</label>
            <textarea id="improvement-suggestion" rows="2" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label for="understanding-impact">How has this simulation affected your understanding of hidden debt?</label>
            <select id="understanding-impact" class="form-control">
              <option value="">-- Please select --</option>
              <option value="significantly-improved">Significantly improved my understanding</option>
              <option value="somewhat-improved">Somewhat improved my understanding</option>
              <option value="no-change">No significant change in understanding</option>
              <option value="confused">Made me more confused</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="additional-comments">Additional comments:</label>
            <textarea id="additional-comments" rows="2" class="form-control"></textarea>
          </div>
        </form>
      `;
      
      return new Promise(resolve => {
        window.uiInteractions.showModal(
          'Simulation Feedback',
          content,
          [
            {
              text: 'Skip',
              action: 'skip',
              class: 'btn-secondary',
              callback: () => resolve(null)
            },
            {
              text: 'Submit',
              action: 'submit',
              class: 'btn-primary',
              callback: () => {
                const form = document.getElementById('comprehensive-feedback');
                if (!form) return resolve(null);
                
                // Get form values
                const overallRating = form.querySelector('input[name="overall-rating"]:checked')?.value;
                const mostValuable = form.querySelector('#most-valuable').value;
                const improvementSuggestion = form.querySelector('#improvement-suggestion').value;
                const understandingImpact = form.querySelector('#understanding-impact').value;
                const additionalComments = form.querySelector('#additional-comments').value;
                
                const feedbackData = {
                  overallRating: overallRating ? parseInt(overallRating, 10) : null,
                  mostValuable: mostValuable,
                  improvementSuggestion: improvementSuggestion,
                  understandingImpact: understandingImpact,
                  additionalComments: additionalComments
                };
                
                // Record the feedback
                this.recordSimulationFeedback(feedbackData);
                
                resolve(feedbackData);
              }
            }
          ]
        );
      });
    },
    
    /**
     * Get all feedback for a specific phase
     * @param {string} phase - Phase to get feedback for
     * @returns {Array} Array of feedback items for the phase
     */
    getPhaseFeedback: function(phase) {
      if (!this.initialized) {
        return [];
      }
      
      return this.feedbackHistory.filter(item => 
        (item.type === 'phaseRating' || item.type === 'phaseComment') && 
        item.phase === phase
      );
    },
    
    /**
     * Get all feedback for a specific decision
     * @param {string} decisionId - Decision ID to get feedback for
     * @returns {Array} Array of feedback items for the decision
     */
    getDecisionFeedback: function(decisionId) {
      if (!this.initialized) {
        return [];
      }
      
      return this.feedbackHistory.filter(item => 
        item.type === 'decision' && item.decisionId === decisionId
      );
    },
    
    /**
     * Get all simulation feedback
     * @returns {Array} Array of simulation feedback items
     */
    getSimulationFeedback: function() {
      if (!this.initialized) {
        return [];
      }
      
      return this.feedbackHistory.filter(item => item.type === 'simulation');
    },
    
    /**
     * Clear all feedback history
     * @returns {boolean} Success or failure
     */
    clearFeedbackHistory: function() {
      if (!this.initialized) {
        return false;
      }
      
      this.feedbackHistory = [];
      
      // Save empty history to storage
      if (this.storageManager) {
        this.storageManager.saveData('feedbackHistory', this.feedbackHistory);
      }
      
      return true;
    },
    
    /**
     * Record a feedback item
     * @param {Object} feedbackData - Feedback data to record
     * @returns {boolean} Success or failure
     * @private
     */
    _recordFeedback: function(feedbackData) {
      // Add to feedback history
      this.feedbackHistory.push(feedbackData);
      
      // Save to storage if available
      if (this.storageManager) {
        this.storageManager.saveData('feedbackHistory', this.feedbackHistory);
      }
      
      // Dispatch feedback recorded event
      document.dispatchEvent(new CustomEvent('aidcraft:feedbackrecorded', {
        detail: { feedback: feedbackData }
      }));
      
      console.log('Feedback recorded:', feedbackData);
      return true;
    },
    
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Listen for phase changes to prompt for feedback
      document.addEventListener('aidcraft:phasechange', (event) => {
        const { previousPhase, newPhase } = event.detail;
        
        // Don't prompt if this is the initial phase
        if (previousPhase && previousPhase !== newPhase) {
          // Prompt for feedback after a short delay
          setTimeout(() => {
            this.promptPhaseRating(previousPhase)
              .catch(error => console.error('Error prompting for phase rating:', error));
          }, 1000);
        }
      });
      
      // Listen for simulation completion to show comprehensive feedback
      document.addEventListener('aidcraft:simulationcomplete', () => {
        // Prompt for feedback after a short delay
        setTimeout(() => {
          this.showComprehensiveFeedback()
            .catch(error => console.error('Error showing comprehensive feedback:', error));
        }, 2000);
      });
    }
  };
  
  // Make FeedbackSystem available globally
  window.feedbackSystem = FeedbackSystem;
})(); 