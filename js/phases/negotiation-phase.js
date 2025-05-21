/**
 * Negotiation Phase
 * Handles the negotiation phase of the AidCraft simulation
 */
(function() {
    const NegotiationPhase = {
        initialized: false,
        stateManager: null,
        gameEngine: null,
        
        /**
         * Initialize the negotiation phase
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }
            
            console.log('Initializing Negotiation Phase...');
            
            // Get dependencies
            this.stateManager = window.stateManager;
            this.gameEngine = window.gameEngine;
            
            return new Promise((resolve, reject) => {
                if (!this.stateManager || !this.gameEngine) {
                    reject(new Error('Dependencies not available for Negotiation Phase'));
                    return;
                }
                
                // Register event handlers
                document.addEventListener('aidcraft:phaseChange', this.handlePhaseChange.bind(this));
                
                this.initialized = true;
                console.log('Negotiation Phase initialized');
                resolve();
            });
        },
        
        /**
         * Handle phase change event
         * @param {Object} event - Custom event with phase change details
         */
        handlePhaseChange: function(event) {
            const { newPhase, oldPhase } = event.detail;
            
            if (newPhase === 'negotiation') {
                console.log('Activating Negotiation Phase');
                this.activatePhase();
            } else if (oldPhase === 'negotiation') {
                console.log('Deactivating Negotiation Phase');
                this.deactivatePhase();
            }
        },
        
        /**
         * Activate the negotiation phase
         */
        activatePhase: function() {
            // Initialize phase-specific UI elements
            this.initializeStakeholderNegotiations();
            this.initializeAgreementBuilder();
            this.initializeCoalitionManager();
            
            // Set up event listeners for phase-specific interactions
            document.addEventListener('click', this.handleNegotiationInteractions);
            
            // Show phase introduction if first time
            if (!this.stateManager.getState('phases.negotiation.introduced', false)) {
                this.showPhaseIntroduction();
                this.stateManager.setState('phases.negotiation.introduced', true);
            }
        },
        
        /**
         * Deactivate the negotiation phase
         */
        deactivatePhase: function() {
            // Remove event listeners
            document.removeEventListener('click', this.handleNegotiationInteractions);
            
            // Save phase state if needed
            this.savePhaseState();
        },
        
        /**
         * Save current phase state
         */
        savePhaseState: function() {
            // Create a snapshot of negotiation-specific state
            const snapshot = {
                stakeholderInteractions: this.stateManager.getState('phases.negotiation.stakeholderInteractions', {}),
                agreements: this.stateManager.getState('phases.negotiation.agreements', {}),
                coalitions: this.stateManager.getState('phases.negotiation.coalitions', {})
            };
            
            // Save to state
            this.stateManager.setState('phases.negotiation.snapshot', snapshot);
        },
        
        /**
         * Initialize stakeholder negotiations interface
         */
        initializeStakeholderNegotiations: function() {
            const negotiationsContainer = document.getElementById('stakeholder-negotiations');
            if (!negotiationsContainer) return;
            
            // Load stakeholder data
            const stakeholders = window.dataLoader.getStakeholders();
            if (!stakeholders || !stakeholders.length) {
                console.error('No stakeholder data available');
                return;
            }
            
            // Get previous interactions if any
            const interactions = this.stateManager.getState('phases.negotiation.stakeholderInteractions', {});
            
            // Generate stakeholder negotiations UI
            let negotiationsHTML = '<div class="stakeholder-negotiations-container">';
            negotiationsHTML += '<h2>Stakeholder Negotiations</h2>';
            negotiationsHTML += '<div class="stakeholders-grid">';
            
            stakeholders.forEach(stakeholder => {
                const hasInteracted = interactions[stakeholder.id] && interactions[stakeholder.id].hasInteracted;
                const relationshipLevel = this.getRelationshipLevel(stakeholder.id);
                
                negotiationsHTML += `
                    <div class="stakeholder-card ${hasInteracted ? 'interacted' : ''}" data-stakeholder-id="${stakeholder.id}">
                        <div class="stakeholder-avatar">
                            <img src="${stakeholder.image || 'assets/images/stakeholders/default.png'}" alt="${stakeholder.name}">
                        </div>
                        <div class="stakeholder-info">
                            <h3 class="stakeholder-name">${stakeholder.name}</h3>
                            <p class="stakeholder-role">${stakeholder.role}</p>
                            <div class="relationship-indicator relationship-${relationshipLevel}">
                                Relationship: ${relationshipLevel.charAt(0).toUpperCase() + relationshipLevel.slice(1)}
                            </div>
                        </div>
                        <button class="btn ${hasInteracted ? 'btn-secondary' : 'btn-primary'} negotiate-btn" data-stakeholder-id="${stakeholder.id}">
                            ${hasInteracted ? 'Continue Negotiation' : 'Start Negotiation'}
                        </button>
                    </div>
                `;
            });
            
            negotiationsHTML += '</div>';
            negotiationsHTML += '</div>';
            
            negotiationsContainer.innerHTML = negotiationsHTML;
            
            // Add event listeners for negotiation buttons
            negotiationsContainer.querySelectorAll('.negotiate-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const stakeholderId = e.target.getAttribute('data-stakeholder-id');
                    this.startNegotiation(stakeholderId);
                });
            });
        },
        
        /**
         * Get relationship level with a stakeholder
         * @param {string} stakeholderId - ID of the stakeholder
         * @returns {string} Relationship level (strong, moderate, weak, negative)
         */
        getRelationshipLevel: function(stakeholderId) {
            // In a real implementation this would check relationship strength from state
            // For now use a simplified approach
            const relationships = this.stateManager.getState('stakeholderRelationships', {});
            const playerRelationship = relationships[stakeholderId] && relationships[stakeholderId].player;
            
            if (playerRelationship) {
                const strength = playerRelationship.strength || 0.5;
                
                if (strength >= 0.7) return 'strong';
                if (strength >= 0.4) return 'moderate';
                if (strength >= 0.1) return 'weak';
                return 'negative';
            }
            
            return 'moderate'; // Default
        },
        
        /**
         * Start negotiation with a stakeholder
         * @param {string} stakeholderId - ID of the stakeholder to negotiate with
         */
        startNegotiation: function(stakeholderId) {
            const stakeholder = window.dataLoader.getStakeholder(stakeholderId);
            if (!stakeholder) return;
            
            // Record interaction in state
            const interactions = this.stateManager.getState('phases.negotiation.stakeholderInteractions', {});
            interactions[stakeholderId] = {
                hasInteracted: true,
                lastInteraction: Date.now()
            };
            this.stateManager.setState('phases.negotiation.stakeholderInteractions', interactions);
            
            // Update UI to show interaction occurred
            const stakeholderCard = document.querySelector(`.stakeholder-card[data-stakeholder-id="${stakeholderId}"]`);
            if (stakeholderCard) {
                stakeholderCard.classList.add('interacted');
                const negotiateBtn = stakeholderCard.querySelector('.negotiate-btn');
                if (negotiateBtn) {
                    negotiateBtn.textContent = 'Continue Negotiation';
                    negotiateBtn.classList.remove('btn-primary');
                    negotiateBtn.classList.add('btn-secondary');
                }
            }
            
            // Show negotiation dialog
            this.showNegotiationDialog(stakeholder);
            
            // Update phase progress
            this.updatePhaseProgress();
        },
        
        /**
         * Show negotiation dialog with a stakeholder
         * @param {Object} stakeholder - Stakeholder data
         */
        showNegotiationDialog: function(stakeholder) {
            // Get negotiation options based on stakeholder
            const options = this.getNegotiationOptions(stakeholder.id);
            
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: `Negotiating with ${stakeholder.name}`,
                    content: `
                        <div class="negotiation-dialog">
                            <div class="stakeholder-details">
                                <div class="stakeholder-portrait">
                                    <img src="${stakeholder.image || 'assets/images/stakeholders/default.png'}" alt="${stakeholder.name}">
                                </div>
                                <div class="stakeholder-info">
                                    <p>${stakeholder.description || 'A key stakeholder in the development project.'}</p>
                                    <p class="stakeholder-interests">Primary interests: ${stakeholder.interests || 'Not specified'}</p>
                                </div>
                            </div>
                            
                            <h3>Negotiation Options</h3>
                            <div class="negotiation-options">
                                ${options.map(option => `
                                    <div class="negotiation-option" data-option-id="${option.id}">
                                        <h4>${option.title}</h4>
                                        <p>${option.description}</p>
                                        <button class="btn btn-primary select-option" data-option-id="${option.id}" data-stakeholder-id="${stakeholder.id}">
                                            Select Option
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Close',
                            action: 'close',
                            class: 'btn-secondary'
                        }
                    ]
                }
            }));
            
            // Add event listeners for negotiation options after modal is created
            setTimeout(() => {
                document.querySelectorAll('.select-option').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const optionId = e.target.getAttribute('data-option-id');
                        const stakeholderId = e.target.getAttribute('data-stakeholder-id');
                        this.selectNegotiationOption(stakeholderId, optionId, options);
                    });
                });
            }, 100);
        },
        
        /**
         * Get negotiation options for a stakeholder
         * @param {string} stakeholderId - ID of the stakeholder
         * @returns {Array} Array of negotiation options
         */
        getNegotiationOptions: function(stakeholderId) {
            // In a real implementation this would load from data based on stakeholder and current state
            // For now use static options
            return [
                {
                    id: 'negotiate-compromise',
                    title: 'Offer Compromise',
                    description: 'Suggest a middle ground position that addresses some of their concerns.',
                    effect: {
                        relationship: 0.1,
                        politicalCapital: -5
                    }
                },
                {
                    id: 'negotiate-concession',
                    title: 'Make Concession',
                    description: 'Give in to their demands to build goodwill.',
                    effect: {
                        relationship: 0.2,
                        politicalCapital: -15
                    }
                },
                {
                    id: 'negotiate-firm',
                    title: 'Stand Firm',
                    description: 'Hold your position without compromise.',
                    effect: {
                        relationship: -0.1,
                        politicalCapital: 5
                    }
                },
                {
                    id: 'negotiate-incentive',
                    title: 'Offer Incentive',
                    description: 'Present additional benefits to gain their support.',
                    effect: {
                        relationship: 0.15,
                        politicalCapital: -10,
                        budget: -50000
                    }
                }
            ];
        },
        
        /**
         * Select a negotiation option
         * @param {string} stakeholderId - ID of the stakeholder
         * @param {string} optionId - ID of the selected option
         * @param {Array} options - Available negotiation options
         */
        selectNegotiationOption: function(stakeholderId, optionId, options) {
            // Find the selected option
            const selectedOption = options.find(option => option.id === optionId);
            if (!selectedOption) return;
            
            // Apply effects
            if (selectedOption.effect) {
                // Update relationship if applicable
                if (selectedOption.effect.relationship) {
                    this.updateStakeholderRelationship(stakeholderId, selectedOption.effect.relationship);
                }
                
                // Update resources if applicable
                if (selectedOption.effect.politicalCapital) {
                    const currentPoliticalCapital = this.stateManager.getState('resources.politicalCapital', 0);
                    this.stateManager.setState('resources.politicalCapital', currentPoliticalCapital + selectedOption.effect.politicalCapital);
                }
                
                if (selectedOption.effect.budget) {
                    const currentBudget = this.stateManager.getState('resources.budget', 0);
                    this.stateManager.setState('resources.budget', currentBudget + selectedOption.effect.budget);
                }
            }
            
            // Record negotiation choice
            const interactions = this.stateManager.getState('phases.negotiation.stakeholderInteractions', {});
            if (!interactions[stakeholderId]) {
                interactions[stakeholderId] = {};
            }
            
            if (!interactions[stakeholderId].choices) {
                interactions[stakeholderId].choices = [];
            }
            
            interactions[stakeholderId].choices.push({
                optionId: optionId,
                timestamp: Date.now()
            });
            
            interactions[stakeholderId].hasInteracted = true;
            interactions[stakeholderId].lastInteraction = Date.now();
            
            this.stateManager.setState('phases.negotiation.stakeholderInteractions', interactions);
            
            // Show result message
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: `Negotiation approach selected: ${selectedOption.title}`,
                    type: 'success'
                }
            }));
            
            // Close negotiation dialog
            document.dispatchEvent(new CustomEvent('aidcraft:closeModal'));
            
            // Update stakeholder card UI to reflect new relationship
            this.updateStakeholderUI(stakeholderId);
            
            // Update phase progress
            this.updatePhaseProgress();
        },
        
        /**
         * Update stakeholder relationship
         * @param {string} stakeholderId - ID of the stakeholder
         * @param {number} change - Change in relationship value
         */
        updateStakeholderRelationship: function(stakeholderId, change) {
            const relationships = this.stateManager.getState('stakeholderRelationships', {});
            
            if (!relationships[stakeholderId]) {
                relationships[stakeholderId] = {};
            }
            
            if (!relationships[stakeholderId].player) {
                relationships[stakeholderId].player = { strength: 0.5 };
            }
            
            // Update strength (clamped between 0 and 1)
            let newStrength = relationships[stakeholderId].player.strength + change;
            newStrength = Math.max(0, Math.min(1, newStrength));
            
            relationships[stakeholderId].player.strength = newStrength;
            
            // Save updated relationships
            this.stateManager.setState('stakeholderRelationships', relationships);
        },
        
        /**
         * Update stakeholder UI to reflect current relationship
         * @param {string} stakeholderId - ID of the stakeholder
         */
        updateStakeholderUI: function(stakeholderId) {
            const card = document.querySelector(`.stakeholder-card[data-stakeholder-id="${stakeholderId}"]`);
            if (!card) return;
            
            const relationshipLevel = this.getRelationshipLevel(stakeholderId);
            const indicator = card.querySelector('.relationship-indicator');
            
            if (indicator) {
                // Remove all relationship classes
                indicator.classList.remove('relationship-strong', 'relationship-moderate', 'relationship-weak', 'relationship-negative');
                
                // Add appropriate class
                indicator.classList.add(`relationship-${relationshipLevel}`);
                
                // Update text
                indicator.textContent = `Relationship: ${relationshipLevel.charAt(0).toUpperCase() + relationshipLevel.slice(1)}`;
            }
        },
        
        /**
         * Initialize agreement builder interface
         */
        initializeAgreementBuilder: function() {
            const agreementContainer = document.getElementById('agreement-builder');
            if (!agreementContainer) return;
            
            // Get saved agreements if any
            const agreements = this.stateManager.getState('phases.negotiation.agreements', []);
            
            // Generate agreement builder UI
            let agreementHTML = '<div class="agreement-builder-container">';
            agreementHTML += '<h2>Development Agreements</h2>';
            
            if (agreements.length === 0) {
                agreementHTML += `
                    <div class="placeholder-message">
                        <p>No agreements have been created yet. Negotiate with stakeholders to create agreements.</p>
                    </div>
                `;
            } else {
                agreementHTML += '<div class="agreements-list">';
                
                agreements.forEach(agreement => {
                    agreementHTML += `
                        <div class="agreement-item">
                            <h3 class="agreement-title">${agreement.title}</h3>
                            <div class="agreement-parties">
                                <strong>Parties:</strong> ${agreement.parties.join(', ')}
                            </div>
                            <p class="agreement-description">${agreement.description}</p>
                            <div class="agreement-terms">
                                <h4>Key Terms:</h4>
                                <ul>
                                    ${agreement.terms.map(term => `<li>${term}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="agreement-status ${agreement.finalized ? 'status-finalized' : 'status-draft'}">
                                Status: ${agreement.finalized ? 'Finalized' : 'Draft'}
                            </div>
                        </div>
                    `;
                });
                
                agreementHTML += '</div>';
            }
            
            agreementHTML += '<button class="btn btn-primary create-agreement">Create New Agreement</button>';
            agreementHTML += '</div>';
            
            agreementContainer.innerHTML = agreementHTML;
            
            // Add event listener for create agreement button
            agreementContainer.querySelector('.create-agreement').addEventListener('click', () => {
                this.showCreateAgreementDialog();
            });
        },
        
        /**
         * Show dialog to create a new agreement
         */
        showCreateAgreementDialog: function() {
            // Get stakeholders who have been negotiated with
            const interactions = this.stateManager.getState('phases.negotiation.stakeholderInteractions', {});
            const stakeholders = window.dataLoader.getStakeholders() || [];
            
            const negotiatedStakeholders = stakeholders.filter(stakeholder => 
                interactions[stakeholder.id] && interactions[stakeholder.id].hasInteracted
            );
            
            if (negotiatedStakeholders.length === 0) {
                document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                    detail: {
                        message: 'You need to negotiate with stakeholders before creating agreements.',
                        type: 'warning'
                    }
                }));
                return;
            }
            
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: 'Create New Agreement',
                    content: `
                        <div class="create-agreement-form">
                            <div class="form-group">
                                <label for="agreement-title">Agreement Title:</label>
                                <input type="text" id="agreement-title" class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="agreement-description">Description:</label>
                                <textarea id="agreement-description" class="form-control" rows="3"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Parties Involved:</label>
                                <div class="stakeholder-checkboxes">
                                    ${negotiatedStakeholders.map(stakeholder => `
                                        <div class="checkbox-item">
                                            <input type="checkbox" id="stakeholder-${stakeholder.id}" value="${stakeholder.id}">
                                            <label for="stakeholder-${stakeholder.id}">${stakeholder.name}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Key Terms:</label>
                                <div class="terms-container">
                                    <div class="term-input">
                                        <input type="text" class="form-control agreement-term" placeholder="Enter a key term">
                                    </div>
                                    <button type="button" class="btn btn-small add-term">+ Add Term</button>
                                </div>
                            </div>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Cancel',
                            action: 'cancel',
                            class: 'btn-secondary'
                        },
                        {
                            text: 'Create Agreement',
                            action: 'create',
                            class: 'btn-primary',
                            callback: () => {
                                this.createAgreement();
                            }
                        }
                    ]
                }
            }));
            
            // Add event listener for add term button after modal is created
            setTimeout(() => {
                const addTermButton = document.querySelector('.add-term');
                if (addTermButton) {
                    addTermButton.addEventListener('click', () => {
                        const termsContainer = document.querySelector('.terms-container');
                        const newInput = document.createElement('div');
                        newInput.className = 'term-input';
                        newInput.innerHTML = '<input type="text" class="form-control agreement-term" placeholder="Enter a key term">';
                        termsContainer.insertBefore(newInput, addTermButton);
                    });
                }
            }, 100);
        },
        
        /**
         * Create a new agreement from form data
         */
        createAgreement: function() {
            // Get form values
            const title = document.getElementById('agreement-title').value.trim();
            const description = document.getElementById('agreement-description').value.trim();
            
            // Get selected stakeholders
            const selectedStakeholders = [];
            document.querySelectorAll('.stakeholder-checkboxes input:checked').forEach(checkbox => {
                const stakeholderId = checkbox.value;
                const stakeholder = window.dataLoader.getStakeholder(stakeholderId);
                if (stakeholder) {
                    selectedStakeholders.push(stakeholder.name);
                }
            });
            
            // Get terms
            const terms = [];
            document.querySelectorAll('.agreement-term').forEach(input => {
                const term = input.value.trim();
                if (term) {
                    terms.push(term);
                }
            });
            
            // Validate
            if (!title) {
                document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                    detail: {
                        message: 'Please enter an agreement title',
                        type: 'warning'
                    }
                }));
                return;
            }
            
            if (selectedStakeholders.length === 0) {
                document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                    detail: {
                        message: 'Please select at least one stakeholder',
                        type: 'warning'
                    }
                }));
                return;
            }
            
            if (terms.length === 0) {
                document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                    detail: {
                        message: 'Please add at least one key term',
                        type: 'warning'
                    }
                }));
                return;
            }
            
            // Create agreement object
            const agreement = {
                id: 'agreement-' + Date.now(),
                title: title,
                description: description,
                parties: selectedStakeholders,
                terms: terms,
                finalized: false,
                createdAt: Date.now()
            };
            
            // Save to state
            const agreements = this.stateManager.getState('phases.negotiation.agreements', []);
            agreements.push(agreement);
            this.stateManager.setState('phases.negotiation.agreements', agreements);
            
            // Close modal
            document.dispatchEvent(new CustomEvent('aidcraft:closeModal'));
            
            // Show success message
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: 'Agreement created successfully',
                    type: 'success'
                }
            }));
            
            // Refresh agreement UI
            this.initializeAgreementBuilder();
            
            // Update phase progress
            this.updatePhaseProgress();
        },
        
        /**
         * Initialize coalition manager interface
         */
        initializeCoalitionManager: function() {
            const coalitionContainer = document.getElementById('coalition-manager');
            if (!coalitionContainer) return;
            
            // Get saved coalitions if any
            const coalitions = this.stateManager.getState('phases.negotiation.coalitions', []);
            
            // Generate coalition manager UI
            let coalitionHTML = '<div class="coalition-manager-container">';
            coalitionHTML += '<h2>Stakeholder Coalitions</h2>';
            
            // Simple placeholder for now
            coalitionHTML += `
                <div class="placeholder-message">
                    <p>Coalition management has not been implemented in this prototype.</p>
                    <p>This feature would allow building alliances between stakeholders.</p>
                </div>
            `;
            
            coalitionHTML += '</div>';
            
            coalitionContainer.innerHTML = coalitionHTML;
        },
        
        /**
         * Show phase introduction dialog
         */
        showPhaseIntroduction: function() {
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: 'Negotiation Phase',
                    content: `
                        <div class="phase-introduction">
                            <p>Welcome to the Negotiation Phase of the AidCraft simulation!</p>
                            <p>In this phase, you will:</p>
                            <ul>
                                <li>Negotiate with key stakeholders to build support</li>
                                <li>Develop formal agreements to secure commitments</li>
                                <li>Manage stakeholder relationships and expectations</li>
                            </ul>
                            <p>Your negotiation approaches will determine the level of support for your development project.</p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Begin Negotiations',
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
        handleNegotiationInteractions: function(event) {
            // Implementation specific to negotiation phase interactions
        },
        
        /**
         * Update phase progress based on completed activities
         */
        updatePhaseProgress: function() {
            // Calculate progress based on stakeholder interactions and agreements
            const interactions = this.stateManager.getState('phases.negotiation.stakeholderInteractions', {});
            const interactedStakeholders = Object.keys(interactions).filter(id => 
                interactions[id] && interactions[id].hasInteracted
            );
            
            const agreements = this.stateManager.getState('phases.negotiation.agreements', []);
            
            // Total stakeholders (simplified)
            const totalStakeholders = window.dataLoader.getStakeholders()?.length || 5;
            
            // Calculate progress from stakeholder interactions and agreements
            const interactionProgress = Math.min(1, interactedStakeholders.length / totalStakeholders);
            const agreementProgress = Math.min(1, agreements.length / 2); // Assume 2 agreements is "complete"
            
            // Combined progress (weighted)
            const progress = (interactionProgress * 0.7) + (agreementProgress * 0.3);
            
            // Update phase progress in state
            this.stateManager.setState('phaseProgress.negotiation', progress);
            
            // If progress sufficient, mark phase as complete
            if (progress >= 0.8) {
                document.dispatchEvent(new CustomEvent('aidcraft:phaseComplete', {
                    detail: { phase: 'negotiation' }
                }));
            }
        }
    };
    
    // Register the module
    window.negotiationPhase = NegotiationPhase;
})(); 