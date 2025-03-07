/**
 * AidCraft - Global Development Finance Simulation
 * 
 * This script powers the interactive simulation game where players take on 
 * the role of a Finance Ministry Official managing debt repayment, political influence,
 * environmental concerns, and diplomatic relations.
 * 
 * Developer: Enhanced by Claude (based on original by Sethu Nguna)
 * Version: 2.1
 * Last Updated: March 2025
 */

// ===== GLOBAL VARIABLES AND STATE =====

// Add this function definition near the top of tester.js
async function preloadGameAssets() {
    // Insert your asset preloading logic here.
    // For now, this stub simulates asset loading.
    console.log("Preloading game assets...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Game assets preloaded.");
        resolve();
      }, 500);
    });
  }
/**
 * Game state manager for controlled access to game state
 * Provides validation, change notification, and safe access patterns
 */
const gameStateManager = {
    // Original game state
    state: {
        currentDay: 1,
        totalDays: 10,
        budget: 15000000,
        influence: 60,
        staff: 6,
        metrics: {
            fiscalSustainability: 35,
            environmentalCompliance: 40,
            politicalCapital: 60,
            internationalRelations: 30
        },
        completedActions: [],
        unlockedDocuments: [],
        currentMission: 1,
        gameStarted: false,
        missionProgress: 10,
        lastUpdatedResource: null, // Tracks last updated resource for animations
        simulationSpeed: 1, // Controls speed of game progression (1 = normal)
        difficulty: "medium", // Game difficulty setting
        notifications: [], // Tracks pending notifications
        lastAction: null, // Tracks the last action taken for sequential effects
        achievements: [], // Tracks unlocked achievements
        eventHistory: [], // Tracks major events that have occurred
        tutorialCompleted: false, // Tracks whether tutorial has been completed
        intervals: [], // Stores interval IDs for cleanup
        gamePaused: false, // Tracks whether game is paused
        eventHandlers: [] // Stores event handlers for cleanup
    },
    
    // Safe getter for game state
    get(property) {
        const props = property.split('.');
        let value = this.state;
        
        for (const prop of props) {
            if (value === undefined || value === null) {
                console.warn(`Accessing undefined property: ${property}`);
                return undefined;
            }
            value = value[prop];
        }
        
        return value;
    },
    
    // Safe setter with validation
    set(property, value) {
        const props = property.split('.');
        const lastProp = props.pop();
        let target = this.state;
        
        // Navigate to the target object
        for (const prop of props) {
            if (target[prop] === undefined) {
                target[prop] = {};
            }
            target = target[prop];
        }
        
        // Validate the new value based on property
        if (property === 'metrics.fiscalSustainability' || 
            property === 'metrics.environmentalCompliance' ||
            property === 'metrics.politicalCapital' ||
            property === 'metrics.internationalRelations') {
            // Ensure metrics are between 0-100
            value = Math.max(0, Math.min(100, value));
        }
        
        // Set the value
        const oldValue = target[lastProp];
        target[lastProp] = value;
        
        // Track last updated property for animations
        if (property === 'budget' || property === 'influence' || 
            property === 'staff' || property === 'currentDay') {
            this.state.lastUpdatedResource = property.split('.').pop();
        }
        
        // Fire change event for UI updates
        if (!this.batchUpdating) {
            this.notifyChange(property, oldValue, value);
        }
        
        return value;
    },
    
    // Update multiple properties at once
    batchUpdate(updates) {
        // Start a batch update to prevent multiple UI refreshes
        this.batchUpdating = true;
        
        try {
            for (const [property, value] of Object.entries(updates)) {
                this.set(property, value);
            }
        } finally {
            this.batchUpdating = false;
            this.notifyBatchComplete();
        }
    },
    
    // Change notification system
    listeners: {},
    
    // Add a listener for property changes
    onChange(property, callback) {
        if (!this.listeners[property]) {
            this.listeners[property] = [];
        }
        this.listeners[property].push(callback);
    },
    
    // Remove a listener
    offChange(property, callback) {
        if (this.listeners[property]) {
            if (callback) {
                this.listeners[property] = this.listeners[property].filter(cb => cb !== callback);
            } else {
                delete this.listeners[property];
            }
        }
    },
    
    // Notify listeners of changes
    notifyChange(property, oldValue, newValue) {
        if (this.listeners[property]) {
            this.listeners[property].forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in listener for ${property}:`, error);
                }
            });
        }
        
        // Also notify "all" listeners
        if (this.listeners['*']) {
            this.listeners['*'].forEach(callback => {
                try {
                    callback(property, newValue, oldValue);
                } catch (error) {
                    console.error(`Error in global listener:`, error);
                }
            });
        }
    },
    
    // Notify that a batch update is complete
    notifyBatchComplete() {
        if (this.listeners['batchComplete']) {
            this.listeners['batchComplete'].forEach(callback => {
                try {
                    callback(this.state);
                } catch (error) {
                    console.error(`Error in batch complete listener:`, error);
                }
            });
        }
    },
    
    // Reset game state to initial values
    reset() {
        const tutorialCompleted = this.state.tutorialCompleted; // Preserve this setting
        
        this.state = {
            currentDay: 1,
            totalDays: 10,
            budget: 15000000,
            influence: 60,
            staff: 6,
            metrics: {
                fiscalSustainability: 35,
                environmentalCompliance: 40,
                politicalCapital: 60,
                internationalRelations: 30
            },
            completedActions: [],
            unlockedDocuments: [],
            currentMission: 1,
            gameStarted: false,
            missionProgress: 10,
            lastUpdatedResource: null,
            simulationSpeed: 1,
            difficulty: "medium",
            notifications: [],
            lastAction: null,
            achievements: [],
            eventHistory: [],
            tutorialCompleted: tutorialCompleted, // Preserve this setting
            intervals: [],
            gamePaused: false,
            eventHandlers: []
        };
        
        this.notifyBatchComplete();
    },
    
    // Load game state from storage
    load(savedState) {
        if (!savedState) return false;
        
        try {
            // Apply saved state with validation
            for (const [key, value] of Object.entries(savedState)) {
                if (key in this.state) {
                    this.state[key] = value;
                }
            }
            
            this.notifyBatchComplete();
            return true;
        } catch (error) {
            console.error('Error loading game state:', error);
            return false;
        }
    }
};

// Use a direct reference to gameStateManager.state for compatibility with existing code
let gameState = gameStateManager.state;

/**
 * Modal management system for handling modal dialogs
 * Supports stacking, focus management, and cleanup
 */
const modalManager = {
    activeModals: [],
    baseZIndex: 1000,
    
    // Open a modal with proper stacking
    openModal(modal) {
        if (!modal) return;
        
        // Set proper z-index for stacking
        const zIndex = this.baseZIndex + (this.activeModals.length * 10);
        modal.style.zIndex = zIndex;
        
        // Add to active modals stack
        this.activeModals.push(modal);
        
        // Show the modal
        modal.classList.add('active');
        
        // Set focus to first focusable element
        setTimeout(() => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }, 100);
        
        // Prevent background scrolling
        if (this.activeModals.length === 1) {
            document.body.classList.add('no-scroll');
        }
    },
    
    // Close a modal with proper stacking
    closeModal(modal) {
        if (!modal) return;
        
        // Find modal in stack
        const index = this.activeModals.indexOf(modal);
        if (index !== -1) {
            // Remove from stack
            this.activeModals.splice(index, 1);
            
            // Hide the modal
            modal.classList.remove('active');
            
            // Return focus to previous element if possible
            if (this.activeModals.length > 0) {
                const topModal = this.activeModals[this.activeModals.length - 1];
                const focusableElements = topModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            } else {
                // No more modals, enable scrolling
                document.body.classList.remove('no-scroll');
            }
        }
    },
    
    // Close all modals
    closeAll() {
        [...this.activeModals].forEach(modal => this.closeModal(modal));
    }
};

// ===== DATA MODELS =====

/**
 * Stakeholders data - represents key actors in the simulation
 * Each stakeholder has influence and trust metrics that change based on player actions
 */
const stakeholders = [
    {
        id: 1,
        name: "Finance Minister",
        avatar: "FM",
        relationship: "friendly",
        influenceLevel: 80,
        trustLevel: 70,
        details: {
            role: "Oversees national budget and fiscal policy",
            interests: "Budget discipline, debt management, economic growth",
            concerns: "The port's underperformance is creating significant fiscal strain",
            background: "A respected economist with 15 years in government service, the Finance Minister is primarily concerned with maintaining Azuria's sovereign credit rating and ensuring fiscal stability. While supportive of your appointment, they're under pressure from the Prime Minister to resolve the port financing crisis without additional budget allocations."
        }
    },
    {
        id: 2,
        name: "Chinese Lenders",
        avatar: "CL",
        relationship: "neutral",
        influenceLevel: 65,
        trustLevel: 40,
        details: {
            role: "Provided the initial $500M loan for port construction",
            interests: "Loan repayment, strategic influence, trade advantages",
            concerns: "Will enforce collateral clauses if payments are missed",
            background: "A consortium of Chinese state-backed financial institutions that financed the port development as part of broader infrastructure investments across the region. They have significant leverage through the collateral clauses in the loan agreement, and their primary motivation is securing either full repayment or strategic advantages through operational control of the port facility."
        }
    },
    {
        id: 3,
        name: "Port Authority",
        avatar: "PA",
        relationship: "friendly",
        influenceLevel: 50,
        trustLevel: 60,
        details: {
            role: "Manages port operations and staffing",
            interests: "Port expansion, operational efficiency, job security",
            concerns: "Needs to increase capacity utilization from 40% to at least 70%",
            background: "Led by a career civil servant with shipping industry experience, the Port Authority is responsible for day-to-day operations and commercial development. They face pressure to increase utilization rates while navigating bureaucratic constraints. Their staff of 450 workers are concerned about potential restructuring or foreign takeover of management."
        }
    },
    {
        id: 4,
        name: "Fishing Communities",
        avatar: "FC",
        relationship: "hostile",
        influenceLevel: 30,
        trustLevel: 20,
        details: {
            role: "Local community affected by port operations",
            interests: "Environmental protection, livelihood preservation",
            concerns: "Port dredging has damaged fishing grounds and reduced catches by 35%",
            background: "Five coastal villages with a population of approximately 8,000 people have relied on fishing for generations. Since port construction began, they've experienced significant declines in fish stocks and water quality. Led by a charismatic local council head, they have begun organizing protests and have attracted attention from international environmental NGOs."
        }
    },
    {
        id: 5,
        name: "Western Development Banks",
        avatar: "WB",
        relationship: "neutral",
        influenceLevel: 60,
        trustLevel: 50,
        details: {
            role: "Potential alternative financing source",
            interests: "Governance reforms, environmental standards, regional influence",
            concerns: "Requires transparency on existing loan terms as precondition for refinancing",
            background: "A consortium of multilateral development institutions with strong ties to Western governments. They offer potentially more favorable financing terms but come with stringent governance and environmental requirements. Senior officials have expressed interest in supporting Azuria as part of their strategic engagement in the region to counter Chinese influence."
        }
    }
];

/**
 * Action cards data - represents possible player actions in the game
 * Each action has costs, metric impacts, and stakeholder effects
 */
const actions = [
    {
        id: 1,
        title: "Financial Audit",
        description: "Commission an independent audit of port finances and loan agreements to identify fiscal risks and irregularities.",
        cost: "$2,000,000",
        resourceCost: 2000000,
        influenceCost: 10,
        staffCost: 2,
        timeCost: 2,
        unlocks: [1, 2],
        metrics: {
            fiscalSustainability: +15,
            politicalCapital: -5,
            internationalRelations: +10
        },
        stakeholderEffects: {
            1: +10, // Finance Minister
            2: -15, // Chinese Lenders
            5: +20  // Western Development Banks
        },
        followUpText: "The audit has revealed concerning financial arrangements that weren't fully disclosed to parliament. Now you must decide how to proceed with this sensitive information.",
        followUpActions: [3, 5]
    },
    {
        id: 2,
        title: "Environmental Assessment",
        description: "Fund a comprehensive study of the port's environmental impact on marine ecosystems and local fishing grounds.",
        cost: "$1,500,000",
        resourceCost: 1500000,
        influenceCost: 5,
        staffCost: 1,
        timeCost: 2,
        unlocks: [3],
        metrics: {
            environmentalCompliance: +20,
            politicalCapital: +10,
            fiscalSustainability: -5
        },
        stakeholderEffects: {
            4: +25, // Fishing Communities
            5: +10  // Western Development Banks
        },
        followUpText: "The assessment has documented significant ecological damage that requires remediation. How will you balance environmental obligations with financial constraints?",
        followUpActions: [4, 5]
    },
    {
        id: 3,
        title: "Renegotiate Loan Terms",
        description: "Engage with Chinese lenders to restructure debt repayment schedule and revise collateral clauses.",
        cost: "15 Influence",
        resourceCost: 0,
        influenceCost: 15,
        staffCost: 2,
        timeCost: 3,
        unlocks: [4, 5],
        metrics: {
            fiscalSustainability: +25,
            internationalRelations: -10
        },
        stakeholderEffects: {
            1: +15, // Finance Minister
            2: -20, // Chinese Lenders
            3: +10  // Port Authority
        },
        followUpText: "Your negotiations have yielded a modified payment schedule, but Chinese lenders remain firm on collateral terms. What's your next move to secure Azuria's interests?",
        followUpActions: [6]
    },
    {
        id: 4,
        title: "Port Efficiency Program",
        description: "Implement operational improvements to increase capacity utilization and revenue generation.",
        cost: "$3,000,000",
        resourceCost: 3000000,
        influenceCost: 5,
        staffCost: 3,
        timeCost: 2,
        unlocks: [6],
        metrics: {
            fiscalSustainability: +20,
            environmentalCompliance: -5
        },
        stakeholderEffects: {
            3: +20, // Port Authority
            4: -10  // Fishing Communities
        },
        followUpText: "Operational efficiencies have increased capacity utilization to 55%, but environmental concerns have intensified. How will you address the resulting tensions?",
        followUpActions: [5, 6]
    },
    {
        id: 5,
        title: "Community Outreach",
        description: "Establish a dialogue with fishing communities and fund initial environmental remediation projects.",
        cost: "$1,000,000",
        resourceCost: 1000000,
        influenceCost: 10,
        staffCost: 2,
        timeCost: 1,
        unlocks: [7],
        metrics: {
            environmentalCompliance: +15,
            politicalCapital: +10
        },
        stakeholderEffects: {
            4: +30 // Fishing Communities
        },
        followUpText: "Your engagement with local communities has eased tensions, but they still expect concrete environmental improvements. What's your long-term strategy for sustainable development?",
        followUpActions: [7, 8]
    },
    {
        id: 6,
        title: "Explore Refinancing Options",
        description: "Open discussions with Western development banks on potential refinancing packages with new terms.",
        cost: "10 Influence",
        resourceCost: 0,
        influenceCost: 10,
        staffCost: 1,
        timeCost: 2,
        unlocks: [8],
        metrics: {
            internationalRelations: +15,
            fiscalSustainability: +10
        },
        stakeholderEffects: {
            2: -25, // Chinese Lenders
            5: +25  // Western Development Banks
        },
        followUpText: "Western banks have shown strong interest in refinancing, but their terms include governance reforms and full transparency. How will you navigate the delicate geopolitical implications?",
        followUpActions: [7, 9]
    },
    {
        id: 7,
        title: "Public Transparency Initiative",
        description: "Release key financial details about the port project and establish a citizen oversight committee.",
        cost: "20 Influence",
        resourceCost: 500000,
        influenceCost: 20,
        staffCost: 2,
        timeCost: 1,
        unlocks: [9],
        metrics: {
            politicalCapital: +20,
            fiscalSustainability: +5,
            internationalRelations: +10
        },
        stakeholderEffects: {
            1: +10, // Finance Minister
            2: -15, // Chinese Lenders
            4: +15, // Fishing Communities
            5: +20  // Western Development Banks
        },
        followUpText: "Your transparency initiative has garnered public support but exposed previously hidden aspects of the deal. How will you address the political fallout?",
        followUpActions: [8, 9]
    },
    {
        id: 8,
        title: "Strategic Asset Protection Plan",
        description: "Develop legal frameworks to safeguard strategic infrastructure from foreign control.",
        cost: "$1,000,000",
        resourceCost: 1000000,
        influenceCost: 15,
        staffCost: 2,
        timeCost: 2,
        unlocks: [],
        metrics: {
            fiscalSustainability: +10,
            politicalCapital: +15,
            internationalRelations: -15
        },
        stakeholderEffects: {
            1: +20, // Finance Minister
            2: -25, // Chinese Lenders
            3: +15, // Port Authority
            5: -10  // Western Development Banks
        },
        followUpText: "Your legal measures have strengthened Azuria's position, but strained diplomatic relations. What diplomatic counterbalance will you pursue?",
        followUpActions: []
    },
    {
        id: 9,
        title: "International Diplomatic Campaign",
        description: "Launch a diplomatic initiative to gain international support for Azuria's development challenges.",
        cost: "15 Influence",
        resourceCost: 2000000,
        influenceCost: 15,
        staffCost: 1,
        timeCost: 2,
        unlocks: [],
        metrics: {
            internationalRelations: +25,
            politicalCapital: +10,
            fiscalSustainability: -5
        },
        stakeholderEffects: {
            2: +10, // Chinese Lenders
            5: +15  // Western Development Banks
        },
        followUpText: "Your diplomatic efforts have created new options and international goodwill. How will you leverage this improved position?",
        followUpActions: []
    }
];
/**
 * Documents data - represents in-game information sources
 * Players unlock these by taking specific actions
 */
const documents = [
    {
        id: 1,
        title: "Port Loan Agreement",
        type: "Contract",
        icon: "📄",
        content: `<div class="document-header">
            <div class="document-header-icon">📄</div>
            <div class="document-header-info">
                <h3>Port Loan Agreement</h3>
                <div class="document-header-type">Legal Contract</div>
            </div>
        </div>
        <div class="document-content">
            <div class="document-section">
                <h4>Key Terms</h4>
                <p>Loan Amount: $500,000,000 USD</p>
                <p>Term: 20 years</p>
                <p>Interest Rate: 6.5% per annum</p>
                <p>Annual Repayment: $42,000,000 USD</p>
            </div>
            <div class="document-section">
                <h4>Collateral Clauses</h4>
                <p>Article 11.3: In the event of default exceeding 90 days, operational control of the port facility shall transfer to the lender for a period of no less than 10 years.</p>
                <p>Article 14.2: All equipment, infrastructure, and adjacent land within 2km of the port perimeter is designated as collateral for the duration of the loan.</p>
                <p>Article 15.7: Refinancing with third parties requires written approval from the original lender, which may be withheld at their sole discretion.</p>
            </div>
            <div class="document-section">
                <h4>Operational Requirements</h4>
                <p>The borrower shall ensure priority berthing for vessels from the lender's country.</p>
                <p>The borrower shall use lender-approved vendors for at least 60% of all port equipment and technical systems.</p>
                <p>The borrower shall maintain a minimum capacity utilization of 70% by year 3 of operations.</p>
            </div>
            <div class="document-section">
                <h4>Analysis Notes</h4>
                <p class="analysis-note">The collateral clauses create significant sovereign risk, as default would result in loss of control over critical national infrastructure.</p>
                <p class="analysis-note">The operational requirements effectively limit the port's commercial independence and create ongoing dependence on lender-approved systems.</p>
                <p class="analysis-note">The refinancing restriction clause severely limits Azuria's options for securing more favorable terms from alternative sources.</p>
            </div>
        </div>`
    },
    {
        id: 2,
        title: "Port Financial Analysis",
        type: "Report",
        icon: "📊",
        content: `<div class="document-header">
            <div class="document-header-icon">📊</div>
            <div class="document-header-info">
                <h3>Port Financial Analysis</h3>
                <div class="document-header-type">Internal Report</div>
            </div>
        </div>
        <div class="document-content">
            <div class="document-section">
                <h4>Current Financial Status</h4>
                <p>Annual Revenue: $30,000,000 USD</p>
                <p>Operating Expenses: $22,000,000 USD</p>
                <p>Net Income: $8,000,000 USD</p>
                <p>Annual Debt Service: $42,000,000 USD</p>
                <p>Annual Shortfall: $34,000,000 USD</p>
            </div>
            <div class="document-section">
                <h4>Operational Metrics</h4>
                <div class="port-data-visualization">
                    <div class="data-metric">
                        <div class="data-label">Capacity Utilization</div>
                        <div class="data-bar">
                            <div class="data-fill fill-container" style="width: 40%"></div>
                            <div class="data-value">40%</div>
                        </div>
                    </div>
                    <div class="data-metric">
                        <div class="data-label">Bulk Cargo Handling</div>
                        <div class="data-bar">
                            <div class="data-fill fill-bulk" style="width: 55%"></div>
                            <div class="data-value">55%</div>
                        </div>
                    </div>
                    <div class="data-metric">
                        <div class="data-label">Container Traffic</div>
                        <div class="data-bar">
                            <div class="data-fill fill-container" style="width: 35%"></div>
                            <div class="data-value">35%</div>
                        </div>
                    </div>
                    <div class="data-metric">
                        <div class="data-label">Liquid Cargo</div>
                        <div class="data-bar">
                            <div class="data-fill fill-liquid" style="width: 25%"></div>
                            <div class="data-value">25%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="document-section">
                <h4>Projections</h4>
                <p>At current growth rates, the port will reach 55% capacity in 5 years, which is still significantly below the 70% required by the loan agreement.</p>
                <p>The cumulative shortfall over the next 5 years is projected to be $150,000,000 USD, which exceeds the nation's current foreign exchange reserves.</p>
            </div>
            <div class="document-section">
                <h4>Financial Risk Assessment</h4>
                <div class="risk-assessment">
                    <div class="risk-item high-risk">
                        <div class="risk-label">Default Risk</div>
                        <div class="risk-value">High</div>
                    </div>
                    <div class="risk-item medium-risk">
                        <div class="risk-label">Budget Impact</div>
                        <div class="risk-value">Medium</div>
                    </div>
                    <div class="risk-item high-risk">
                        <div class="risk-label">Asset Control Risk</div>
                        <div class="risk-value">High</div>
                    </div>
                    <div class="risk-item medium-risk">
                        <div class="risk-label">Refinancing Potential</div>
                        <div class="risk-value">Medium</div>
                    </div>
                </div>
            </div>
        </div>`
    },
    {
        id: 3,
        title: "Environmental Impact Study",
        type: "Report",
        icon: "🌊",
        content: `<div class="document-header">
            <div class="document-header-icon">🌊</div>
            <div class="document-header-info">
                <h3>Environmental Impact Assessment</h3>
                <div class="document-header-type">Scientific Report</div>
            </div>
        </div>
        <div class="document-content">
            <div class="document-section">
                <h4>Key Findings</h4>
                <p>The port dredging operations have significantly altered the coastal ecosystem, resulting in a 35% reduction in local fish populations.</p>
                <p>Sediment plumes from port construction have damaged approximately 15km² of coral reefs that served as critical breeding grounds for commercial fish species.</p>
                <p>Noise pollution from port operations has disrupted migratory patterns of several protected marine species.</p>
            </div>
            <div class="document-section">
                <h4>Socioeconomic Impact</h4>
                <p>Local fishing communities have reported a 40% reduction in catch volumes since port construction began.</p>
                <p>Approximately 2,300 fishers from 5 coastal villages have been directly affected.</p>
                <p>Traditional fishing grounds used by local communities for generations have become inaccessible due to port security zones.</p>
            </div>
            <div class="document-section">
                <h4>Recommendations</h4>
                <p>Implement a marine habitat restoration program focusing on damaged reef areas.</p>
                <p>Establish no-dredge zones in sensitive ecological areas.</p>
                <p>Create a compensation fund for affected fishing communities.</p>
                <p>Develop alternative livelihood programs for fisherfolk, including potential employment in port operations.</p>
                <p>Estimated cost of comprehensive remediation: $12-15 million USD.</p>
            </div>
            <div class="document-section">
                <h4>Environmental Risk Map</h4>
                <div class="env-risk-map">
                    <div class="map-legend">
                        <div class="legend-item">
                            <div class="legend-color high-impact"></div>
                            <div class="legend-label">High Impact Zone</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color medium-impact"></div>
                            <div class="legend-label">Medium Impact Zone</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color low-impact"></div>
                            <div class="legend-label">Low Impact Zone</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color fishing-grounds"></div>
                            <div class="legend-label">Traditional Fishing Grounds</div>
                        </div>
                    </div>
                    <div class="env-map-visualization"></div>
                </div>
            </div>
        </div>`
    },
    {
        id: 4,
        title: "Diplomatic Communications",
        type: "Correspondence",
        icon: "✉️",
        content: `<div class="document-header">
            <div class="document-header-icon">✉️</div>
            <div class="document-header-info">
                <h3>Diplomatic Communications</h3>
                <div class="document-header-type">Official Correspondence</div>
            </div></div>
        <div class="document-content">
            <div class="document-section">
                <h4>Memo from Chinese Embassy</h4>
                <div class="correspondence-item">
                    <div class="correspondence-header">
                        <div class="correspondence-from">From: H.E. Ambassador Li Wei</div>
                        <div class="correspondence-date">Date: March 2, 2025</div>
                    </div>
                    <div class="correspondence-body">
                        <p>The Government of China values our partnership with Azuria and remains committed to supporting its economic development. We note with concern recent discussions regarding potential restructuring of the port financing agreement.</p>
                        <p>We wish to remind your government that the terms of the existing agreement were mutually beneficial and agreed upon in good faith. Any unilateral attempts to alter these terms would be viewed as contrary to the spirit of our bilateral relationship.</p>
                        <p>Our financial institutions have been flexible partners and expect the same good faith adherence to contractual obligations that has characterized our relationship thus far.</p>
                    </div>
                </div>
            </div>
            <div class="document-section">
                <h4>Communication from Western Development Consortium</h4>
                <div class="correspondence-item">
                    <div class="correspondence-header">
                        <div class="correspondence-from">From: Sarah Williams, Regional Director</div>
                        <div class="correspondence-date">Date: March 5, 2025</div>
                    </div>
                    <div class="correspondence-body">
                        <p>Following our preliminary discussions, the Western Development Consortium (WDC) is prepared to consider a comprehensive refinancing package for Azuria's port facility, subject to due diligence and the satisfaction of our governance requirements.</p>
                        <p>Any potential arrangement would include more favorable interest rates and extended repayment terms, but would require:</p>
                        <ul>
                            <li>Full transparency on existing loan terms and collateral arrangements</li>
                            <li>Implementation of environmental remediation measures</li>
                            <li>Adoption of WDC procurement and anti-corruption standards</li>
                            <li>Competitive and open access to port facilities for all international shipping</li>
                        </ul>
                        <p>We believe these terms would not only resolve the immediate fiscal challenges but strengthen Azuria's infrastructure governance for future projects.</p>
                    </div>
                </div>
            </div>
        </div>`
    },
    {
        id: 5,
        title: "Strategic Options Analysis",
        type: "Report",
        icon: "🔍",
        content: `<div class="document-header">
            <div class="document-header-icon">🔍</div>
            <div class="document-header-info">
                <h3>Strategic Options Analysis</h3>
                <div class="document-header-type">Confidential Report</div>
            </div>
        </div>
        <div class="document-content">
            <div class="document-section">
                <h4>Option 1: Debt Restructuring</h4>
                <div class="option-analysis">
                    <p><strong>Description:</strong> Negotiate with Chinese lenders to modify repayment terms, extend maturity, and potentially reduce interest rates while preserving Azurian operational control.</p>
                    <div class="option-impacts">
                        <div class="impact-item">
                            <div class="impact-label">Fiscal Impact</div>
                            <div class="impact-rating positive">Positive</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Political Impact</div>
                            <div class="impact-rating neutral">Neutral</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Diplomatic Risk</div>
                            <div class="impact-rating low">Low</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Implementation Timeline</div>
                            <div class="impact-rating">3-6 months</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="document-section">
                <h4>Option 2: Western Refinancing</h4>
                <div class="option-analysis">
                    <p><strong>Description:</strong> Secure new financing from Western development banks to pay off Chinese loans, accepting governance reforms and environmental conditions.</p>
                    <div class="option-impacts">
                        <div class="impact-item">
                            <div class="impact-label">Fiscal Impact</div>
                            <div class="impact-rating positive">Positive</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Political Impact</div>
                            <div class="impact-rating mixed">Mixed</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Diplomatic Risk</div>
                            <div class="impact-rating high">High</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Implementation Timeline</div>
                            <div class="impact-rating">6-12 months</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="document-section">
                <h4>Option 3: Partial Privatization</h4>
                <div class="option-analysis">
                    <p><strong>Description:</strong> Sell a minority stake (30-40%) in the port to international operators to generate capital for debt service while retaining government control.</p>
                    <div class="option-impacts">
                        <div class="impact-item">
                            <div class="impact-label">Fiscal Impact</div>
                            <div class="impact-rating positive">Positive</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Political Impact</div>
                            <div class="impact-rating negative">Negative</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Diplomatic Risk</div>
                            <div class="impact-rating medium">Medium</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Implementation Timeline</div>
                            <div class="impact-rating">8-14 months</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="document-section">
                <h4>Option 4: Strategic Default</h4>
                <div class="option-analysis">
                    <p><strong>Description:</strong> Declare inability to meet payment obligations and force renegotiation of terms, leveraging strategic importance of the port to national security.</p>
                    <div class="option-impacts">
                        <div class="impact-item">
                            <div class="impact-label">Fiscal Impact</div>
                            <div class="impact-rating mixed">Mixed</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Political Impact</div>
                            <div class="impact-rating mixed">Mixed</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Diplomatic Risk</div>
                            <div class="impact-rating extreme">Extreme</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Implementation Timeline</div>
                            <div class="impact-rating">1-2 months</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    }
];

/**
 * News updates data - provides narrative context through in-game events
 * Appears in the news section and as notifications
 */
const newsUpdates = [
    {
        day: 1,
        title: "Port Revenue Falls Short of Projections",
        summary: "Quarterly report shows Azuria's new port facility operating at 40% capacity, raising concerns about loan repayment.",
        type: "info",
        details: "Financial analysts are questioning the viability of Azuria's flagship port project as capacity utilization remains far below the 70% target required to meet debt obligations. The Finance Ministry has called for an urgent review of operations and financing structures."
    },
    {
        day: 2,
        title: "Fishing Communities Threaten Protests",
        summary: "Representatives from coastal villages announce plans for demonstrations against environmental damage caused by port operations.",
        type: "warning",
        details: "Leaders from five coastal communities have issued a joint statement demanding compensation for declining fish stocks and environmental remediation of damaged marine habitats. They plan to block port access roads next week if their concerns aren't addressed."
    },
    {
        day: 3,
        title: "Western Development Banks Express Interest",
        summary: "International financial institutions signal openness to refinancing discussions if transparency and governance reforms are implemented.",
        type: "success",
        details: "Senior officials from the Western Development Consortium have approached Azuria's government about potential refinancing options for the port project. They cite concerns about the current loan's terms but see potential for a mutually beneficial arrangement if certain conditions are met."
    },
    {
        day: 4,
        title: "Prime Minister Faces Parliamentary Questions",
        summary: "Opposition lawmakers demand clarity on port financing arrangements and potential sovereignty implications.",
        type: "warning",
        details: "During a heated parliamentary session, opposition leaders questioned the government about rumors of collateral clauses in the port loan agreement that could transfer operational control to foreign entities in case of default. The Prime Minister has promised a comprehensive briefing once a full review is completed."
    },
    {
        day: 5,
        title: "Regional Shipping Association Reports",
        summary: "Industry analysis suggests Azuria's port fees are uncompetitive, contributing to low utilization rates.",
        type: "info",
        details: "The Regional Shipping Association's quarterly report indicates that Azuria's port charges are 15-20% higher than comparable facilities in neighboring countries, while offering fewer services. This pricing structure is cited as a key factor in shipping companies choosing alternative routes and facilities."
    },
    {
        day: 6,
        title: "Environmental NGOs Release Satellite Imagery",
        summary: "International environmental organizations publish evidence of extensive coastal damage from port dredging operations.",
        type: "warning",
        details: "Satellite images released by Global Marine Watch show severe degradation of coral reefs and coastal habitats extending over 15km from the port facility. The organization has called for immediate cessation of ongoing dredging activities and implementation of environmental protection measures."
    },
    {
        day: 7,
        title: "Chinese Embassy Issues Statement",
        summary: "Chinese officials emphasize the importance of honoring existing agreements while expressing openness to constructive dialogue.",
        type: "info",
        details: "In a carefully worded diplomatic statement, the Chinese Ambassador reaffirmed his country's commitment to infrastructure partnership with Azuria while emphasizing the importance of contract sanctity. The statement also mentioned flexibility within the framework of existing agreements, interpreted by some analysts as an opening for renegotiation."
    },
    {
        day: 8,
        title: "Credit Rating Agency Places Azuria on Watch",
        summary: "International credit rating agency signals potential downgrade over concerns about port debt obligations.",
        type: "warning",
        details: "Global Ratings has placed Azuria's sovereign credit on 'negative watch,' citing concerns about the government's ability to meet upcoming debt obligations for the port project. A formal downgrade would significantly increase borrowing costs for all government financing needs."
    },
    {
        day: 9,
        title: "Regional Development Forum Highlights Azuria's Challenges",
        summary: "Economic experts discuss Azuria's experience as a cautionary tale for infrastructure financing in developing nations.",
        type: "info",
        details: "At the annual Regional Development Forum, multiple speakers referenced Azuria's port financing challenges as an example of the hidden risks in certain infrastructure development models. Several nations expressed solidarity with Azuria and called for international standards on transparent infrastructure financing."
    }
];

/**
 * Educational insights content - provides learning moments for players
 * Appears in the insights panel and unlocks progressively
 */
const insights = [
    {
        id: 1,
        title: "Debt Sustainability Analysis",
        content: "Analyzing a project's ability to generate sufficient revenue to cover debt service is crucial for financial stability. Current port capacity utilization at 40% is significantly below projections, creating fiscal risks."
    },
    {
        id: 2,
        title: "Hidden Debt Mechanics",
        content: "Collateral clauses in infrastructure loans can create contingent liabilities that don't appear in official debt statistics. These 'hidden debts' can lead to loss of strategic assets and sovereignty if activated."
    },
    {
        id: 3,
        title: "Environmental-Social Governance",
        content: "Modern development finance increasingly incorporates ESG standards. Projects must consider not just economic returns but also environmental impacts and social acceptance to be truly sustainable."
    },
    {
        id: 4,
        title: "Debt Trap Diplomacy",
        content: "Some analysts argue that certain infrastructure loans are designed to create dependency and leverage over recipient countries. While controversial, this concept highlights the geopolitical dimensions of development finance."
    },
    {
        id: 5,
        title: "Sovereign Debt Restructuring",
        content: "When countries face unsustainable debt, restructuring can provide relief through extending maturities, reducing interest rates, or partial forgiveness. However, restructuring can impact credit ratings and future borrowing costs."
    },
    {
        id: 6,
        title: "Strategic Infrastructure Protection",
        content: "Many nations maintain legal frameworks to protect critical infrastructure from foreign control. These safeguards balance the need for foreign investment with national security considerations."
    },
    {
        id: 7,
        title: "Multi-stakeholder Governance",
        content: "Effective infrastructure projects require balancing the interests of multiple stakeholders including government entities, financiers, local communities, and end users. Inclusive governance structures support long-term sustainability."
    }
];

// ===== CONSTANTS AND CONFIGURATION =====

/**
 * Define shared breakpoints for responsive design
 * Used in both JavaScript and CSS for consistent behavior
 */
const BREAKPOINTS = {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP_SMALL: 1024,
    DESKTOP: 1200
};

// Current slide for carousel
let currentSlide = 0;

// ===== DOM ELEMENTS AND INITIALIZATION =====

function initializeAccessibility() {
    // Set up ARIA roles, focus management, or other accessibility enhancements as needed
    console.log('Accessibility features have been initialized.');
  }

  function setupKeyboardControls() {
    // Initialize keyboard shortcuts here
    console.log("Keyboard controls initialized.");
  }

// Add this function before initializeGameComponents function
function initCarousel() {
    // Set initial classes for carousel items
    const itemClassName = "carousel__photo";
    const items = document.getElementsByClassName(itemClassName);
    const totalItems = items.length;
    
    if (totalItems >= 3) {
      // Set initial classes for previous, current, and next items
      items[totalItems - 1].classList.add("prev");
      items[0].classList.add("active");
      items[1].classList.add("next");
    }
    
    // Set up event listeners for carousel navigation
    const prevButton = document.querySelector('.carousel__button--prev');
    const nextButton = document.querySelector('.carousel__button--next');
    
    if (prevButton) {
      prevButton.addEventListener('click', movePrevHandler);
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', moveNextHandler);
    }
    
    // Set moving to false now that the carousel is ready
    return {
      slide: 0,
      isMoving: false
    };
  }
  
  // Add these supporting functions if they don't exist
  function movePrevHandler(evt) {
    const carousel = this.carousel || window.carousel;
    if (!carousel.isMoving) {
      carousel.slide = movePrev(carousel.slide, carousel);
      moveCarouselTo(carousel);
    }
  }
  
  function moveNextHandler(evt) {
    const carousel = this.carousel || window.carousel;
    if (!carousel.isMoving) {
      carousel.slide = moveNext(carousel.slide, carousel);
      moveCarouselTo(carousel);
    }
  }
  
  function movePrev(currentSlide, carousel) {
    carousel.isMoving = true;
    const totalItems = document.getElementsByClassName("carousel__photo").length;
    
    // Calculate the new position
    let newPosition = currentSlide - 1;
    if (newPosition < 0) {
      newPosition = totalItems - 1;
    }
    
    setTimeout(function() {
      carousel.isMoving = false;
    }, 500);
    
    return newPosition;
  }
  
  function moveNext(currentSlide, carousel) {
    carousel.isMoving = true;
    const totalItems = document.getElementsByClassName("carousel__photo").length;
    
    // Calculate the new position
    let newPosition = currentSlide + 1;
    if (newPosition >= totalItems) {
      newPosition = 0;
    }
    
    setTimeout(function() {
      carousel.isMoving = false;
    }, 500);
    
    return newPosition;
  }
  
  function moveCarouselTo(carousel) {
    const items = document.getElementsByClassName("carousel__photo");
    const totalItems = items.length;
    
    if (totalItems < 3) {
      return;
    }
    
    // Remove all classes from all items
    for (let i = 0; i < totalItems; i++) {
      items[i].classList.remove('prev', 'active', 'next');
    }
    
    // Set new classes
    // Previous item
    const prevIndex = carousel.slide - 1 < 0 ? totalItems - 1 : carousel.slide - 1;
    items[prevIndex].classList.add('prev');
    
    // Current item
    items[carousel.slide].classList.add('active');
    
    // Next item
    const nextIndex = carousel.slide + 1 >= totalItems ? 0 : carousel.slide + 1;
    items[nextIndex].classList.add('next');
  }

  // Add this function before it's called at line 1257
function initializeSplashScreen() {
    console.log("Initializing splash screen...");
    
    const splashScreen = document.querySelector('.splash-screen');
    if (!splashScreen) {
      console.warn("Splash screen element not found");
      return;
    }
    
    // Show the splash screen
    splashScreen.style.display = 'flex';
    splashScreen.style.opacity = '1';
    
    // Add event listener to dismiss splash screen on click (optional)
    splashScreen.addEventListener('click', () => {
      dismissSplashScreen();
    });
    
    // Automatically dismiss the splash screen after a delay
    setTimeout(() => {
      dismissSplashScreen();
    }, 3000); // 3 seconds
    
    return splashScreen;
  }
  
  // Add supporting function to dismiss the splash screen
  function dismissSplashScreen() {
    const splashScreen = document.querySelector('.splash-screen');
    if (!splashScreen) return;
    
    // Fade out animation
    splashScreen.style.opacity = '0';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 500); // Match this to your CSS transition time
  }
  
  
  
