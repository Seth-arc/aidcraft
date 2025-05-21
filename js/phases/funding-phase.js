/**
 * Funding Phase
 * Handles the funding phase of the AidCraft simulation
 */
(function() {
    const FundingPhase = {
        initialized: false,
        stateManager: null,
        gameEngine: null,
        
        /**
         * Initialize the funding phase
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }
            
            console.log('Initializing Funding Phase...');
            
            // Get dependencies
            this.stateManager = window.stateManager;
            this.gameEngine = window.gameEngine;
            
            return new Promise((resolve, reject) => {
                if (!this.stateManager || !this.gameEngine) {
                    reject(new Error('Dependencies not available for Funding Phase'));
                    return;
                }
                
                // Register event handlers
                document.addEventListener('aidcraft:phaseChange', this.handlePhaseChange.bind(this));
                
                this.initialized = true;
                console.log('Funding Phase initialized');
                resolve();
            });
        },
        
        /**
         * Handle phase change event
         * @param {Object} event - Custom event with phase change details
         */
        handlePhaseChange: function(event) {
            const { newPhase, oldPhase } = event.detail;
            
            if (newPhase === 'funding') {
                console.log('Activating Funding Phase');
                this.activatePhase();
            } else if (oldPhase === 'funding') {
                console.log('Deactivating Funding Phase');
                this.deactivatePhase();
            }
        },
        
        /**
         * Activate the funding phase
         */
        activatePhase: function() {
            // Initialize phase-specific UI elements
            this.initializeFundingSources();
            this.initializeBudgetAllocation();
            this.initializeCostBenefitAnalysis();
            
            // Set up event listeners for phase-specific interactions
            document.addEventListener('click', this.handleFundingInteractions);
            
            // Show phase introduction if first time
            if (!this.stateManager.getState('phases.funding.introduced', false)) {
                this.showPhaseIntroduction();
                this.stateManager.setState('phases.funding.introduced', true);
            }
        },
        
        /**
         * Deactivate the funding phase
         */
        deactivatePhase: function() {
            // Remove event listeners
            document.removeEventListener('click', this.handleFundingInteractions);
            
            // Save phase state if needed
            this.savePhaseState();
        },
        
        /**
         * Save current phase state
         */
        savePhaseState: function() {
            // Create a snapshot of funding-specific state
            const snapshot = {
                selectedFunding: this.stateManager.getState('phases.funding.selectedFunding', {}),
                budgetAllocation: this.stateManager.getState('phases.funding.budgetAllocation', {}),
                costBenefitAnalysis: this.stateManager.getState('phases.funding.costBenefitAnalysis', {})
            };
            
            // Save to state
            this.stateManager.setState('phases.funding.snapshot', snapshot);
        },
        
        /**
         * Initialize funding sources interface
         */
        initializeFundingSources: function() {
            const fundingSourcesContainer = document.getElementById('funding-sources');
            if (!fundingSourcesContainer) return;
            
            // Load funding options
            const fundingOptions = [
                {
                    id: 'domestic-bonds',
                    name: 'Domestic Bonds',
                    description: 'Issue bonds in the local market to raise funds.',
                    interestRate: '7.5%',
                    term: '10 years',
                    risks: 'Medium',
                    maxAmount: 500000,
                    hiddenDebtRisk: 'Low'
                },
                {
                    id: 'international-loan',
                    name: 'International Development Loan',
                    description: 'Secure a loan from international development banks.',
                    interestRate: '2.5%',
                    term: '25 years',
                    risks: 'Low',
                    maxAmount: 1000000,
                    hiddenDebtRisk: 'Medium'
                },
                {
                    id: 'private-partnership',
                    name: 'Private Sector Partnership',
                    description: 'Partner with private companies for joint funding.',
                    interestRate: 'Variable',
                    term: '15 years',
                    risks: 'High',
                    maxAmount: 750000,
                    hiddenDebtRisk: 'High'
                },
                {
                    id: 'bilateral-funding',
                    name: 'Bilateral Funding Agreement',
                    description: 'Direct agreement with another government.',
                    interestRate: '3.0%',
                    term: '20 years',
                    risks: 'Medium',
                    maxAmount: 850000,
                    hiddenDebtRisk: 'Medium'
                }
            ];
            
            // Get selected funding option if any
            const selectedFunding = this.stateManager.getState('phases.funding.selectedFunding', null);
            
            // Generate funding options UI
            let fundingHTML = '<div class="funding-sources-container">';
            fundingHTML += '<h2>Available Funding Options</h2>';
            fundingHTML += '<div class="funding-options">';
            
            fundingOptions.forEach(option => {
                const isSelected = selectedFunding && selectedFunding.id === option.id;
                
                fundingHTML += `
                    <div class="funding-option ${isSelected ? 'selected' : ''}" data-option-id="${option.id}">
                        <h3 class="option-name">${option.name}</h3>
                        <p class="option-description">${option.description}</p>
                        <div class="option-details">
                            <div class="detail-item">
                                <span class="detail-label">Interest Rate:</span>
                                <span class="detail-value">${option.interestRate}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Term:</span>
                                <span class="detail-value">${option.term}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Risk Level:</span>
                                <span class="detail-value">${option.risks}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Maximum Amount:</span>
                                <span class="detail-value">$${option.maxAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary select-funding" data-option-id="${option.id}">
                            ${isSelected ? 'Selected' : 'Select Option'}
                        </button>
                    </div>
                `;
            });
            
            fundingHTML += '</div>';
            fundingHTML += '</div>';
            
            fundingSourcesContainer.innerHTML = fundingHTML;
            
            // Add event listeners for funding selection
            fundingSourcesContainer.querySelectorAll('.select-funding').forEach(button => {
                button.addEventListener('click', (e) => {
                    const optionId = e.target.getAttribute('data-option-id');
                    this.selectFundingOption(optionId, fundingOptions);
                });
            });
        },
        
        /**
         * Select a funding option
         * @param {string} optionId - ID of the selected funding option
         * @param {Array} fundingOptions - Array of available funding options
         */
        selectFundingOption: function(optionId, fundingOptions) {
            // Find the selected option
            const selectedOption = fundingOptions.find(option => option.id === optionId);
            if (!selectedOption) return;
            
            // Save to state
            this.stateManager.setState('phases.funding.selectedFunding', selectedOption);
            
            // Update resources based on selected funding
            this.stateManager.setState('resources.budget', selectedOption.maxAmount);
            
            // Update UI to show selected option
            const fundingOptions = document.querySelectorAll('.funding-option');
            fundingOptions.forEach(option => {
                if (option.getAttribute('data-option-id') === optionId) {
                    option.classList.add('selected');
                    option.querySelector('.select-funding').textContent = 'Selected';
                } else {
                    option.classList.remove('selected');
                    option.querySelector('.select-funding').textContent = 'Select Option';
                }
            });
            
            // Show confirmation message
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: `Selected ${selectedOption.name} as funding source`,
                    type: 'success'
                }
            }));
            
            // Update phase progress
            this.updatePhaseProgress();
            
            // Trigger funding selection event for other components
            document.dispatchEvent(new CustomEvent('aidcraft:fundingSelected', {
                detail: { fundingOption: selectedOption }
            }));
        },
        
        /**
         * Initialize budget allocation interface
         */
        initializeBudgetAllocation: function() {
            const budgetContainer = document.getElementById('budget-allocation');
            if (!budgetContainer) return;
            
            // Get current budget
            const totalBudget = this.stateManager.getState('resources.budget', 0);
            
            // Get saved allocations if any
            const savedAllocations = this.stateManager.getState('phases.funding.budgetAllocation', {});
            
            // Budget categories based on analysis phase needs assessment
            const budgetCategories = [
                { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️', allocation: savedAllocations.infrastructure || 0 },
                { id: 'education', name: 'Education', icon: '🎓', allocation: savedAllocations.education || 0 },
                { id: 'healthcare', name: 'Healthcare', icon: '🏥', allocation: savedAllocations.healthcare || 0 },
                { id: 'economic', name: 'Economic Development', icon: '📈', allocation: savedAllocations.economic || 0 },
                { id: 'governance', name: 'Governance', icon: '🏛️', allocation: savedAllocations.governance || 0 },
                { id: 'reserve', name: 'Reserve Fund', icon: '💰', allocation: savedAllocations.reserve || 0 }
            ];
            
            // Calculate allocated and remaining budget
            const allocatedBudget = budgetCategories.reduce((sum, category) => sum + category.allocation, 0);
            const remainingBudget = totalBudget - allocatedBudget;
            
            // Generate budget allocation UI
            let budgetHTML = '<div class="budget-allocation-container">';
            budgetHTML += '<h2>Budget Allocation</h2>';
            
            budgetHTML += `
                <div class="budget-summary">
                    <div class="budget-item">
                        <span class="budget-label">Total Budget:</span>
                        <span class="budget-value">$${totalBudget.toLocaleString()}</span>
                    </div>
                    <div class="budget-item">
                        <span class="budget-label">Allocated:</span>
                        <span class="budget-value">$${allocatedBudget.toLocaleString()}</span>
                    </div>
                    <div class="budget-item ${remainingBudget < 0 ? 'budget-negative' : ''}">
                        <span class="budget-label">Remaining:</span>
                        <span class="budget-value">$${remainingBudget.toLocaleString()}</span>
                    </div>
                </div>
            `;
            
            budgetHTML += '<div class="budget-categories">';
            
            budgetCategories.forEach(category => {
                // Calculate percentage of total budget
                const percentage = totalBudget > 0 ? (category.allocation / totalBudget) * 100 : 0;
                
                budgetHTML += `
                    <div class="budget-category" data-category-id="${category.id}">
                        <div class="category-header">
                            <div class="category-icon">${category.icon}</div>
                            <h3 class="category-name">${category.name}</h3>
                        </div>
                        <div class="allocation-controls">
                            <input type="number" class="allocation-input" value="${category.allocation}" 
                                min="0" max="${totalBudget}" step="10000" data-category-id="${category.id}">
                            <div class="allocation-percentage">${percentage.toFixed(1)}%</div>
                        </div>
                        <div class="allocation-bar">
                            <div class="allocation-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            });
            
            budgetHTML += '</div>';
            budgetHTML += '<button class="btn btn-primary save-budget">Save Allocation</button>';
            budgetHTML += '</div>';
            
            budgetContainer.innerHTML = budgetHTML;
            
            // Add event listeners for allocation inputs
            budgetContainer.querySelectorAll('.allocation-input').forEach(input => {
                input.addEventListener('change', () => {
                    this.updateBudgetDisplay();
                });
            });
            
            // Add save button handler
            budgetContainer.querySelector('.save-budget').addEventListener('click', () => {
                this.saveBudgetAllocation();
            });
        },
        
        /**
         * Update budget display based on current allocation inputs
         */
        updateBudgetDisplay: function() {
            const totalBudget = this.stateManager.getState('resources.budget', 0);
            const allocationInputs = document.querySelectorAll('.allocation-input');
            
            // Calculate total allocated
            let allocatedBudget = 0;
            allocationInputs.forEach(input => {
                allocatedBudget += parseInt(input.value, 10) || 0;
            });
            
            const remainingBudget = totalBudget - allocatedBudget;
            
            // Update summary display
            const budgetSummary = document.querySelector('.budget-summary');
            if (budgetSummary) {
                const allocatedDisplay = budgetSummary.querySelector('.budget-item:nth-child(2) .budget-value');
                const remainingDisplay = budgetSummary.querySelector('.budget-item:nth-child(3) .budget-value');
                
                if (allocatedDisplay) {
                    allocatedDisplay.textContent = `$${allocatedBudget.toLocaleString()}`;
                }
                
                if (remainingDisplay) {
                    remainingDisplay.textContent = `$${remainingBudget.toLocaleString()}`;
                    
                    const remainingItem = budgetSummary.querySelector('.budget-item:nth-child(3)');
                    if (remainingItem) {
                        if (remainingBudget < 0) {
                            remainingItem.classList.add('budget-negative');
                        } else {
                            remainingItem.classList.remove('budget-negative');
                        }
                    }
                }
            }
            
            // Update percentage displays and bars
            allocationInputs.forEach(input => {
                const categoryId = input.getAttribute('data-category-id');
                const allocation = parseInt(input.value, 10) || 0;
                const percentage = totalBudget > 0 ? (allocation / totalBudget) * 100 : 0;
                
                const category = document.querySelector(`.budget-category[data-category-id="${categoryId}"]`);
                if (category) {
                    const percentageDisplay = category.querySelector('.allocation-percentage');
                    const allocationBar = category.querySelector('.allocation-fill');
                    
                    if (percentageDisplay) {
                        percentageDisplay.textContent = `${percentage.toFixed(1)}%`;
                    }
                    
                    if (allocationBar) {
                        allocationBar.style.width = `${percentage}%`;
                    }
                }
            });
        },
        
        /**
         * Save budget allocation to state
         */
        saveBudgetAllocation: function() {
            const totalBudget = this.stateManager.getState('resources.budget', 0);
            const allocationInputs = document.querySelectorAll('.allocation-input');
            
            // Calculate total allocated
            let allocatedBudget = 0;
            const allocations = {};
            
            allocationInputs.forEach(input => {
                const categoryId = input.getAttribute('data-category-id');
                const allocation = parseInt(input.value, 10) || 0;
                
                allocations[categoryId] = allocation;
                allocatedBudget += allocation;
            });
            
            // Check if over budget
            if (allocatedBudget > totalBudget) {
                document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                    detail: {
                        message: `Warning: You've allocated $${(allocatedBudget - totalBudget).toLocaleString()} more than your budget`,
                        type: 'warning'
                    }
                }));
            }
            
            // Save to state
            this.stateManager.setState('phases.funding.budgetAllocation', allocations);
            
            // Show confirmation
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: 'Budget allocation saved successfully',
                    type: 'success'
                }
            }));
            
            // Update phase progress
            this.updatePhaseProgress();
        },
        
        /**
         * Initialize cost-benefit analysis interface
         */
        initializeCostBenefitAnalysis: function() {
            const analysisContainer = document.getElementById('cost-benefit-analysis');
            if (!analysisContainer) return;
            
            // Get needs assessment from analysis phase
            const needsAssessment = this.stateManager.getState('phases.analysis.needsAssessment', {});
            
            // Get budget allocation
            const budgetAllocation = this.stateManager.getState('phases.funding.budgetAllocation', {});
            
            // Previously saved analysis
            const savedAnalysis = this.stateManager.getState('phases.funding.costBenefitAnalysis', {});
            
            // Generate cost-benefit analysis UI
            let analysisHTML = '<div class="cost-benefit-container">';
            analysisHTML += '<h2>Cost-Benefit Analysis</h2>';
            
            // Only show analysis if funding is selected and budget is allocated
            if (Object.keys(budgetAllocation).length === 0 || !this.stateManager.getState('phases.funding.selectedFunding')) {
                analysisHTML += `
                    <div class="placeholder-message">
                        <p>Please select a funding source and allocate your budget first to enable cost-benefit analysis.</p>
                    </div>
                `;
            } else {
                analysisHTML += '<div class="analysis-grid">';
                
                // Get categories with allocations
                const categories = [
                    { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️' },
                    { id: 'education', name: 'Education', icon: '🎓' },
                    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
                    { id: 'economic', name: 'Economic Development', icon: '📈' },
                    { id: 'governance', name: 'Governance', icon: '🏛️' }
                ].filter(category => (budgetAllocation[category.id] || 0) > 0);
                
                categories.forEach(category => {
                    const allocation = budgetAllocation[category.id] || 0;
                    const priority = needsAssessment[category.id] || 0;
                    
                    // Calculate basic cost-benefit score (higher is better)
                    // Factor in both allocation and priority
                    const score = this.calculateCostBenefitScore(allocation, priority);
                    
                    // Get any saved notes
                    const notes = savedAnalysis[category.id]?.notes || '';
                    
                    analysisHTML += `
                        <div class="analysis-card" data-category-id="${category.id}">
                            <div class="card-header">
                                <div class="category-icon">${category.icon}</div>
                                <h3 class="category-name">${category.name}</h3>
                            </div>
                            <div class="analysis-data">
                                <div class="data-item">
                                    <span class="data-label">Allocation:</span>
                                    <span class="data-value">$${allocation.toLocaleString()}</span>
                                </div>
                                <div class="data-item">
                                    <span class="data-label">Priority:</span>
                                    <span class="data-value">${priority}%</span>
                                </div>
                                <div class="data-item">
                                    <span class="data-label">Cost-Benefit Score:</span>
                                    <span class="data-value score-${this.getScoreClass(score)}">${score.toFixed(1)}</span>
                                </div>
                            </div>
                            <div class="analysis-notes">
                                <label for="notes-${category.id}">Analysis Notes:</label>
                                <textarea id="notes-${category.id}" class="notes-input" data-category-id="${category.id}">${notes}</textarea>
                            </div>
                        </div>
                    `;
                });
                
                analysisHTML += '</div>';
                analysisHTML += '<button class="btn btn-primary save-analysis">Save Analysis</button>';
            }
            
            analysisHTML += '</div>';
            
            analysisContainer.innerHTML = analysisHTML;
            
            // Add save button handler if available
            const saveButton = analysisContainer.querySelector('.save-analysis');
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    this.saveCostBenefitAnalysis();
                });
            }
        },
        
        /**
         * Calculate cost-benefit score
         * @param {number} allocation - Budget allocation
         * @param {number} priority - Priority from needs assessment
         * @returns {number} Cost-benefit score
         */
        calculateCostBenefitScore: function(allocation, priority) {
            // This is a simplified model - in reality would be more complex
            // Higher score is better
            if (allocation === 0 || priority === 0) return 0;
            
            // Basic formula: score increases with priority and reasonable allocation
            // But decreases if extremely over-allocated relative to priority
            const priorityFactor = priority / 100; // Convert to 0-1 scale
            const totalBudget = this.stateManager.getState('resources.budget', 1); // Avoid div by zero
            const allocationPercentage = allocation / totalBudget;
            
            // Calculate balance factor - penalize if allocation is much higher or lower than priority
            const balanceFactor = 1 - Math.abs(priorityFactor - allocationPercentage);
            
            // Final score on scale of 0-10
            return Math.min(10, Math.max(0, 
                (priorityFactor * 5) + // Priority component
                (balanceFactor * 5)    // Balance component
            ));
        },
        
        /**
         * Get score class based on numerical score
         * @param {number} score - Numerical score
         * @returns {string} CSS class for score
         */
        getScoreClass: function(score) {
            if (score >= 7) return 'high';
            if (score >= 4) return 'medium';
            return 'low';
        },
        
        /**
         * Save cost-benefit analysis to state
         */
        saveCostBenefitAnalysis: function() {
            const notesInputs = document.querySelectorAll('.notes-input');
            const analysis = {};
            
            notesInputs.forEach(input => {
                const categoryId = input.getAttribute('data-category-id');
                const notes = input.value;
                
                analysis[categoryId] = {
                    notes: notes
                };
            });
            
            // Save to state
            this.stateManager.setState('phases.funding.costBenefitAnalysis', analysis);
            
            // Show confirmation
            document.dispatchEvent(new CustomEvent('aidcraft:showNotification', {
                detail: {
                    message: 'Cost-benefit analysis saved successfully',
                    type: 'success'
                }
            }));
            
            // Update phase progress
            this.updatePhaseProgress();
        },
        
        /**
         * Show phase introduction dialog
         */
        showPhaseIntroduction: function() {
            document.dispatchEvent(new CustomEvent('aidcraft:showModal', {
                detail: {
                    title: 'Funding Phase',
                    content: `
                        <div class="phase-introduction">
                            <p>Welcome to the Funding Phase of the AidCraft simulation!</p>
                            <p>In this phase, you will:</p>
                            <ul>
                                <li>Select from available funding sources</li>
                                <li>Allocate your budget across development priorities</li>
                                <li>Conduct cost-benefit analysis of your financial decisions</li>
                            </ul>
                            <p>Your funding decisions will have long-term implications for your development project.</p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Begin Funding',
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
        handleFundingInteractions: function(event) {
            // Implementation specific to funding phase interactions
        },
        
        /**
         * Update phase progress based on completed activities
         */
        updatePhaseProgress: function() {
            // Calculate how many funding activities have been completed
            let completedActivities = 0;
            let totalActivities = 3; // Funding selection, budget allocation, cost-benefit analysis
            
            // Check if funding source has been selected
            if (this.stateManager.getState('phases.funding.selectedFunding')) {
                completedActivities++;
            }
            
            // Check if budget has been allocated
            const budgetAllocation = this.stateManager.getState('phases.funding.budgetAllocation', {});
            if (Object.keys(budgetAllocation).length > 0) {
                completedActivities++;
            }
            
            // Check if cost-benefit analysis has been done
            const costBenefitAnalysis = this.stateManager.getState('phases.funding.costBenefitAnalysis', {});
            if (Object.keys(costBenefitAnalysis).length > 0) {
                completedActivities++;
            }
            
            // Calculate progress percentage
            const progress = completedActivities / totalActivities;
            
            // Update phase progress in state
            this.stateManager.setState('phaseProgress.funding', progress);
            
            // If all activities completed, mark phase as complete
            if (progress >= 1) {
                document.dispatchEvent(new CustomEvent('aidcraft:phaseComplete', {
                    detail: { phase: 'funding' }
                }));
            }
        }
    };
    
    // Register the module
    window.fundingPhase = FundingPhase;
})(); 