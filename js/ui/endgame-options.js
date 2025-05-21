/**
 * AidCraft Workshop Simulation - Endgame Options
 * Handles conclusion of the simulation with results and follow-up options.
 */

(function() {
  'use strict';

  /**
   * EndgameOptions - Handles simulation conclusion options
   */
  const EndgameOptions = {
    initialized: false,
    stateManager: window.stateManager,
    gameEngine: window.gameEngine,
    dataLoader: window.dataLoader,
    outcomeData: null,
    
    /**
     * Initialize the endgame options module
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve) => {
        console.log('Initializing Endgame Options...');
        
        // Setup event listeners
        this._setupEventListeners();
        
        this.initialized = true;
        console.log('Endgame Options initialized');
        resolve();
      });
    },
    
    /**
     * Show the simulation results
     * @param {Object} outcomeData - Data for outcome display
     * @returns {Promise} Promise that resolves when UI is created
     */
    showResults: function(outcomeData) {
      if (!this.initialized) {
        return Promise.reject(new Error('Endgame Options not initialized'));
      }
      
      this.outcomeData = outcomeData || this.gameEngine.calculateOutcomes();
      
      return this._createResultsUI(this.outcomeData)
        .then(() => {
          // Dispatch results shown event
          document.dispatchEvent(new CustomEvent('aidcraft:resultsshown', {
            detail: {
              outcomes: this.outcomeData
            }
          }));
          
          // Track simulation completion
          document.dispatchEvent(new CustomEvent('aidcraft:simulationcomplete'));
          
          return Promise.resolve();
        })
        .catch(error => {
          console.error('Error showing results:', error);
          return Promise.reject(error);
        });
    },
    
    /**
     * Show the simulation results comparison with alternative scenarios
     * @returns {Promise} Promise that resolves when UI is created
     */
    showResultsComparison: function() {
      if (!this.initialized || !this.outcomeData) {
        return Promise.reject(new Error('Results must be shown first'));
      }
      
      // Get alternative outcomes
      const alternativeOutcomes = this.gameEngine.calculateAlternativeOutcomes();
      
      // Create comparison UI
      return this._createComparisonUI(this.outcomeData, alternativeOutcomes)
        .then(() => {
          // Dispatch comparison shown event
          document.dispatchEvent(new CustomEvent('aidcraft:comparisonshown', {
            detail: {
              mainOutcome: this.outcomeData,
              alternativeOutcomes: alternativeOutcomes
            }
          }));
          
          return Promise.resolve();
        })
        .catch(error => {
          console.error('Error showing comparison:', error);
          return Promise.reject(error);
        });
    },
    
    /**
     * Reset the simulation and start over
     * @param {boolean} keepUserData - Whether to keep user profile data
     * @returns {Promise} Promise that resolves when simulation is reset
     */
    resetSimulation: function(keepUserData = true) {
      if (!this.initialized) {
        return Promise.reject(new Error('Endgame Options not initialized'));
      }
      
      return new Promise((resolve, reject) => {
        // Show confirmation dialog
        if (window.uiInteractions) {
          window.uiInteractions.showConfirmation(
            'Reset the simulation? This will clear all progress and decisions.',
            () => {
              // Confirmed - reset state
              this._performReset(keepUserData)
                .then(resolve)
                .catch(reject);
            },
            () => {
              // Canceled
              resolve(false);
            }
          );
        } else {
          // No UI interactions available, proceed with reset
          this._performReset(keepUserData)
            .then(resolve)
            .catch(reject);
        }
      });
    },
    
    /**
     * Export simulation results as JSON
     * @returns {string} JSON string with results data
     */
    exportResults: function() {
      if (!this.initialized || !this.outcomeData) {
        console.error('No results to export');
        return null;
      }
      
      const exportData = {
        outcomes: this.outcomeData,
        decisions: this.stateManager.getState('decisions', {}),
        resources: this.stateManager.getState('resources', {}),
        relationships: this.stateManager.getState('stakeholderRelationships', {}),
        timestamp: new Date().toISOString(),
        user: this.stateManager.getState('user.name', 'Workshop Participant')
      };
      
      return JSON.stringify(exportData, null, 2);
    },
    
    /**
     * Share results via provided method
     * @param {string} method - Sharing method ('email', 'link', 'download')
     * @returns {Promise} Promise that resolves when sharing is complete
     */
    shareResults: function(method) {
      if (!this.initialized || !this.outcomeData) {
        return Promise.reject(new Error('No results to share'));
      }
      
      const resultData = this.exportResults();
      
      switch (method) {
        case 'email':
          // Create email link with data
          const emailSubject = 'AidCraft Workshop Simulation Results';
          const emailBody = 'Here are my simulation results:\n\n' + 
            'Total Score: ' + this.outcomeData.totalScore + '\n' +
            'Hidden Debt Impact: ' + this.outcomeData.hiddenDebtImpact + '\n' +
            'Sustainable Development: ' + this.outcomeData.sustainableDevelopment;
          
          const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          window.open(mailtoLink);
          return Promise.resolve('Email client opened');
          
        case 'download':
          // Create download link
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(resultData);
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "aidcraft_results.json");
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          return Promise.resolve('File downloaded');
          
        default:
          return Promise.reject(new Error(`Unsupported sharing method: ${method}`));
      }
    },
    
    /**
     * Show facilitator feedback collection dialog
     * @returns {Promise} Promise that resolves when feedback is submitted
     */
    showFeedbackDialog: function() {
      if (!this.initialized || !window.uiInteractions) {
        return Promise.reject(new Error('Cannot show feedback dialog'));
      }
      
      const content = `
        <form id="facilitator-feedback" class="feedback-form">
          <div class="form-group">
            <label for="feedback-learning">Key learning takeaways:</label>
            <textarea id="feedback-learning" rows="3" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label for="feedback-challenges">Biggest challenges faced:</label>
            <textarea id="feedback-challenges" rows="3" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label for="feedback-strategies">Strategies that worked well:</label>
            <textarea id="feedback-strategies" rows="3" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label>Did you identify hidden debt risks?</label>
            <div class="radio-group">
              <label><input type="radio" name="hidden-debt-identified" value="yes"> Yes</label>
              <label><input type="radio" name="hidden-debt-identified" value="partially"> Partially</label>
              <label><input type="radio" name="hidden-debt-identified" value="no"> No</label>
            </div>
          </div>
        </form>
      `;
      
      return new Promise(resolve => {
        window.uiInteractions.showModal(
          'Facilitator Feedback',
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
                const form = document.getElementById('facilitator-feedback');
                if (!form) return resolve(null);
                
                // Get form values
                const feedbackData = {
                  learning: form.querySelector('#feedback-learning').value,
                  challenges: form.querySelector('#feedback-challenges').value,
                  strategies: form.querySelector('#feedback-strategies').value,
                  hiddenDebtIdentified: form.querySelector('input[name="hidden-debt-identified"]:checked')?.value || 'not answered'
                };
                
                // Store feedback in state
                this.stateManager.setState('feedback', feedbackData, true);
                
                // Dispatch feedback event
                document.dispatchEvent(new CustomEvent('aidcraft:feedbacksubmitted', {
                  detail: { feedback: feedbackData }
                }));
                
                resolve(feedbackData);
              }
            }
          ]
        );
      });
    },
    
    /**
     * Perform the actual simulation reset
     * @param {boolean} keepUserData - Whether to keep user profile data
     * @returns {Promise} Promise that resolves when reset is complete
     * @private
     */
    _performReset: function(keepUserData) {
      return new Promise((resolve) => {
        // Save user data if needed
        let userData = null;
        if (keepUserData) {
          userData = this.stateManager.getState('user');
        }
        
        // Reset state
        this.stateManager.resetState();
        
        // Restore user data if needed
        if (keepUserData && userData) {
          this.stateManager.setState('user', userData);
        }
        
        // Dispatch reset event
        document.dispatchEvent(new CustomEvent('aidcraft:simulationreset'));
        
        // Navigate to first phase
        if (window.phaseTransition) {
          window.phaseTransition.navigateToPhase('analysis')
            .then(() => resolve(true))
            .catch(error => {
              console.error('Error navigating to first phase:', error);
              resolve(true); // Still consider reset successful
            });
        } else {
          resolve(true);
        }
      });
    },
    
    /**
     * Create results UI in the content area
     * @param {Object} outcomeData - Outcome data to display
     * @returns {Promise} Promise that resolves when UI is created
     * @private
     */
    _createResultsUI: function(outcomeData) {
      return new Promise((resolve) => {
        const contentContainer = document.getElementById('simulation-content');
        if (!contentContainer) {
          console.error('Content container not found');
          return resolve();
        }
        
        // Calculate result metrics and category
        const totalScore = outcomeData.totalScore;
        const resultCategory = this._getResultCategory(totalScore);
        
        // Create results HTML
        contentContainer.innerHTML = `
          <div class="outcome-container">
            <h1 class="outcome-title">Simulation Results</h1>
            
            <div class="outcome-summary">
              <div class="outcome-category ${resultCategory.className}">
                <div class="outcome-category-title">${resultCategory.title}</div>
                <div class="outcome-category-description">${resultCategory.description}</div>
              </div>
              
              <div class="outcome-score">
                <div class="outcome-score-title">Total Score</div>
                <div class="outcome-score-value">${totalScore}</div>
              </div>
            </div>
            
            <div class="outcome-metrics">
              <div class="outcome-metric">
                <div class="outcome-metric-title">Sustainable Development</div>
                <div class="outcome-metric-value">${outcomeData.sustainableDevelopment}</div>
                <div class="outcome-metric-bar">
                  <div class="outcome-metric-bar-fill" style="width: ${outcomeData.sustainableDevelopment}%"></div>
                </div>
              </div>
              
              <div class="outcome-metric">
                <div class="outcome-metric-title">Stakeholder Satisfaction</div>
                <div class="outcome-metric-value">${outcomeData.stakeholderSatisfaction}</div>
                <div class="outcome-metric-bar">
                  <div class="outcome-metric-bar-fill" style="width: ${outcomeData.stakeholderSatisfaction}%"></div>
                </div>
              </div>
              
              <div class="outcome-metric">
                <div class="outcome-metric-title">Financial Sustainability</div>
                <div class="outcome-metric-value">${outcomeData.financialSustainability}</div>
                <div class="outcome-metric-bar">
                  <div class="outcome-metric-bar-fill" style="width: ${outcomeData.financialSustainability}%"></div>
                </div>
              </div>
              
              <div class="outcome-metric outcome-metric--debt">
                <div class="outcome-metric-title">Hidden Debt Impact</div>
                <div class="outcome-metric-value">${outcomeData.hiddenDebtImpact}</div>
                <div class="outcome-metric-bar">
                  <div class="outcome-metric-bar-fill" style="width: ${outcomeData.hiddenDebtImpact}%"></div>
                </div>
              </div>
            </div>
            
            <div class="outcome-narrative">
              <h2>Narrative Summary</h2>
              <p>${outcomeData.narrative}</p>
            </div>
            
            <div class="outcome-hidden-reveal">
              <h2>Hidden Debt Revealed</h2>
              <p>${outcomeData.hiddenDebtNarrative}</p>
            </div>
            
            <div class="outcome-actions">
              <button id="show-comparison" class="btn btn-primary">Compare Alternative Approaches</button>
              <button id="reset-simulation" class="btn btn-secondary">Start New Simulation</button>
              <button id="share-results" class="btn btn-info">Share Results</button>
              <button id="provide-feedback" class="btn btn-outline">Provide Feedback</button>
            </div>
          </div>
        `;
        
        // Set up event listeners for action buttons
        const comparisonBtn = document.getElementById('show-comparison');
        if (comparisonBtn) {
          comparisonBtn.addEventListener('click', () => {
            this.showResultsComparison();
          });
        }
        
        const resetBtn = document.getElementById('reset-simulation');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.resetSimulation();
          });
        }
        
        const shareBtn = document.getElementById('share-results');
        if (shareBtn) {
          shareBtn.addEventListener('click', () => {
            this._showShareOptions();
          });
        }
        
        const feedbackBtn = document.getElementById('provide-feedback');
        if (feedbackBtn) {
          feedbackBtn.addEventListener('click', () => {
            this.showFeedbackDialog();
          });
        }
        
        resolve();
      });
    },
    
    /**
     * Create comparison UI for comparing outcomes
     * @param {Object} mainOutcome - Main simulation outcome
     * @param {Object} alternativeOutcomes - Alternative outcome scenarios
     * @returns {Promise} Promise that resolves when UI is created
     * @private
     */
    _createComparisonUI: function(mainOutcome, alternativeOutcomes) {
      return new Promise((resolve) => {
        const contentContainer = document.getElementById('simulation-content');
        if (!contentContainer) {
          console.error('Content container not found');
          return resolve();
        }
        
        // Create comparison HTML
        contentContainer.innerHTML = `
          <div class="comparison-container">
            <h1 class="comparison-title">Alternative Approaches Comparison</h1>
            
            <div class="comparison-description">
              <p>This comparison shows how different approaches could have affected the outcome of your development project.</p>
            </div>
            
            <div class="comparison-grid">
              <div class="comparison-header">
                <div class="comparison-cell">Metric</div>
                <div class="comparison-cell">Your Approach</div>
                ${alternativeOutcomes.map(alt => `
                  <div class="comparison-cell">${alt.title}</div>
                `).join('')}
              </div>
              
              <div class="comparison-row">
                <div class="comparison-cell">Total Score</div>
                <div class="comparison-cell comparison-cell--highlight">${mainOutcome.totalScore}</div>
                ${alternativeOutcomes.map(alt => `
                  <div class="comparison-cell">${alt.totalScore}</div>
                `).join('')}
              </div>
              
              <div class="comparison-row">
                <div class="comparison-cell">Sustainable Development</div>
                <div class="comparison-cell comparison-cell--highlight">${mainOutcome.sustainableDevelopment}</div>
                ${alternativeOutcomes.map(alt => `
                  <div class="comparison-cell">${alt.sustainableDevelopment}</div>
                `).join('')}
              </div>
              
              <div class="comparison-row">
                <div class="comparison-cell">Stakeholder Satisfaction</div>
                <div class="comparison-cell comparison-cell--highlight">${mainOutcome.stakeholderSatisfaction}</div>
                ${alternativeOutcomes.map(alt => `
                  <div class="comparison-cell">${alt.stakeholderSatisfaction}</div>
                `).join('')}
              </div>
              
              <div class="comparison-row">
                <div class="comparison-cell">Financial Sustainability</div>
                <div class="comparison-cell comparison-cell--highlight">${mainOutcome.financialSustainability}</div>
                ${alternativeOutcomes.map(alt => `
                  <div class="comparison-cell">${alt.financialSustainability}</div>
                `).join('')}
              </div>
              
              <div class="comparison-row">
                <div class="comparison-cell">Hidden Debt Impact</div>
                <div class="comparison-cell comparison-cell--highlight">${mainOutcome.hiddenDebtImpact}</div>
                ${alternativeOutcomes.map(alt => `
                  <div class="comparison-cell">${alt.hiddenDebtImpact}</div>
                `).join('')}
              </div>
            </div>
            
            <div class="comparison-insights">
              <h2>Key Insights</h2>
              <ul>
                ${this._generateInsights(mainOutcome, alternativeOutcomes).map(insight => `
                  <li>${insight}</li>
                `).join('')}
              </ul>
            </div>
            
            <div class="comparison-actions">
              <button id="back-to-results" class="btn btn-secondary">Back to Results</button>
              <button id="reset-simulation" class="btn btn-primary">Start New Simulation</button>
            </div>
          </div>
        `;
        
        // Set up event listeners for action buttons
        const backBtn = document.getElementById('back-to-results');
        if (backBtn) {
          backBtn.addEventListener('click', () => {
            this.showResults(mainOutcome);
          });
        }
        
        const resetBtn = document.getElementById('reset-simulation');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.resetSimulation();
          });
        }
        
        resolve();
      });
    },
    
    /**
     * Generate insights based on outcome comparisons
     * @param {Object} mainOutcome - Main simulation outcome
     * @param {Object} alternativeOutcomes - Alternative outcome scenarios
     * @returns {Array} Array of insight strings
     * @private
     */
    _generateInsights: function(mainOutcome, alternativeOutcomes) {
      const insights = [];
      
      // Find best approach for each metric
      const metrics = [
        { name: 'sustainable development', key: 'sustainableDevelopment', higher: true },
        { name: 'stakeholder satisfaction', key: 'stakeholderSatisfaction', higher: true },
        { name: 'financial sustainability', key: 'financialSustainability', higher: true },
        { name: 'hidden debt impact', key: 'hiddenDebtImpact', higher: false }
      ];
      
      metrics.forEach(metric => {
        const allOutcomes = [
          { name: 'Your approach', value: mainOutcome[metric.key] },
          ...alternativeOutcomes.map(alt => ({ name: alt.title, value: alt[metric.key] }))
        ];
        
        // Sort by value (higher is better or worse depending on metric)
        allOutcomes.sort((a, b) => metric.higher 
          ? b.value - a.value 
          : a.value - b.value
        );
        
        // Add insight about best approach
        insights.push(`${allOutcomes[0].name} resulted in the best ${metric.name} outcome (${allOutcomes[0].value}).`);
        
        // If user's approach wasn't best, add insight about the difference
        if (allOutcomes[0].name !== 'Your approach') {
          const userOutcome = allOutcomes.find(o => o.name === 'Your approach');
          if (userOutcome) {
            const difference = Math.abs(userOutcome.value - allOutcomes[0].value);
            insights.push(`Your approach was ${difference} points ${metric.higher ? 'below' : 'above'} the optimal strategy for ${metric.name}.`);
          }
        }
      });
      
      // Add insight about trade-offs
      insights.push('Each approach involves trade-offs between stakeholder satisfaction, development impact, and financial sustainability.');
      
      // Add insight about hidden debt
      if (mainOutcome.hiddenDebtImpact > 50) {
        insights.push('Your approach resulted in significant hidden debt, which could lead to long-term sustainability challenges.');
      } else if (mainOutcome.hiddenDebtImpact > 25) {
        insights.push('Your approach exposed some hidden debt risks, but managed to mitigate the worst impacts.');
      } else {
        insights.push('Your approach effectively minimized hidden debt risks, creating a more sustainable development path.');
      }
      
      return insights;
    },
    
    /**
     * Get result category based on total score
     * @param {number} score - Total outcome score
     * @returns {Object} Category information with title, description, and classname
     * @private
     */
    _getResultCategory: function(score) {
      if (score >= 85) {
        return {
          title: 'Excellent',
          description: 'You achieved an outstanding balance between development goals, stakeholder needs, and financial sustainability.',
          className: 'outcome-category--excellent'
        };
      } else if (score >= 70) {
        return {
          title: 'Good',
          description: 'You successfully balanced most competing priorities and created a sustainable development approach.',
          className: 'outcome-category--good'
        };
      } else if (score >= 50) {
        return {
          title: 'Adequate',
          description: 'Your approach met basic development needs but had some sustainability challenges.',
          className: 'outcome-category--adequate'
        };
      } else {
        return {
          title: 'Challenging',
          description: 'Your approach faced significant challenges balancing competing priorities and sustainability.',
          className: 'outcome-category--challenging'
        };
      }
    },
    
    /**
     * Show sharing options dialog
     * @private
     */
    _showShareOptions: function() {
      if (!window.uiInteractions) return;
      
      window.uiInteractions.showModal(
        'Share Results',
        `
          <div class="share-options">
            <button id="share-email" class="share-option">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>Email Results</span>
            </button>
            <button id="share-download" class="share-option">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download JSON</span>
            </button>
          </div>
        `,
        [
          {
            text: 'Cancel',
            action: 'cancel',
            class: 'btn-secondary'
          }
        ]
      );
      
      // Add event listeners to share buttons
      const emailBtn = document.getElementById('share-email');
      if (emailBtn) {
        emailBtn.addEventListener('click', () => {
          this.shareResults('email')
            .then(() => window.uiInteractions.closeModal())
            .catch(error => console.error('Error sharing via email:', error));
        });
      }
      
      const downloadBtn = document.getElementById('share-download');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          this.shareResults('download')
            .then(() => window.uiInteractions.closeModal())
            .catch(error => console.error('Error downloading results:', error));
        });
      }
    },
    
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Listen for simulation completion to show results
      document.addEventListener('aidcraft:phasechange', (event) => {
        const { newPhase } = event.detail;
        
        if (newPhase === 'outcome') {
          // Wait a short delay to allow the outcome phase to initialize
          setTimeout(() => {
            // Only show results if we haven't already (outcomeData is null)
            if (!this.outcomeData) {
              this.showResults()
                .catch(error => console.error('Error showing results:', error));
            }
          }, 1000);
        }
      });
    }
  };
  
  // Make EndgameOptions available globally
  window.endgameOptions = EndgameOptions;
})(); 