/**
 * Main initialization function that runs when the document is loaded
 * Sets up event listeners and initializes the game
 */
function initializeGame() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGameComponents);
    } else {
        initializeGameComponents();
    }
}

/**
 * Initialize game components in sequence with proper dependencies
 */
async function initializeGameComponents() {
    try {
        // Cache DOM elements for better performance
        const elements = cacheDOMElements();
        
        // Initialize the loading screen
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('active');
        }
        
        // Set up all event listeners
        setupEventListeners(elements);
        
        // Initialize screen readers and accessibility features
        initializeAccessibility();
        
        // Set up keyboard controls
        setupKeyboardControls();
        
        // Preload assets and data for better performance
        await preloadGameAssets();
        
        // Initialize the welcome carousel
        initCarousel();
        
        // Hide loading screen when initialization is complete
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                elements.loadingScreen.classList.remove('active', 'fade-out');
                initializeSplashScreen(elements);
            }, 500);
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        // Show error message to user
        const errorNotification = 'There was a problem loading the game. Please try refreshing the page.';
        if (typeof showNotification === 'function') {
            showNotification('Initialization Error', errorNotification, 'error');
        } else {
            alert('Initialization Error: ' + errorNotification);
        }
    }
}

/**
 * Caches DOM elements for improved performance with error handling
 * Returns an object with all necessary DOM elements
 */
