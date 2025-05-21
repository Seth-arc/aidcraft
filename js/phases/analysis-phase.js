/**
 * Analysis Phase
 * Handles the analysis phase of the AidCraft simulation
 */
(function() {
    const AnalysisPhase = {
        initialized: false,
        stateManager: null,
        gameEngine: null,
        
        /**
         * Initialize the analysis phase
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }
            
            console.log('Initializing Analysis Phase...');
            
            // Get dependencies
            this.stateManager = window.stateManager;
            this.gameEngine = window.gameEngine;
            
            return new Promise((resolve, reject) => {
                if (!this.stateManager || !this.gameEngine) {
                    reject(new Error('Dependencies not available for Analysis Phase'));
                    return;
                }
                
                // Register event handlers
                document.addEventListener('aidcraft:phaseChange', this.handlePhaseChange.bind(this));
                
                this.initialized = true;
                console.log('Analysis Phase initialized');
                resolve();
            });
        },
        
        /**
         * Handle phase change event
         * @param {Object} event - Custom event with phase change details
         */
        handlePhaseChange: function(event) {
            const { newPhase, oldPhase } = event.detail;
            
            if (newPhase === 'analysis') {
                console.log('Activating Analysis Phase');
                this.activatePhase();
            } else if (oldPhase === 'analysis') {
                console.log('Deactivating Analysis Phase');
                this.deactivatePhase();
            }
        },
        
        /**
         * Activate the analysis phase
         */
        activatePhase: function() {
            // Initialize phase-specific UI elements
            this.initializeStakeholderMap();
            this.initializeNeedsAssessment();
            this.initializeRiskAnalysis();
            
            // Set up event listeners for phase-specific interactions
            document.addEventListener('click', this.handleAnalysisInteractions);
            
            // Show phase introduction if first time
            if (!this.stateManager.getState('phases.analysis.introduced', false)) {
                this.showPhaseIntroduction();
                this.stateManager.setState('phases.analysis.introduced', true);
            }
        },
        
        /**
         * Deactivate the analysis phase
         */
        deactivatePhase: function() {
            // Remove event listeners
            document.removeEventListener('click', this.handleAnalysisInteractions);
            
            // Save phase state if needed
            this.savePhaseState();
        },
        
        /**
         * Save current phase state
         */
        savePhaseState: function() {
            // Create a snapshot of analysis-specific state
            const snapshot = {
                stakeholderMap: this.stateManager.getState('phases.analysis.stakeholderMap', {}),
                needsAssessment: this.stateManager.getState('phases.analysis.needsAssessment', {}),
                riskAnalysis: this.stateManager.getState('phases.analysis.riskAnalysis', {})
            };
            
            // Save to state
            this.stateManager.setState('phases.analysis.snapshot', snapshot);
        },
        
        /**
         * Initialize stakeholder mapping interface
         */
        initializeStakeholderMap: function() {
            const stakeholderMapContainer = document.getElementById('stakeholder-map');
            if (!stakeholderMapContainer) return;
            
            // Load stakeholder data
            const stakeholders = window.dataLoader.getStakeholders();
            if (!stakeholders || !stakeholders.length) {
                console.error('No stakeholder data available');
                return;
            }
            
            // Generate stakeholder map visualization
            let mapHTML = '<div class="stakeholder-map-container">';
            stakeholders.forEach(stakeholder => {
                mapHTML += `
                    <div class="stakeholder-card" data-stakeholder-id="${stakeholder.id}">
                        <div class="stakeholder-avatar">
                            <img src="${stakeholder.image || 'assets/images/stakeholders/default.png'}" alt="${stakeholder.name}">
                        </div>
                        <div class="stakeholder-info">
                            <h3 class="stakeholder-name">${stakeholder.name}</h3>
                            <p class="stakeholder-role">${stakeholder.role}</p>
                        </div>
                    </div>
                `;
            });
            mapHTML += '</div>';
            
            stakeholderMapContainer.innerHTML = mapHTML;
            
            // Initialize relationship visualization
            if (window.dataVisualization) {
                window.dataVisualization.createRelationshipGraph('stakeholder-relationships');
            }
        },
        
        /**
         * Initialize needs assessment interface
         */
        initializeNeedsAssessment: function() {
            const needsAssessmentContainer = document.getElementById('needs-assessment');
            if (!needsAssessmentContainer) return;
            
            // Generate needs assessment UI
            const needsCategories = [
                { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️' },
                { id: 'education', name: 'Education', icon: '🎓' },
                { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
                { id: 'economic', name: 'Economic Development', icon: '📈' },
                { id: 'governance', name: 'Governance', icon: '🏛️' }
            ];
            
            let needsHTML = '<div class="needs-assessment-container">';
            needsHTML += '<h2>Development Needs Assessment</h2>';
            needsHTML += '<div class="needs-categories">';
            
            needsCategories.forEach(category => {
                const priorityValue = this.stateManager.getState(`phases.analysis.needsAssessment.${category.id}`, 0);
                
                needsHTML += `
                    <div class="needs-category" data-category-id="${category.id}">
                        <div class="category-icon">${category.icon}</div>
                        <div class="category-info">
                            <h3>${category.name}</h3>
                            <div class="priority-slider-container">
                                <input type="range" min="0" max="100" value="${priorityValue}" 
                                    class="priority-slider" id="priority-${category.id}">
                                <span class="priority-value">${priorityValue}%</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            needsHTML += '</div>';
            needsHTML += '<button class="btn btn-primary save-needs">Save Assessment</button>';
            needsHTML += '</div>';
            
            needsAssessmentContainer.innerHTML = needsHTML;
            
            // Add event listeners for sliders
            needsAssessmentContainer.querySelectorAll('.priority-slider').forEach(slider => {
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    e.target.parentNode.querySelector('.priority-value').textContent = `${value}%`;
                });
            });
            
            // Add save button handler
            needsAssessmentContainer.querySelector('.save-needs').addEventListener('click', () => {
                this.saveNeedsAssessment();
            });
        },
        
        /**
         * Save needs assessment values to state
         */
        saveNeedsAssessment: function() {
            const sliders = document.querySelectorAll('.priority-slider');
            
            sliders.forEach(slider => {
                const categoryId = slider.id.replace('priority-', '');
                const value = parseInt(slider.value, 10);
                
                this.stateManager.setState(`phases.analysis.needsAssessment.${categoryId}`, value);
            });
            
            // Show confirmation
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: 'Needs assessment saved successfully',
                    type: 'success'
                }
            }));
            
            // Check for phase progress update
            this.updatePhaseProgress();
        },
        
        /**
         * Initialize risk analysis interface
         */
        initializeRiskAnalysis: function() {
            const riskAnalysisContainer = document.getElementById('risk-analysis');
            if (!riskAnalysisContainer) return;
            
            // Generate risk analysis UI
            const riskCategories = [
                { id: 'financial', name: 'Financial Risks', description: 'Risks related to funding, costs, and financial sustainability' },
                { id: 'political', name: 'Political Risks', description: 'Risks related to political stability, elections, and government changes' },
                { id: 'environmental', name: 'Environmental Risks', description: 'Risks related to climate conditions, natural disasters, and environmental impacts' },
                { id: 'social', name: 'Social Risks', description: 'Risks related to community acceptance, cultural factors, and social cohesion' },
                { id: 'operational', name: 'Operational Risks', description: 'Risks related to implementation, logistics, and project management' }
            ];
            
            let riskHTML = '<div class="risk-analysis-container">';
            riskHTML += '<h2>Project Risk Analysis</h2>';
            riskHTML += '<div class="risk-categories">';
            
            riskCategories.forEach(category => {
                const riskAssessment = this.stateManager.getState(`phases.analysis.riskAnalysis.${category.id}`, {
                    impact: 'medium',
                    probability: 'medium',
                    notes: ''
                });
                
                riskHTML += `
                    <div class="risk-category" data-risk-id="${category.id}">
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                        <div class="risk-assessment">
                            <div class="risk-field">
                                <label for="${category.id}-impact">Impact:</label>
                                <select id="${category.id}-impact" class="risk-impact">
                                    <option value="low" ${riskAssessment.impact === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${riskAssessment.impact === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${riskAssessment.impact === 'high' ? 'selected' : ''}>High</option>
                                </select>
                            </div>
                            <div class="risk-field">
                                <label for="${category.id}-probability">Probability:</label>
                                <select id="${category.id}-probability" class="risk-probability">
                                    <option value="low" ${riskAssessment.probability === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${riskAssessment.probability === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${riskAssessment.probability === 'high' ? 'selected' : ''}>High</option>
                                </select>
                            </div>
                            <div class="risk-field">
                                <label for="${category.id}-notes">Notes:</label>
                                <textarea id="${category.id}-notes" class="risk-notes">${riskAssessment.notes}</textarea>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            riskHTML += '</div>';
            riskHTML += '<button class="btn btn-primary save-risks">Save Risk Analysis</button>';
            riskHTML += '</div>';
            
            riskAnalysisContainer.innerHTML = riskHTML;
            
            // Add save button handler
            riskAnalysisContainer.querySelector('.save-risks').addEventListener('click', () => {
                this.saveRiskAnalysis();
            });
        },
        
        /**
         * Save risk analysis values to state
         */
        saveRiskAnalysis: function() {
            const riskCategories = document.querySelectorAll('.risk-category');
            
            riskCategories.forEach(category => {
                const riskId = category.getAttribute('data-risk-id');
                const impact = category.querySelector('.risk-impact').value;
                const probability = category.querySelector('.risk-probability').value;
                const notes = category.querySelector('.risk-notes').value;
                
                this.stateManager.setState(`phases.analysis.riskAnalysis.${riskId}`, {
                    impact,
                    probability,
                    notes
                });
            });
            
            // Show confirmation
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: 'Risk analysis saved successfully',
                    type: 'success'
                }
            }));
            
            // Check for phase progress update
            this.updatePhaseProgress();
        },
        
        /**
         * Show phase introduction dialog
         */
        showPhaseIntroduction: function() {
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: 'Analysis Phase',
                    content: `
                        <div class="phase-introduction">
                            <p>Welcome to the Analysis Phase of the AidCraft simulation!</p>
                            <p>In this phase, you will:</p>
                            <ul>
                                <li>Map key stakeholders and their relationships</li>
                                <li>Conduct a development needs assessment</li>
                                <li>Analyze project risks</li>
                            </ul>
                            <p>Your analysis will inform the funding options available in the next phase.</p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Begin Analysis',
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
        handleAnalysisInteractions: function(event) {
            // Handle stakeholder card clicks
            const stakeholderCard = event.target.closest('.stakeholder-card');
            if (stakeholderCard) {
                const stakeholderId = stakeholderCard.getAttribute('data-stakeholder-id');
                AnalysisPhase.showStakeholderDetails(stakeholderId);
            }
        },
        
        /**
         * Show stakeholder details
         * @param {string} stakeholderId - ID of the stakeholder to show
         */
        showStakeholderDetails: function(stakeholderId) {
            const stakeholder = window.dataLoader.getStakeholder(stakeholderId);
            if (!stakeholder) return;
            
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: stakeholder.name,
                    content: `
                        <div class="stakeholder-details">
                            <div class="stakeholder-portrait">
                                <img src="${stakeholder.image || 'assets/images/stakeholders/default.png'}" alt="${stakeholder.name}">
                            </div>
                            <div class="stakeholder-description">
                                <p><strong>Role:</strong> ${stakeholder.role}</p>
                                <p><strong>Influence:</strong> ${stakeholder.influence || 'Medium'}</p>
                                <p><strong>Interests:</strong> ${stakeholder.interests || 'Not specified'}</p>
                                <p>${stakeholder.description || ''}</p>
                            </div>
                            <div class="stakeholder-relationships">
                                <h3>Key Relationships</h3>
                                <ul>
                                    ${this.renderStakeholderRelationships(stakeholderId)}
                                </ul>
                            </div>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Close',
                            action: 'close',
                            class: 'btn-primary'
                        }
                    ]
                }
            }));
        },
        
        /**
         * Render stakeholder relationships HTML
         * @param {string} stakeholderId - ID of the stakeholder to show relationships for
         * @returns {string} HTML for stakeholder relationships
         */
        renderStakeholderRelationships: function(stakeholderId) {
            const relationships = this.stateManager.getState(`stakeholderRelationships.${stakeholderId}`, {});
            let html = '';
            
            Object.entries(relationships).forEach(([relatedId, relation]) => {
                const relatedStakeholder = window.dataLoader.getStakeholder(relatedId);
                if (!relatedStakeholder) return;
                
                const strengthClass = relation.strength > 0.7 ? 'strong' : 
                                    relation.strength > 0.3 ? 'moderate' : 'weak';
                
                html += `
                    <li class="relationship ${strengthClass}">
                        <span class="related-name">${relatedStakeholder.name}</span>
                        <span class="relationship-type">${relation.type || 'neutral'}</span>
                    </li>
                `;
            });
            
            if (html === '') {
                html = '<li>No significant relationships identified yet.</li>';
            }
            
            return html;
        },
        
        /**
         * Update phase progress based on completed activities
         */
        updatePhaseProgress: function() {
            // Calculate how many analysis activities have been completed
            let completedActivities = 0;
            let totalActivities = 3; // Stakeholder mapping, needs assessment, risk analysis
            
            // Check if stakeholder mapping has meaningful data
            const stakeholderMap = this.stateManager.getState('phases.analysis.stakeholderMap', {});
            if (Object.keys(stakeholderMap).length > 0) {
                completedActivities++;
            }
            
            // Check if needs assessment has been done
            const needsAssessment = this.stateManager.getState('phases.analysis.needsAssessment', {});
            if (Object.keys(needsAssessment).length > 0) {
                completedActivities++;
            }
            
            // Check if risk analysis has been done
            const riskAnalysis = this.stateManager.getState('phases.analysis.riskAnalysis', {});
            if (Object.keys(riskAnalysis).length > 0) {
                completedActivities++;
            }
            
            // Calculate progress percentage
            const progress = completedActivities / totalActivities;
            
            // Update phase progress in state
            this.stateManager.setState('phaseProgress.analysis', progress);
            
            // If all activities completed, mark phase as complete
            if (progress >= 1) {
                document.dispatchEvent(new CustomEvent('aidcraft:phaseComplete', {
                    detail: { phase: 'analysis' }
                }));
            }
        }
    };
    
    // Register the module
    window.analysisPhase = AnalysisPhase;
})(); 