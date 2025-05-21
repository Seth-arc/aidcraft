/**
 * Outcome Phase
 * Handles the outcome phase of the AidCraft simulation
 */
(function() {
    const OutcomePhase = {
        initialized: false,
        stateManager: null,
        gameEngine: null,
        
        /**
         * Initialize the outcome phase
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }
            
            console.log('Initializing Outcome Phase...');
            
            // Get dependencies
            this.stateManager = window.stateManager;
            this.gameEngine = window.gameEngine;
            
            return new Promise((resolve, reject) => {
                if (!this.stateManager || !this.gameEngine) {
                    reject(new Error('Dependencies not available for Outcome Phase'));
                    return;
                }
                
                // Register event handlers
                document.addEventListener('aidcraft:phaseChange', this.handlePhaseChange.bind(this));
                
                this.initialized = true;
                console.log('Outcome Phase initialized');
                resolve();
            });
        },
        
        /**
         * Handle phase change event
         * @param {Object} event - Custom event with phase change details
         */
        handlePhaseChange: function(event) {
            const { newPhase, oldPhase } = event.detail;
            
            if (newPhase === 'outcome') {
                console.log('Activating Outcome Phase');
                this.activatePhase();
            } else if (oldPhase === 'outcome') {
                console.log('Deactivating Outcome Phase');
                this.deactivatePhase();
            }
        },
        
        /**
         * Activate the outcome phase
         */
        activatePhase: function() {
            // Calculate final outcomes
            this.calculateOutcomes();
            
            // Initialize phase-specific UI elements
            this.initializeOutcomeVisualization();
            this.initializeHiddenDebtReveal();
            this.initializeLongTermImpact();
            
            // Set up event listeners for phase-specific interactions
            document.addEventListener('click', this.handleOutcomeInteractions);
            
            // Show phase introduction
            this.showPhaseIntroduction();
        },
        
        /**
         * Deactivate the outcome phase
         */
        deactivatePhase: function() {
            // Remove event listeners
            document.removeEventListener('click', this.handleOutcomeInteractions);
        },
        
        /**
         * Calculate final simulation outcomes
         */
        calculateOutcomes: function() {
            // In a real implementation, this would calculate based on all previous decisions
            // For now, use placeholder values
            
            const outcomes = {
                projectSuccess: 0.75, // 0-1 scale
                financialSustainability: 0.6, // 0-1 scale
                stakeholderSatisfaction: 0.8, // 0-1 scale
                hiddenDebt: 0.4, // 0-1 scale
                longTermImpact: 0.7 // 0-1 scale
            };
            
            // Save to state
            this.stateManager.setState('phases.outcome.results', outcomes);
        },
        
        /**
         * Initialize outcome visualization interface
         */
        initializeOutcomeVisualization: function() {
            const visualizationContainer = document.getElementById('outcome-visualization');
            if (!visualizationContainer) return;
            
            // Get calculated outcomes
            const outcomes = this.stateManager.getState('phases.outcome.results', {});
            
            // Generate outcome visualization UI
            let visualizationHTML = '<div class="outcome-visualization-container">';
            visualizationHTML += '<h2>Project Outcomes</h2>';
            visualizationHTML += '<div class="outcome-metrics">';
            
            // Define metrics to display
            const metrics = [
                { id: 'projectSuccess', name: 'Project Success', icon: '🏆' },
                { id: 'financialSustainability', name: 'Financial Sustainability', icon: '💰' },
                { id: 'stakeholderSatisfaction', name: 'Stakeholder Satisfaction', icon: '👥' },
                { id: 'hiddenDebt', name: 'Hidden Debt Impact', icon: '⚠️' },
                { id: 'longTermImpact', name: 'Long-Term Impact', icon: '📈' }
            ];
            
            metrics.forEach(metric => {
                const value = outcomes[metric.id] || 0;
                const percentage = Math.round(value * 100);
                
                // Determine rating based on value
                let rating = 'Poor';
                let ratingClass = 'rating-poor';
                
                if (value >= 0.8) {
                    rating = 'Excellent';
                    ratingClass = 'rating-excellent';
                } else if (value >= 0.6) {
                    rating = 'Good';
                    ratingClass = 'rating-good';
                } else if (value >= 0.4) {
                    rating = 'Average';
                    ratingClass = 'rating-average';
                }
                
                visualizationHTML += `
                    <div class="outcome-metric">
                        <div class="metric-icon">${metric.icon}</div>
                        <div class="metric-details">
                            <h3 class="metric-name">${metric.name}</h3>
                            <div class="metric-value-container">
                                <div class="metric-progress-bar">
                                    <div class="metric-progress" style="width: ${percentage}%"></div>
                                </div>
                                <div class="metric-value">${percentage}%</div>
                            </div>
                            <div class="metric-rating ${ratingClass}">${rating}</div>
                        </div>
                    </div>
                `;
            });
            
            visualizationHTML += '</div>';
            visualizationHTML += '</div>';
            
            visualizationContainer.innerHTML = visualizationHTML;
        },
        
        /**
         * Initialize hidden debt reveal interface
         */
        initializeHiddenDebtReveal: function() {
            const hiddenDebtContainer = document.getElementById('hidden-debt-reveal');
            if (!hiddenDebtContainer) return;
            
            // Get funding option selected
            const selectedFunding = this.stateManager.getState('phases.funding.selectedFunding', null);
            
            // Simplistic calculation of hidden debt
            const hiddenDebtAmount = selectedFunding ? (selectedFunding.maxAmount * 0.3) : 100000;
            
            // Generate hidden debt reveal UI
            let hiddenDebtHTML = '<div class="hidden-debt-container">';
            hiddenDebtHTML += '<h2>Hidden Debt Revelation</h2>';
            
            if (!selectedFunding) {
                hiddenDebtHTML += `
                    <div class="placeholder-message">
                        <p>No funding source was selected, so hidden debt cannot be calculated.</p>
                    </div>
                `;
            } else {
                hiddenDebtHTML += `
                    <div class="debt-revelation">
                        <div class="debt-header">
                            <div class="debt-icon">⚠️</div>
                            <h3>Hidden Debt Discovered</h3>
                        </div>
                        
                        <div class="debt-details">
                            <p>Your chosen funding option (${selectedFunding.name}) had undisclosed conditions and obligations:</p>
                            
                            <div class="debt-amount">
                                <span class="amount-label">Hidden Debt Amount:</span>
                                <span class="amount-value">$${hiddenDebtAmount.toLocaleString()}</span>
                            </div>
                            
                            <div class="debt-percentage">
                                <span class="percentage-label">Percentage of Total Funding:</span>
                                <span class="percentage-value">${Math.round((hiddenDebtAmount / selectedFunding.maxAmount) * 100)}%</span>
                            </div>
                            
                            <div class="debt-impact">
                                <h4>Key Impacts:</h4>
                                <ul>
                                    <li>Reduced financial sustainability</li>
                                    <li>Additional reporting requirements</li>
                                    <li>Extended obligation period</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            hiddenDebtHTML += '</div>';
            
            hiddenDebtContainer.innerHTML = hiddenDebtHTML;
        },
        
        /**
         * Initialize long-term impact interface
         */
        initializeLongTermImpact: function() {
            const impactContainer = document.getElementById('long-term-impact');
            if (!impactContainer) return;
            
            // Generate long-term impact UI
            let impactHTML = '<div class="long-term-impact-container">';
            impactHTML += '<h2>Long-Term Impact Projection</h2>';
            
            // Simplistic impact projection
            impactHTML += `
                <div class="impact-projection">
                    <div class="projection-section">
                        <h3>5-Year Development Impact</h3>
                        <p>Based on your decisions, the project is predicted to have the following long-term impacts:</p>
                        
                        <div class="impact-categories">
                            <div class="impact-category">
                                <div class="category-icon">🏗️</div>
                                <div class="category-details">
                                    <h4>Infrastructure</h4>
                                    <div class="impact-level impact-moderate">Moderate Improvement</div>
                                    <p>Improved transportation and utilities in target areas.</p>
                                </div>
                            </div>
                            
                            <div class="impact-category">
                                <div class="category-icon">📚</div>
                                <div class="category-details">
                                    <h4>Education</h4>
                                    <div class="impact-level impact-high">Significant Improvement</div>
                                    <p>Increased educational access and quality in underserved communities.</p>
                                </div>
                            </div>
                            
                            <div class="impact-category">
                                <div class="category-icon">💼</div>
                                <div class="category-details">
                                    <h4>Economic Opportunity</h4>
                                    <div class="impact-level impact-low">Minimal Improvement</div>
                                    <p>Limited job creation and economic growth stimulation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="projection-section">
                        <h3>Financial Legacy</h3>
                        <p>The project's financial impact over time:</p>
                        
                        <div class="financial-projection">
                            <div class="projection-metric">
                                <span class="metric-label">Debt Servicing Burden:</span>
                                <span class="metric-value">12% of annual budget</span>
                            </div>
                            
                            <div class="projection-metric">
                                <span class="metric-label">Return on Investment:</span>
                                <span class="metric-value">1.4x over 10 years</span>
                            </div>
                            
                            <div class="projection-metric">
                                <span class="metric-label">Financial Sustainability:</span>
                                <span class="metric-value">Partially self-sustaining after 7 years</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            impactHTML += '</div>';
            
            impactContainer.innerHTML = impactHTML;
        },
        
        /**
         * Show phase introduction dialog
         */
        showPhaseIntroduction: function() {
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: 'Outcome Phase',
                    content: `
                        <div class="phase-introduction">
                            <p>Welcome to the Outcome Phase of the AidCraft simulation!</p>
                            <p>In this final phase, you will see the results of all your decisions:</p>
                            <ul>
                                <li>Review overall project success metrics</li>
                                <li>Discover any hidden debt implications</li>
                                <li>Explore long-term impacts of your development strategy</li>
                            </ul>
                            <p>This is the opportunity to reflect on your decision-making process and the consequences of your choices.</p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'View Outcomes',
                            action: 'begin',
                            class: 'btn-primary'
                        }
                    ]
                }
            }));
        },
        
        /**
         * Handle phase-specific interactions
         * @param {Event} event - DOM event
         */
        handleOutcomeInteractions: function(event) {
            // Implementation specific to outcome phase interactions
        }
    };
    
    // Register the module
    window.outcomePhase = OutcomePhase;
})(); 