function cacheDOMElements() {
    const elements = {};
    
    // Define element selectors with fallback options
    const selectors = {
        // Loading and splash screen elements
        loadingScreen: '#loadingScreen',
        loadingBar: '#loadingBar',
        splashScreen: '#splashScreen',
        splashConnections: '#splashConnections',
        playButton: '#playButton',
        howToPlayBtn: '#howToPlayBtn',

        // Mission drawer elements
        missionDrawer: '#missionDrawer',
        missionItems: '.mission-item',
        startMissionBtn: '#startMissionBtn',

        // Main game UI elements
        gameHeader: '#gameHeader',
        mainContainer: '#mainContainer',
        networkVisualization: '#networkVisualization',
        missionProgressFill: '#missionProgressFill',
        missionProgressPercentage: '#missionProgressPercentage',
        missionProgressContainer: '#missionProgressContainer',
        welcomeCarousel: '#welcomeCarousel',

        // Game panel elements
        tabButtons: '.tab',
        tabContents: '.tab-content',
        actionCards: '.action-cards',
        stakeholdersList: '.stakeholders-list',
        timerDisplay: '#timerDisplay',
        updatesTab: '.tab[data-tab="updates"]',
        updatesBadge: '.updates-badge',
        
        // Resources panel elements
        budgetResource: '#budgetResource',
        influenceResource: '#influenceResource',
        staffResource: '#staffResource',
        timeResource: '#timeResource',
        
        // Metrics elements
        transparencyMetric: '#transparencyMetric',
        communityMetric: '#communityMetric',
        esgMetric: '#esgMetric',
        accountabilityMetric: '#accountabilityMetric',
        
        // Modal elements
        guideModal: '#guideModal',
        menuModal: '#menuModal',
        stakeholderModal: '#stakeholderModal',
        actionResultModal: '#actionResultModal',
        endGameModal: '#endGameModal',
        verdictModal: '#verdictModal',

        // Button elements
        menuBtn: '#menuBtn',
        guideBtn: '#guideBtn',
        closeGuideModal: '#closeGuideModal',
        closeGuideBtn: '#closeGuideBtn',
        closeMenuModal: '#closeMenuModal',
        startTutorialBtn: '#startTutorialBtn',
        closeStakeholderModal: '#closeStakeholderModal',
        closeStakeholderBtn: '#closeStakeholderBtn',
        engageStakeholderBtn: '#engageStakeholderBtn',
        closeActionResultModal: '#closeActionResultModal',
        acknowledgeResultBtn: '#acknowledgeResultBtn',
        closeEndGameModal: '#closeEndGameModal',
        submitRecommendationBtn: '#submitRecommendationBtn',
        completeGameBtn: '#completeGameBtn',

        // Other elements
        notificationContainer: '#notificationContainer',
        actionLoadingOverlay: '#actionLoadingOverlay'
    };
    
    // Safely get elements with logging for missing ones
    for (const [key, selector] of Object.entries(selectors)) {
        try {
            // Handle NodeList selectors
            if (selector.includes('.') && !selector.includes('#') && !selector.includes(' ')) {
                elements[key] = document.querySelectorAll(selector);
                if (elements[key].length === 0) {
                    console.warn(`No elements found with selector "${selector}" for "${key}"`);
                    elements[key] = null;
                }
            } else {
                // Handle single element selectors
                elements[key] = document.querySelector(selector);
                if (!elements[key]) {
                    console.warn(`Element with selector "${selector}" not found for "${key}"`);
                }
            }
        } catch (error) {
            console.error(`Error accessing element with selector "${selector}" for "${key}":`, error);
            elements[key] = null;
        }
    }
    
    return elements;
}
/**
 * Sets up all event listeners for the game with improved error handling
 * Uses event delegation for dynamic elements where possible
 * @param {Object} elements - Cached DOM elements
 */
// Global variable to track event handlers for cleanup
let handlers = [];

function setupEventListeners(elements) {
    // Clear existing handlers
    handlers = [];
    
    try {
        // Use event delegation for dynamic elements
        document.body.addEventListener('click', function(e) {
            // Handle action card clicks
            const actionButton = e.target.closest('.action-button');
            if (actionButton) {
                const card = actionButton.closest('.action-card');
                if (card && !actionButton.disabled) {
                    const actionId = parseInt(card.dataset.actionId);
                    const action = actions.find(a => a.id === actionId);
                    if (action && canAffordAction(action)) {
                        takeAction(action, elements);
                    }
                }
                e.stopPropagation();
                return;
            }
            
            // Handle stakeholder item clicks
            const stakeholderItem = e.target.closest('.stakeholder-item');
            if (stakeholderItem) {
                const stakeholderId = parseInt(stakeholderItem.dataset.stakeholderId);
                const stakeholder = stakeholders.find(s => s.id === stakeholderId);
                if (stakeholder) {
                    openStakeholderModal(stakeholder, elements);
                }
                return;
            }
            
            // Handle document item clicks
            const documentItem = e.target.closest('.document-item');
            if (documentItem) {
                const documentId = parseInt(documentItem.dataset.documentId);
                const doc = documents.find(d => d.id === documentId);
                if (doc) {
                    const documentsTab = document.querySelector('.documents-content');
                    if (documentsTab) {
                        showDocument(doc, documentsTab);
                        // Mark this document as active
                        document.querySelectorAll('.document-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        documentItem.classList.add('active');
                    }
                }
                return;
            }
            
            // Handle update item expansion
            const updateItem = e.target.closest('.update-item');
            if (updateItem && !e.target.closest('.update-detail-section')) {
                updateItem.classList.toggle('expanded');
                return;
            }
        });
        
        // Splash screen buttons
        if (elements.playButton) {
            const handler = () => openMissionDrawer(elements);
            elements.playButton.addEventListener('click', handler);
            handlers.push({ element: elements.playButton, type: 'click', handler });
        }
        
        if (elements.howToPlayBtn) {
            const handler = () => openModal(elements.guideModal);
            elements.howToPlayBtn.addEventListener('click', handler);
            handlers.push({ element: elements.howToPlayBtn, type: 'click', handler });
        }
        
        // Mission drawer
        if (elements.startMissionBtn) {
            const handler = () => startGame(elements);
            elements.startMissionBtn.addEventListener('click', handler);
            handlers.push({ element: elements.startMissionBtn, type: 'click', handler });
        }
        
        if (elements.missionItems && elements.missionItems.length) {
            elements.missionItems.forEach(item => {
                const handler = () => {
                    elements.missionItems.forEach(mi => mi.classList.remove('active'));
                    item.classList.add('active');
                    updateMissionDetails(item.dataset.mission, elements);
                };
                item.addEventListener('click', handler);
                handlers.push({ element: item, type: 'click', handler });
            });
        }
        
        // Game header buttons
        if (elements.menuBtn) {
            const handler = () => openModal(elements.menuModal);
            elements.menuBtn.addEventListener('click', handler);
            handlers.push({ element: elements.menuBtn, type: 'click', handler });
        }
        
        if (elements.guideBtn) {
            const handler = () => openModal(elements.guideModal);
            elements.guideBtn.addEventListener('click', handler);
            handlers.push({ element: elements.guideBtn, type: 'click', handler });
        }
        
        // Modal close buttons - using modalManager for proper stacking
        const setupModalCloseHandler = (closeButton, modal) => {
            if (closeButton && modal) {
                const handler = () => modalManager.closeModal(modal);
                closeButton.addEventListener('click', handler);
                handlers.push({ element: closeButton, type: 'click', handler });
            }
        };
        
        setupModalCloseHandler(elements.closeGuideModal, elements.guideModal);
        setupModalCloseHandler(elements.closeGuideBtn, elements.guideModal);
        setupModalCloseHandler(elements.closeMenuModal, elements.menuModal);
        setupModalCloseHandler(elements.closeStakeholderModal, elements.stakeholderModal);
        setupModalCloseHandler(elements.closeStakeholderBtn, elements.stakeholderModal);
        
        // Action result modal with special handling
        if (elements.closeActionResultModal && elements.actionResultModal) {
            const handler = () => modalManager.closeModal(elements.actionResultModal);
            elements.closeActionResultModal.addEventListener('click', handler);
            handlers.push({ element: elements.closeActionResultModal, type: 'click', handler });
        }
        
        if (elements.acknowledgeResultBtn && elements.actionResultModal) {
            const handler = () => {
                modalManager.closeModal(elements.actionResultModal);
                checkForGameUpdates(elements);
            };
            elements.acknowledgeResultBtn.addEventListener('click', handler);
            handlers.push({ element: elements.acknowledgeResultBtn, type: 'click', handler });
        }
        
        setupModalCloseHandler(elements.closeEndGameModal, elements.endGameModal);
        
        // Other modal buttons
        if (elements.startTutorialBtn && elements.guideModal) {
            const handler = () => {
                modalManager.closeModal(elements.guideModal);
                startTutorial(elements);
            };
            elements.startTutorialBtn.addEventListener('click', handler);
            handlers.push({ element: elements.startTutorialBtn, type: 'click', handler });
        }
        
        if (elements.engageStakeholderBtn && elements.stakeholderModal) {
            const handler = () => {
                modalManager.closeModal(elements.stakeholderModal);
                const stakeholderId = elements.stakeholderModal.dataset.stakeholderId;
                engageStakeholder(stakeholderId, elements);
            };
            elements.engageStakeholderBtn.addEventListener('click', handler);
            handlers.push({ element: elements.engageStakeholderBtn, type: 'click', handler });
        }
        
        if (elements.submitRecommendationBtn) {
            const handler = () => submitFinalRecommendation(elements);
            elements.submitRecommendationBtn.addEventListener('click', handler);
            handlers.push({ element: elements.submitRecommendationBtn, type: 'click', handler });
        }
        
        if (elements.completeGameBtn && elements.verdictModal) {
            const handler = () => {
                modalManager.closeModal(elements.verdictModal);
                resetGameAndReturnToSplash(elements);
            };
            elements.completeGameBtn.addEventListener('click', handler);
            handlers.push({ element: elements.completeGameBtn, type: 'click', handler });
        }
        
        // Tab navigation
        if (elements.tabButtons && elements.tabButtons.length) {
            elements.tabButtons.forEach(button => {
                const handler = () => {
                    const tabName = button.dataset.tab;
                    
                    // Remove update notification when updates tab is clicked
                    if (tabName === 'updates' && elements.updatesBadge) {
                        elements.updatesBadge.style.display = 'none';
                    }
                    
                    // Set active tab button
                    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Show corresponding tab content
                    if (elements.tabContents && elements.tabContents.length) {
                        elements.tabContents.forEach(content => {
                            if (content.classList.contains(`${tabName}-content`)) {
                                content.classList.add('active');
                                
                                // If switching to documents tab, initialize it if needed
                                if (tabName === 'documents' && !content.dataset.initialized) {
                                    initializeDocumentsTab(content);
                                    content.dataset.initialized = 'true';
                                }
                                
                                // If switching to updates tab, initialize it if needed
                                if (tabName === 'updates' && !content.dataset.initialized) {
                                    initializeUpdatesTab(content);
                                    content.dataset.initialized = 'true';
                                }
                            } else {
                                content.classList.remove('active');
                            }
                        });
                    }
                    
                    // Announce tab change to screen readers
                    announceToScreenReader(`${tabName} tab activated`, false);
                };
                
                button.addEventListener('click', handler);
                handlers.push({ element: button, type: 'click', handler });
            });
        }
        
        // Menu items
        const setupMenuItemHandler = (id, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
                handlers.push({ element, type: 'click', handler });
            }
        };
        
        setupMenuItemHandler('menuSaveGame', () => {
            saveGame();
            showNotification('Game Saved', 'Your progress has been saved successfully.', 'success');
            if (elements.menuModal) modalManager.closeModal(elements.menuModal);
        });
        
        setupMenuItemHandler('menuLoadGame', () => {
            const loadSuccess = loadGame(elements);
            if (loadSuccess) {
                showNotification('Game Loaded', 'Your saved game has been loaded successfully.', 'success');
            } else {
                showNotification('Load Failed', 'No saved game was found to load.', 'error');
            }
            if (elements.menuModal) modalManager.closeModal(elements.menuModal);
        });
        
        setupMenuItemHandler('menuOptions', () => {
            showNotification('Options', 'Game options will be available in the full version.', 'info');
            if (elements.menuModal) modalManager.closeModal(elements.menuModal);
        });
        
        setupMenuItemHandler('menuStats', () => {
            showGameStatistics(elements);
            if (elements.menuModal) modalManager.closeModal(elements.menuModal);
        });
        
        setupMenuItemHandler('menuReturnMain', () => {
            if (gameStateManager.get('gameStarted')) {
                if (confirm('Return to main menu? Your unsaved progress will be lost.')) {
                    if (elements.menuModal) modalManager.closeModal(elements.menuModal);
                    resetGameAndReturnToSplash(elements);
                }
            } else {
                if (elements.menuModal) modalManager.closeModal(elements.menuModal);
                resetGameAndReturnToSplash(elements);
            }
        });
        
        setupMenuItemHandler('menuExit', () => {
            if (elements.menuModal) modalManager.closeModal(elements.menuModal);
            showNotification('Exit Game', 'Thanks for playing AidCraft!', 'info');
            setTimeout(() => {
                resetGameAndReturnToSplash(elements);
            }, 1500);
        });
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        showNotification('Setup Error', 'There was a problem setting up the game interface. Please refresh the page.', 'error');
    }
    
    // Window resize event for responsive adjustments
    const resizeHandler = () => handleResize(elements);
    window.addEventListener('resize', resizeHandler);
    handlers.push({ element: window, type: 'resize', handler: resizeHandler });
}

// Handle keyboard navigation for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalManager.activeModals.length > 0) {
        const topModal = modalManager.activeModals[modalManager.activeModals.length - 1];
        modalManager.closeModal(topModal);
    }
    
    // Tab trap for modal focus management
    if (e.key === 'Tab' && modalManager.activeModals.length > 0) {
        const topModal = modalManager.activeModals[modalManager.activeModals.length - 1];
        const focusableElements = topModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

// Initialize game state change listeners
function initializeStateListeners() {
    // Listen for batch updates to refresh UI efficiently
    gameStateManager.onChange('batchComplete', updateAllUI);
    
    // Listen for specific resource changes to animate them
    gameStateManager.onChange('budget', (newValue, oldValue) => {
        updateResourceDisplay('budget', newValue);
        if (oldValue !== null && newValue !== oldValue) {
            animateResourceChange('budget');
        }
    });
    
    gameStateManager.onChange('influence', (newValue, oldValue) => {
        updateResourceDisplay('influence', newValue);
        if (oldValue !== null && newValue !== oldValue) {
            animateResourceChange('influence');
        }
    });
    
    gameStateManager.onChange('staff', (newValue, oldValue) => {
        updateResourceDisplay('staff', newValue);
        if (oldValue !== null && newValue !== oldValue) {
            animateResourceChange('staff');
        }
    });
    
    // Listen for metric changes to update progress bars
    gameStateManager.onChange('metrics.fiscalSustainability', (newValue) => {
        updateMetricDisplay('fiscalSustainability', newValue);
    });
    
    gameStateManager.onChange('metrics.environmentalCompliance', (newValue) => {
        updateMetricDisplay('environmentalCompliance', newValue);
    });
    
    gameStateManager.onChange('metrics.politicalCapital', (newValue) => {
        updateMetricDisplay('politicalCapital', newValue);
    });
    
    gameStateManager.onChange('metrics.internationalRelations', (newValue) => {
        updateMetricDisplay('internationalRelations', newValue);
    });
    
    // Listen for mission progress changes
    gameStateManager.onChange('missionProgress', (newValue) => {
        updateMissionProgress(newValue);
    });
    
    // Listen for day changes to update timer and trigger events
    gameStateManager.onChange('currentDay', (newValue, oldValue) => {
        updateDayDisplay(newValue);
        if (oldValue !== null && newValue > oldValue) {
            triggerDailyEvents(newValue);
        }
    });
}

// Update all UI elements based on current game state
function updateAllUI() {
    // Update resources
    updateResourceDisplay('budget', gameStateManager.get('budget'));
    updateResourceDisplay('influence', gameStateManager.get('influence'));
    updateResourceDisplay('staff', gameStateManager.get('staff'));
    
    // Update metrics
    updateMetricDisplay('fiscalSustainability', gameStateManager.get('metrics.fiscalSustainability'));
    updateMetricDisplay('environmentalCompliance', gameStateManager.get('metrics.environmentalCompliance'));
    updateMetricDisplay('politicalCapital', gameStateManager.get('metrics.politicalCapital'));
    updateMetricDisplay('internationalRelations', gameStateManager.get('metrics.internationalRelations'));
    
    // Update mission progress
    updateMissionProgress(gameStateManager.get('missionProgress'));
    
    // Update day display
    updateDayDisplay(gameStateManager.get('currentDay'));
    
    // Update available actions
    updateAvailableActions();
    
    // Update stakeholder relationships
    updateStakeholderDisplay();
    
    // Update unlocked documents
    updateDocumentsDisplay();
}

// Update resource displays with current values
function updateResourceDisplay(resourceType, value) {
    const resourceElement = document.querySelector(`.resource-value[data-resource="${resourceType}"]`);
    if (resourceElement) {
        if (resourceType === 'budget') {
            resourceElement.textContent = `$${formatNumber(value)}`;
        } else {
            resourceElement.textContent = value;
        }
    }
}

// Format numbers for display (e.g., adding commas for thousands)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Animate resource changes with visual feedback
function animateResourceChange(resourceType) {
    const resourceElement = document.querySelector(`.resource-value[data-resource="${resourceType}"]`);
    if (resourceElement) {
        resourceElement.classList.remove('resource-changed');
        // Trigger reflow to restart animation
        void resourceElement.offsetWidth;
        resourceElement.classList.add('resource-changed');
    }
}

// Update metric displays with current values
function updateMetricDisplay(metricType, value) {
    const metricFill = document.querySelector(`.fill-${metricType}`);
    const metricValue = document.querySelector(`.metric-value[data-metric="${metricType}"]`);
    
    if (metricFill) {
        metricFill.style.width = `${value}%`;
    }
    
    if (metricValue) {
        metricValue.textContent = `${value}%`;
        
        // Update color based on value
        metricValue.classList.remove('value-low', 'value-medium', 'value-high');
        if (value < 30) {
            metricValue.classList.add('value-low');
        } else if (value < 70) {
            metricValue.classList.add('value-medium');
        } else {
            metricValue.classList.add('value-high');
        }
    }
}

// Update mission progress display
function updateMissionProgress(progress) {
    const progressFill = document.querySelector('.mission-progress-fill');
    const progressPercentage = document.querySelector('.mission-progress-percentage');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${progress}%`;
    }
    
    // Update progress bar color based on completion stage
    const progressBar = document.querySelector('.mission-progress-bar');
    if (progressBar) {
        progressBar.classList.remove('progress-early', 'progress-mid', 'progress-late');
        if (progress < 30) {
            progressBar.classList.add('progress-early');
        } else if (progress < 70) {
            progressBar.classList.add('progress-mid');
        } else {
            progressBar.classList.add('progress-late');
        }
    }
}

// Update day display
function updateDayDisplay(day) {
    const dayDisplay = document.querySelector('.mission-timer');
    if (dayDisplay) {
        dayDisplay.textContent = `Day ${day} of ${gameStateManager.get('totalDays')}`;
    }
}

// Trigger daily events based on current day
function triggerDailyEvents(day) {
    // Add daily event logic here
    console.log(`Day ${day} has begun`);
    
    // Check for scheduled events
    const scheduledEvents = getScheduledEventsForDay(day);
    for (const event of scheduledEvents) {
        processGameEvent(event);
    }
    
    // Random events with probability based on difficulty
    if (Math.random() < getDifficultyRandomEventChance()) {
        triggerRandomEvent();
    }
    
    // Add notification for new day
    addNotification({
        type: 'info',
        title: `Day ${day} Begins`,
        message: `You have ${gameStateManager.get('totalDays') - day} days remaining to complete your mission.`
    });
    
    // Check for game end condition
    if (day > gameStateManager.get('totalDays')) {
        endGame();
    }
}

// Get difficulty-based chance for random events
function getDifficultyRandomEventChance() {
    const difficulty = gameStateManager.get('difficulty');
    switch (difficulty) {
        case 'easy': return 0.1;
        case 'medium': return 0.2;
        case 'hard': return 0.3;
        default: return 0.2;
    }
}

// Get scheduled events for a specific day
function getScheduledEventsForDay(day) {
    // This would typically come from a predefined event schedule
    // For now, returning an empty array as placeholder
    return [];
}

// Process a game event
function processGameEvent(event) {
    // Handle different event types
    switch (event.type) {
        case 'stakeholder':
            updateStakeholderRelationship(event.stakeholderId, event.change);
            break;
        case 'resource':
            updateResource(event.resourceType, event.change);
            break;
        case 'metric':
            updateMetric(event.metricType, event.change);
            break;
        case 'notification':
            addNotification(event.notification);
            break;
        case 'document':
            unlockDocument(event.documentId);
            break;
        default:
            console.warn(`Unknown event type: ${event.type}`);
    }
    
    // Record event in history
    gameStateManager.state.eventHistory.push({
        day: gameStateManager.get('currentDay'),
        type: event.type,
        details: event
    });
}

// Trigger a random event
function triggerRandomEvent() {
    // Select a random event based on current game state
    // This is a placeholder implementation
    const eventTypes = ['stakeholder', 'resource', 'metric', 'document'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    let event = {
        type: randomType,
        day: gameStateManager.get('currentDay')
    };
    
    // Customize event based on type
    switch (randomType) {
        case 'stakeholder':
            const stakeholderId = Math.floor(Math.random() * stakeholders.length) + 1;
            const changeAmount = Math.floor(Math.random() * 20) - 10; // -10 to +10
            event.stakeholderId = stakeholderId;
            event.change = changeAmount;
            event.notification = {
                type: changeAmount > 0 ? 'success' : 'warning',
                title: `Stakeholder Update: ${getStakeholderById(stakeholderId).name}`,
                message: changeAmount > 0 
                    ? `Relationship improved by ${changeAmount} points due to external factors.`
                    : `Relationship deteriorated by ${Math.abs(changeAmount)} points due to external factors.`
            };
            break;
            
        case 'resource':
            const resources = ['budget', 'influence', 'staff'];
            const resourceType = resources[Math.floor(Math.random() * resources.length)];
            const resourceChange = Math.floor(Math.random() * 1000000) - 500000; // Budget change
            if (resourceType === 'influence' || resourceType === 'staff') {
                resourceChange = Math.floor(Math.random() * 10) - 5; // Smaller change for non-budget
            }
            event.resourceType = resourceType;
            event.change = resourceChange;
            event.notification = {
                type: resourceChange > 0 ? 'success' : 'warning',
                title: `Resource Update: ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`,
                message: resourceChange > 0
                    ? `Gained ${resourceType === 'budget' ? '$' + formatNumber(resourceChange) : resourceChange} due to external factors.`
                    : `Lost ${resourceType === 'budget' ? '$' + formatNumber(Math.abs(resourceChange)) : Math.abs(resourceChange)} due to external factors.`
            };
            break;
            
        case 'metric':
            const metrics = ['fiscalSustainability', 'environmentalCompliance', 'politicalCapital', 'internationalRelations'];
            const metricType = metrics[Math.floor(Math.random() * metrics.length)];
            const metricChange = Math.floor(Math.random() * 10) - 5; // -5 to +5
            event.metricType = metricType;
            event.change = metricChange;
            event.notification = {
                type: metricChange > 0 ? 'success' : 'warning',
                title: `Metric Update: ${formatMetricName(metricType)}`,
                message: metricChange > 0
                    ? `Increased by ${metricChange}% due to external factors.`
                    : `Decreased by ${Math.abs(metricChange)}% due to external factors.`
            };
            break;
            
        case 'document':
            // Only trigger if there are documents to unlock
            const unlockedDocs = gameStateManager.get('unlockedDocuments');
            const availableDocs = documents.filter(doc => !unlockedDocs.includes(doc.id));
            
            if (availableDocs.length > 0) {
                const randomDoc = availableDocs[Math.floor(Math.random() * availableDocs.length)];
                event.documentId = randomDoc.id;
                event.notification = {
                    type: 'info',
                    title: 'New Document Available',
                    message: `"${randomDoc.title}" has been added to your documents.`
                };
            } else {
                // Fall back to a metric change if no documents available
                return triggerRandomEvent();
            }
            break;
    }
    
    // Process the random event
    processGameEvent(event);
}

// Format metric name for display
function formatMetricName(metricType) {
    switch (metricType) {
        case 'fiscalSustainability': return 'Fiscal Sustainability';
        case 'environmentalCompliance': return 'Environmental Compliance';
        case 'politicalCapital': return 'Political Capital';
        case 'internationalRelations': return 'International Relations';
        default: return metricType;
    }
}

// Update stakeholder relationship
function updateStakeholderRelationship(stakeholderId, change) {
    const stakeholder = getStakeholderById(stakeholderId);
    if (stakeholder) {
        stakeholder.trustLevel = Math.max(0, Math.min(100, stakeholder.trustLevel + change));
        
        // Update relationship status based on trust level
        if (stakeholder.trustLevel < 30) {
            stakeholder.relationship = 'hostile';
        } else if (stakeholder.trustLevel < 60) {
            stakeholder.relationship = 'neutral';
        } else {
            stakeholder.relationship = 'friendly';
        }
        
        // Update UI
        updateStakeholderDisplay();
    }
}

// Get stakeholder by ID
function getStakeholderById(id) {
    return stakeholders.find(s => s.id === id);
}

// Update resource values
function updateResource(resourceType, change) {
    const currentValue = gameStateManager.get(resourceType);
    gameStateManager.set(resourceType, currentValue + change);
}

// Update metric values
function updateMetric(metricType, change) {
    const currentValue = gameStateManager.get(`metrics.${metricType}`);
    gameStateManager.set(`metrics.${metricType}`, currentValue + change);
}

// Unlock a document
function unlockDocument(documentId) {
    const unlockedDocs = [...gameStateManager.get('unlockedDocuments')];
    if (!unlockedDocs.includes(documentId)) {
        unlockedDocs.push(documentId);
        gameStateManager.set('unlockedDocuments', unlockedDocs);
        updateDocumentsDisplay();
    }
}

// Update available actions based on game state
function updateAvailableActions() {
    const actionContainer = document.querySelector('.action-cards');
    if (!actionContainer) return;
    
    // Clear existing actions
    actionContainer.innerHTML = '';
    
    const completedActions = gameStateManager.get('completedActions');
    const unlockedDocuments = gameStateManager.get('unlockedDocuments');
    const currentBudget = gameStateManager.get('budget');
    const currentInfluence = gameStateManager.get('influence');
    const currentStaff = gameStateManager.get('staff');
    
    // Filter actions that are available based on completed actions and unlocked documents
    const availableActions = actions.filter(action => {
        // Skip already completed actions
        if (completedActions.includes(action.id)) return false;
        
        // Check if prerequisites are met (documents unlocked)
        const prerequisitesMet = action.unlocks ? 
            action.unlocks.some(docId => unlockedDocuments.includes(docId)) : 
            true;
            
        return prerequisitesMet;
    });
    
    if (availableActions.length === 0) {
        // Show message when no actions are available
        actionContainer.innerHTML = `
            <div class="no-actions-message">
                <div class="message-icon">📋</div>
                <p>No actions available at this time. Continue exploring documents or wait for new developments.</p>
            </div>
        `;
        return;
    }
    
    // Create action cards for available actions
    availableActions.forEach(action => {
        const canAfford = 
            (action.resourceCost <= currentBudget) && 
            (action.influenceCost <= currentInfluence) && 
            (action.staffCost <= currentStaff);
            
        const actionCard = document.createElement('div');
        actionCard.className = `action-card ${canAfford ? '' : 'action-unaffordable'}`;
        actionCard.dataset.actionId = action.id;
        
        actionCard.innerHTML = `
            <div class="action-header">
                <h4>${action.title}</h4>
                <div class="action-cost">${action.cost}</div>
            </div>
            <div class="action-description">${action.description}</div>
            <div class="action-costs">
                ${action.resourceCost > 0 ? `<span>Budget: $${formatNumber(action.resourceCost)}</span>` : ''}
                ${action.influenceCost > 0 ? `<span>Influence: ${action.influenceCost}</span>` : ''}
                ${action.staffCost > 0 ? `<span>Staff: ${action.staffCost}</span>` : ''}
            </div>
            <button class="btn btn-primary action-button">Execute</button>
        `;
        
        // Add click event for action execution
        const actionButton = actionCard.querySelector('.action-button');
        actionButton.addEventListener('click', () => executeAction(action));
        
        actionContainer.appendChild(actionCard);
        
        // Add animation with slight delay for each card
        setTimeout(() => {
            actionCard.classList.add('action-card-visible');
        }, 100 * actionContainer.children.length);
    });
}

// Update stakeholder display
function updateStakeholderDisplay() {
    const stakeholderContainer = document.querySelector('.stakeholders-list');
    if (!stakeholderContainer) return;
    
    // Clear existing stakeholders
    stakeholderContainer.innerHTML = '';
    
    // Create stakeholder items
    stakeholders.forEach(stakeholder => {
        const stakeholderItem = document.createElement('div');
        stakeholderItem.className = 'stakeholder-item';
        stakeholderItem.dataset.stakeholderId = stakeholder.id;
        
        stakeholderItem.innerHTML = `
            <div class="stakeholder-avatar">${stakeholder.avatar}</div>
            <div class="stakeholder-info">
                <div class="stakeholder-name">${stakeholder.name}</div>
                <div class="stakeholder-relationship relationship-${stakeholder.relationship}">${stakeholder.relationship}</div>
            </div>
            <div class="stakeholder-influence">
                <div class="influence-indicator" style="width: ${stakeholder.influenceLevel}%"></div>
                <span>Influence: ${stakeholder.influenceLevel}%</span>
            </div>
        `;
        
        // Add click event to show stakeholder details
        stakeholderItem.addEventListener('click', () => showStakeholderDetails(stakeholder));
        
        stakeholderContainer.appendChild(stakeholderItem);
    });
}

// Show stakeholder details in a modal
function showStakeholderDetails(stakeholder) {
    const modal = document.getElementById('stakeholderModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    
    modalTitle.textContent = stakeholder.name;
    
    modalBody.innerHTML = `
        <div class="stakeholder-profile">
            <div class="stakeholder-header">
                <div class="stakeholder-avatar" style="width: 60px; height: 60px;">${stakeholder.avatar}</div>
                <div class="stakeholder-header-info">
                    <h3>${stakeholder.name}</h3>
                    <div class="stakeholder-relationship relationship-${stakeholder.relationship}">${stakeholder.relationship}</div>
                </div>
            </div>
            
            <div class="stakeholder-actions">
                <div class="stakeholder-influence-meter">
                    <div class="influence-label">Influence Level: ${stakeholder.influenceLevel}%</div>
                    <div class="influence-bar">
                        <div class="influence-fill" style="width: ${stakeholder.influenceLevel}%"></div>
                    </div>
                </div>
                
                <div class="stakeholder-trust-meter">
                    <div class="trust-label">Trust Level: ${stakeholder.trustLevel}%</div>
                    <div class="trust-bar">
                        <div class="trust-fill" style="width: ${stakeholder.trustLevel}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="stakeholder-details">
                <div class="stakeholder-detail-section">
                    <h4>Role</h4>
                    <p>${stakeholder.details.role}</p>
                </div>
                
                <div class="stakeholder-detail-section">
                    <h4>Interests</h4>
                    <p>${stakeholder.details.interests}</p>
                </div>
                
                <div class="stakeholder-detail-section">
                    <h4>Concerns</h4>
                    <p>${stakeholder.details.concerns}</p>
                </div>
                
                <div class="stakeholder-detail-section">
                    <h4>Background</h4>
                    <p>${stakeholder.details.background}</p>
                </div>
            </div>
        </div>
    `;
    
    modalManager.openModal(modal);
}

// Update documents display
function updateDocumentsDisplay() {
    const documentsContainer = document.querySelector('.documents-list');
    if (!documentsContainer) return;
    
    // Clear existing documents
    documentsContainer.innerHTML = '';
    
    const unlockedDocs = gameStateManager.get('unlockedDocuments');
    
    if (unlockedDocs.length === 0) {
        // Show placeholder when no documents are available
        documentsContainer.innerHTML = `
            <div class="documents-placeholder">
                <div class="placeholder-icon">📄</div>
                <p>No documents available yet. Complete actions to unlock documents.</p>
            </div>
        `;
        return;
    }
    
    // Create document items for unlocked documents
    documents.filter(doc => unlockedDocs.includes(doc.id)).forEach(doc => {
        const documentItem = document.createElement('div');
        documentItem.className = 'document-item';
        documentItem.dataset.documentId = doc.id;
        
        documentItem.innerHTML = `
            <div class="document-icon">${doc.icon}</div>
            <div class="document-info">
                <div class="document-title">${doc.title}</div>
                <div class="document-type">${doc.type}</div>
            </div>
        `;
        
        // Add click event to show document content
        documentItem.addEventListener('click', () => showDocumentContent(doc));
        
        documentsContainer.appendChild(documentItem);
    });
}

// Show document content in the viewer
function showDocumentContent(doc) {
    const documentViewer = document.querySelector('.document-viewer');
    if (!documentViewer) return;
    
    // Highlight selected document
    const documentItems = document.querySelectorAll('.document-item');
    documentItems.forEach(item => item.classList.remove('active'));
    const selectedItem = document.querySelector(`.document-item[data-document-id="${doc.id}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Display document content
    documentViewer.innerHTML = `
        <div class="document-header">
            <div class="document-header-icon">${doc.icon}</div>
            <div class="document-header-info">
                <h3>${doc.title}</h3>
                <div class="document-header-type">${doc.type}</div>
            </div>
        </div>
        <div class="document-content">
            ${formatDocumentContent(doc.content)}
        </div>
    `;
}

// Format document content with proper styling
function formatDocumentContent(content) {
    // Split content by double newlines to create paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map(paragraph => {
        // Check if paragraph is a heading (starts with #)
        if (paragraph.startsWith('#')) {
            const level = paragraph.match(/^#+/)[0].length;
            const text = paragraph.replace(/^#+\s*/, '');
            return `<h${level + 2}>${text}</h${level + 2}>`;
        }
        
        // Check if paragraph is a list item
        if (paragraph.startsWith('- ')) {
            const items = paragraph.split('\n').map(item => 
                `<li>${item.replace(/^-\s*/, '')}</li>`
            ).join('');
            return `<ul>${items}</ul>`;
        }
        
        // Regular paragraph
        return `<p>${paragraph}</p>`;
    }).join('');
}

// Execute an action
function executeAction(action) {
    // Check if player can afford the action
    if (!canAffordAction(action)) {
        addNotification({
            type: 'error',
            title: 'Cannot Execute Action',
            message: 'You do not have sufficient resources to execute this action.'
        });
        return;
    }
    
    // Show loading overlay
    showActionLoading(`Executing: ${action.title}`, 'Processing results...');
    
    // Simulate processing time
    setTimeout(() => {
        // Deduct costs
        gameStateManager.batchUpdate({
            'budget': gameStateManager.get('budget') - action.resourceCost,
            'influence': gameStateManager.get('influence') - action.influenceCost,
            'staff': gameStateManager.get('staff') - action.staffCost
        });
        
        // Apply metric changes
        if (action.metrics) {
            const metricUpdates = {};
            for (const [metric, change] of Object.entries(action.metrics)) {
                const currentValue = gameStateManager.get(`metrics.${metric}`);
                metricUpdates[`metrics.${metric}`] = Math.max(0, Math.min(100, currentValue + change));
            }
            gameStateManager.batchUpdate(metricUpdates);
        }
        
        // Apply stakeholder effects
        if (action.stakeholderEffects) {
            for (const [stakeholderId, change] of Object.entries(action.stakeholderEffects)) {
                updateStakeholderRelationship(parseInt(stakeholderId), change);
            }
        }
        
        // Unlock documents
        if (action.unlocks && action.unlocks.length > 0) {
            const unlockedDocs = [...gameStateManager.get('unlockedDocuments')];
            action.unlocks.forEach(docId => {
                if (!unlockedDocs.includes(docId)) {
                    unlockedDocs.push(docId);
                    const doc = documents.find(d => d.id === docId);
                    if (doc) {
                        addNotification({
                            type: 'info',
                            title: 'New Document Available',
                            message: `"${doc.title}" has been added to your documents.`
                        });
                    }
                }
            });
            gameStateManager.set('unlockedDocuments', unlockedDocs);
        }
        
        // Add to completed actions
        const completedActions = [...gameStateManager.get('completedActions')];
        completedActions.push(action.id);
        gameStateManager.set('completedActions', completedActions);
        
        // Update mission progress
        const currentProgress = gameStateManager.get('missionProgress');
        const progressIncrease = Math.floor(Math.random() * 10) + 5; // Random progress between 5-15%
        gameStateManager.set('missionProgress', Math.min(100, currentProgress + progressIncrease));
        
        // Hide loading overlay
        hideActionLoading();
        
        // Show action result
        showActionResult(action);
        
        // Update UI
        updateAllUI();
    }, 1500);
}

// Check if player can afford an action
function canAffordAction(action) {
    const currentBudget = gameStateManager.get('budget');
    const currentInfluence = gameStateManager.get('influence');
    const currentStaff = gameStateManager.get('staff');
    
    return (
        currentBudget >= action.resourceCost &&
        currentInfluence >= action.influenceCost &&
        currentStaff >= action.staffCost
    );
}

// Show action loading overlay
function showActionLoading(title, subtitle) {
    const loadingOverlay = document.querySelector('.action-loading-overlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('.action-loading-text');
        const loadingSubtext = loadingOverlay.querySelector('.action-loading-subtext');
        
        if (loadingText) loadingText.textContent = title;
        if (loadingSubtext) loadingSubtext.textContent = subtitle;
        
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.visibility = 'visible';
    }
}

// Hide action loading overlay
function hideActionLoading() {
    const loadingOverlay = document.querySelector('.action-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.visibility = 'hidden';
        }, 300);
    }
}

// Show action result in a modal
function showActionResult(action) {
    const modal = document.getElementById('actionResultModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = document.getElementById('actionResultBody');
    
    modalTitle.textContent = `Action Result: ${action.title}`;
    
    // Generate stakeholder reactions
    const stakeholderReactions = [];
    if (action.stakeholderEffects) {
        for (const [stakeholderId, change] of Object.entries(action.stakeholderEffects)) {
            const stakeholder = getStakeholderById(parseInt(stakeholderId));
            if (stakeholder) {
                const reactionType = change > 0 ? 'positive' : 'negative';
                const reactionText = generateStakeholderReaction(stakeholder, change);
                stakeholderReactions.push({ stakeholder, reactionType, reactionText });
            }
        }
    }
    
    modalBody.innerHTML = `
        <div class="result-content">
            <div class="result-header">
                <div class="result-icon">📊</div>
                <div class="result-title">${action.title} Completed</div>
            </div>
            
            <div class="result-description">
                <p>${action.description}</p>
            </div>
            
            <div class="result-impacts">
                <h4>Impacts:</h4>
                ${action.metrics ? Object.entries(action.metrics).map(([metric, change]) => `
                    <div class="impact-item">
                        <div>${formatMetricName(metric)}:</div>
                        <div class="impact-change ${change > 0 ? 'impact-positive-change' : 'impact-negative-change'}">
                            ${change > 0 ? '+' : ''}${change}%
                        </div>
                    </div>
                `).join('') : ''}
                
                ${action.resourceCost > 0 ? `
                    <div class="impact-item">
                        <div>Budget:</div>
                        <div class="impact-change impact-negative-change">-$${formatNumber(action.resourceCost)}</div>
                    </div>
                ` : ''}
                
                ${action.influenceCost > 0 ? `
                    <div class="impact-item">
                        <div>Influence:</div>
                        <div class="impact-change impact-negative-change">-${action.influenceCost}</div>
                    </div>
                ` : ''}
                
                ${action.staffCost > 0 ? `
                    <div class="impact-item">
                        <div>Staff:</div>
                        <div class="impact-change impact-negative-change">-${action.staffCost}</div>
                    </div>
                ` : ''}
            </div>
            
            ${stakeholderReactions.length > 0 ? `
                <div class="stakeholder-reactions">
                    <h4>Stakeholder Reactions:</h4>
                    ${stakeholderReactions.map(reaction => `
                        <div class="reaction-item reaction-${reaction.reactionType}">
                            <div class="reaction-avatar">${reaction.stakeholder.avatar}</div>
                            <div class="reaction-content">
                                <div class="reaction-name">${reaction.stakeholder.name}</div>
                                <div class="reaction-text">${reaction.reactionText}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${action.followUpText ? `
                <div class="follow-up-section">
                    <h4>Next Steps</h4>
                    <p>${action.followUpText}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    modalManager.openModal(modal);
}

// Generate stakeholder reaction text based on relationship change
function generateStakeholderReaction(stakeholder, change) {
    if (change > 20) {
        return `Extremely pleased with your decision. This aligns perfectly with our interests and strengthens our partnership.`;
    } else if (change > 10) {
        return `Appreciates your approach and sees this as a positive step forward in our relationship.`;
    } else if (change > 0) {
        return `Shows mild approval of your decision, though expects more substantial actions in the future.`;
    } else if (change > -10) {
        return `Expresses slight disappointment but is willing to continue working with you.`;
    } else if (change > -20) {
        return `Voices significant concerns about your approach and questions your commitment to their interests.`;
    } else {
        return `Strongly opposes your decision and warns of potential consequences to your relationship.`;
    }
}

// Add a notification
function addNotification(notification) {
    const container = document.querySelector('.notification-container');
    if (!container) return;
    
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    
    notificationElement.innerHTML = `
        <div class="notification-icon notification-${notification.type}">
            ${getNotificationIcon(notification.type)}
        </div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
        </div>
        <div class="notification-close">×</div>
    `;
    
    // Add close button functionality
    const closeButton = notificationElement.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notificationElement.classList.remove('active');
        setTimeout(() => {
            notificationElement.remove();
        }, 300);
    });
    
    container.appendChild(notificationElement);
    
    // Animate in
    setTimeout(() => {
        notificationElement.classList.add('active');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notificationElement.parentNode) {
            notificationElement.classList.remove('active');
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Get icon for notification type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'warning': return '⚠';
        case 'info': default: return 'ℹ';
    }
}

// End the game and show results
function endGame() {
    const modal = document.getElementById('endGameModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Calculate final score based on metrics
    const fiscalScore = gameStateManager.get('metrics.fiscalSustainability');
    const environmentalScore = gameStateManager.get('metrics.environmentalCompliance');
    const politicalScore = gameStateManager.get('metrics.politicalCapital');
    const internationalScore = gameStateManager.get('metrics.internationalRelations');
    
    const totalScore = (fiscalScore + environmentalScore + politicalScore + internationalScore) / 4;
    
    // Determine outcome based on score and mission progress
    const missionProgress = gameStateManager.get('missionProgress');
    let outcome, grade;
    
    if (totalScore >= 80 && missionProgress >= 90) {
        outcome = 'outstanding';
        grade = 'Outstanding';
    } else if (totalScore >= 70 && missionProgress >= 75) {
        outcome = 'excellent';
        grade = 'Excellent';
    } else if (totalScore >= 60 && missionProgress >= 60) {
        outcome = 'satisfactory';
        grade = 'Satisfactory';
    } else if (totalScore >= 40 && missionProgress >= 40) {
        outcome = 'needs-improvement';
        grade = 'Needs Improvement';
    } else {
        outcome = 'critical';
        grade = 'Critical Failure';
    }
    
    // Generate key achievements
    const completedActions = gameStateManager.get('completedActions');
    const achievements = [];
    
    if (fiscalScore >= 70) {
        achievements.push('Secured long-term fiscal sustainability for the port project');
    }
    
    if (environmentalScore >= 70) {
        achievements.push('Implemented effective environmental remediation programs');
    }
    
    if (politicalScore >= 70) {
        achievements.push('Built strong domestic political support for your approach');
    }
    
    if (internationalScore >= 70) {
        achievements.push('Established balanced international relationships');
    }
    
    if (completedActions.length >= 5) {
        achievements.push(`Completed ${completedActions.length} strategic actions to address the crisis`);
    }
    
    if (achievements.length === 0) {
        achievements.push('Maintained operations during a challenging period');
    }
    
    // Display end game results
    modalBody.innerHTML = `
        <div class="end-game-summary">
            <h3>Mission Complete: Port Financing Crisis</h3>
            <p>After ${gameStateManager.get('currentDay')} days as the Special Envoy, your management of Azuria's port financing crisis has resulted in a <span class="performance-grade grade-${outcome}">${grade}</span> outcome.</p>
            
            <div class="summary-metrics">
                <div class="summary-metric">
                    <div class="summary-metric-label">Fiscal Sustainability</div>
                    <div class="summary-metric-bar">
                        <div class="summary-metric-fill" style="width: ${fiscalScore}%; background-color: var(--primary);"></div>
                    </div>
                    <div class="summary-metric-value">${fiscalScore}%</div>
                </div>
                
                <div class="summary-metric">
                    <div class="summary-metric-label">Environmental Compliance</div>
                    <div class="summary-metric-bar">
                        <div class="summary-metric-fill" style="width: ${environmentalScore}%; background-color: var(--success);"></div>
                    </div>
                    <div class="summary-metric-value">${environmentalScore}%</div>
                </div>
                
                <div class="summary-metric">
                    <div class="summary-metric-label">Political Capital</div>
                    <div class="summary-metric-bar">
                        <div class="summary-metric-fill" style="width: ${politicalScore}%; background-color: var(--accent);"></div>
                    </div>
                    <div class="summary-metric-value">${politicalScore}%</div>
                </div>
                
                <div class="summary-metric">
                    <div class="summary-metric-label">International Relations</div>
                    <div class="summary-metric-bar">
                        <div class="summary-metric-fill" style="width: ${internationalScore}%; background-color: var(--secondary);"></div>
                    </div>
                    <div class="summary-metric-value">${internationalScore}%</div>
                </div>
            </div>
        </div>
        
        <div class="final-assessment">
            <h4>Final Assessment</h4>
            <p>${generateFinalAssessment(outcome, totalScore, missionProgress)}</p>
        </div>
        
        <div class="key-achievements">
            <h4>Key Achievements</h4>
            <ul>
                ${achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modalManager.openModal(modal);
}

// Generate final assessment text based on outcome
function generateFinalAssessment(outcome, score, progress) {
    switch (outcome) {
        case 'outstanding':
            return `Your exceptional management of the port financing crisis has positioned Azuria for long-term success. You balanced fiscal responsibility with environmental stewardship while maintaining strong relationships with all stakeholders. The Prime Minister has expressed interest in appointing you to a permanent cabinet position.`;
        case 'excellent':
            return `Your skillful handling of the port financing crisis has significantly improved Azuria's position. The restructured agreements provide a sustainable path forward, though some challenges remain. Your work has been recognized as a model for effective crisis management.`;
        case 'satisfactory':
            return `You've made meaningful progress in addressing the port financing crisis, creating a more stable foundation for future development. While some stakeholders remain concerned about specific aspects of your approach, the overall trajectory is positive.`;
        case 'needs-improvement':
            return `Your efforts have prevented immediate disaster, but the port's long-term viability remains uncertain. Several key stakeholders are dissatisfied with your approach, and additional work will be needed to secure a truly sustainable solution.`;
        case 'critical':
            return `The port financing crisis has worsened under your management, with increasing fiscal strain and deteriorating stakeholder relationships. The Prime Minister is considering alternative leadership to salvage the situation before it becomes a national emergency.`;
        default:
            return `Your management of the port financing crisis has concluded with mixed results. While some progress was made, significant challenges remain for Azuria's port development.`;
    }
}

// Clean up event listeners when game ends or resets
function cleanupEventListeners() {
    handlers.forEach(({ element, type, handler }) => {
        if (element) {
            element.removeEventListener(type, handler);
        }
    });
    handlers = [];
}

// Handle window resize for responsive adjustments
function handleResize(elements) {
    // Adjust UI elements based on window size
    const width = window.innerWidth;
    
    if (width < 768) {
        // Mobile adjustments
        if (elements.actionCards) {
            elements.actionCards.classList.remove('enhanced');
        }
        
        if (elements.resourcesList) {
            elements.resourcesList.classList.remove('enhanced');
        }
    } else {
        // Desktop adjustments
        if (elements.actionCards) {
            elements.actionCards.classList.add('enhanced');
        }
        
        if (elements.resourcesList) {
            elements.resourcesList.classList.add('enhanced');
        }
    }
    
    // Reposition any open modals to center
    document.querySelectorAll('.modal.active').forEach(modal => {
        const content = modal.querySelector('.modal-content');
        if (content) {
            // Reset transform to ensure proper centering
            content.style.transform = 'scale(1)';
        }
    });
}

function handleResize(elements) {
    if (elements.mainContainer) {
      if (window.innerWidth < BREAKPOINTS.MOBILE) {
        elements.mainContainer.classList.add('mobile-layout');
      } else {
        elements.mainContainer.classList.remove('mobile-layout');
      }
    }
  }
  

// Initialize the game
document.addEventListener('DOMContentLoaded', initGame);
function initGame() {
    initializeGame();
  }

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame,
        updateAllUI,
        handleResize,
        executeAction,
        showDocumentContent,
        showStakeholderDetails,
        modalManager,
        gameStateManager
    };
}
