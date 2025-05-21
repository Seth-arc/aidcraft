/**
 * AidCraft Workshop Simulation - Phase Timer
 * 
 * Manages time constraints for each phase, creating urgency and
 * realistic decision pressure.
 */

(function() {
    'use strict';

    /**
     * Phase Timer Module
     */
    const PhaseTimer = {
        /**
         * Flag to track if timer is initialized
         */
        initialized: false,

        /**
         * State Manager reference
         */
        stateManager: window.stateManager,

        /**
         * Data Loader reference
         */
        dataLoader: window.dataLoader,

        /**
         * Timer configuration for each phase (in seconds)
         */
        phaseTimeLimits: {
            analysis: 15 * 60, // 15 minutes
            funding: 20 * 60,   // 20 minutes
            negotiation: 20 * 60, // 20 minutes
            outcome: 5 * 60    // 5 minutes
        },

        /**
         * Warning thresholds as percentage of time remaining
         */
        warningThresholds: {
            warning: 50, // 50% of time remaining
            danger: 25,  // 25% of time remaining
            critical: 10 // 10% of time remaining
        },

        /**
         * Current timer state
         */
        timerState: {
            currentPhase: null,
            timeRemaining: 0,
            timeLimit: 0,
            timerId: null,
            isRunning: false,
            isPaused: false
        },

        /**
         * DOM elements
         */
        elements: {
            container: null,
            timerValue: null,
            progressBar: null,
            pauseButton: null,
            resumeButton: null,
            timeStatus: null,
            overlay: null
        },

        /**
         * Initialize the phase timer
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                console.log('Initializing Phase Timer...');
                
                // Find DOM elements
                this.elements.container = document.querySelector('.phase-timer-container');
                
                if (!this.elements.container) {
                    console.warn('Phase timer container not found, creating one');
                    this._createTimerUI();
                } else {
                    this._setupTimerUI();
                }
                
                // Set up event listeners
                document.addEventListener('aidcraft:phaseChange', this._handlePhaseChange.bind(this));
                document.addEventListener('aidcraft:modalOpened', this._handleModalOpened.bind(this));
                document.addEventListener('aidcraft:modalClosed', this._handleModalClosed.bind(this));
                
                this.initialized = true;
                console.log('Phase Timer initialized');
                resolve();
            });
        },

        /**
         * Start the timer for a phase
         * @param {string} phase - Phase identifier
         * @param {number} customDuration - Optional custom duration in seconds (overrides phase config)
         * @returns {boolean} Success or failure
         */
        startTimer: function(phase, customDuration) {
            if (!this.initialized) {
                console.error('Phase Timer not initialized');
                return false;
            }
            
            // Clear any existing timer
            this.stopTimer();
            
            // Get phase configuration
            let duration = customDuration;
            
            if (!duration && this.dataLoader) {
                const phaseConfig = this.dataLoader.getPhaseConfig(phase);
                if (phaseConfig && phaseConfig.timeAllocation) {
                    duration = phaseConfig.timeAllocation;
                } else {
                    duration = 600; // Default 10 minutes
                }
            }
            
            // Set up timer state
            this.timerState.currentPhase = phase;
            this.timerState.timeLimit = duration;
            this.timerState.timeRemaining = duration;
            this.timerState.isRunning = true;
            this.timerState.isPaused = false;
            this.timerState.startTime = Date.now();
            
            // Update UI
            this._updateTimerUI();
            
            // Start the interval
            this.timerState.timerId = setInterval(this._tick.bind(this), 1000);
            
            console.log(`Phase timer started for ${phase} with ${duration} seconds`);
            
            // Dispatch timer started event
            document.dispatchEvent(new CustomEvent('aidcraft:timerStarted', {
                detail: {
                    phase: this.timerState.currentPhase,
                    duration: this.timerState.timeLimit
                }
            }));
            
            return true;
        },

        /**
         * Stop the current timer
         */
        stopTimer: function() {
            if (this.timerState.timerId) {
                clearInterval(this.timerState.timerId);
                this.timerState.timerId = null;
            }
            
            // Reset state
            this.timerState.currentPhase = null;
            this.timerState.startTime = null;
            this.timerState.timeRemaining = 0;
            this.timerState.isRunning = false;
            this.timerState.isPaused = false;
            
            // Update UI to show empty timer
            if (this.elements.container) {
                this.elements.container.innerHTML = '';
                this.elements.container.className = 'phase-timer-container';
            }
            
            console.log('Phase timer stopped');
            
            // Dispatch timer stopped event
            document.dispatchEvent(new CustomEvent('aidcraft:timerStopped', {
                detail: {
                    phase: this.timerState.currentPhase
                }
            }));
        },

        /**
         * Pause the timer
         * @returns {boolean} Success or failure
         */
        pauseTimer: function() {
            if (!this.timerState.timerId || this.timerState.isPaused) {
                return false;
            }
            
            this.timerState.isPaused = true;
            this.timerState.pauseStartTime = Date.now();
            
            // Update UI to show paused state
            if (this.elements.container) {
                this.elements.container.classList.add('phase-timer-container--paused');
            }
            
            console.log('Phase timer paused');
            
            // Dispatch timer paused event
            document.dispatchEvent(new CustomEvent('aidcraft:timerPaused', {
                detail: {
                    phase: this.timerState.currentPhase,
                    timeRemaining: this.timerState.timeRemaining
                }
            }));
            
            return true;
        },

        /**
         * Resume the timer
         * @returns {boolean} Success or failure
         */
        resumeTimer: function() {
            if (!this.timerState.timerId || !this.timerState.isPaused) {
                return false;
            }
            
            // Calculate pause duration
            const pauseDuration = Math.floor((Date.now() - this.timerState.pauseStartTime) / 1000);
            
            // Adjust start time to account for pause
            this.timerState.startTime += (pauseDuration * 1000);
            
            this.timerState.isPaused = false;
            this.timerState.pauseStartTime = null;
            
            // Update UI to remove paused state
            if (this.elements.container) {
                this.elements.container.classList.remove('phase-timer-container--paused');
            }
            
            console.log('Phase timer resumed');
            
            // Dispatch timer resumed event
            document.dispatchEvent(new CustomEvent('aidcraft:timerResumed', {
                detail: {
                    phase: this.timerState.currentPhase,
                    timeRemaining: this.timerState.timeRemaining
                }
            }));
            
            return true;
        },

        /**
         * Add time to the current timer
         * @param {number} seconds - Seconds to add
         * @returns {boolean} Success or failure
         */
        addTime: function(seconds) {
            if (!this.timerState.timerId) {
                return false;
            }
            
            this.timerState.timeRemaining += seconds;
            
            // Update UI
            this._updateTimerUI();
            
            console.log(`Added ${seconds} seconds to phase timer`);
            
            return true;
        },

        /**
         * Get time remaining in current phase
         * @returns {number} Seconds remaining or 0 if no timer active
         */
        getTimeRemaining: function() {
            return this.timerState.timeRemaining || 0;
        },

        /**
         * Get timer state
         * @returns {object} Current timer state
         */
        getTimerState: function() {
            return { ...this.timerState };
        },

        /**
         * Create timer UI
         * @private
         */
        _createTimerUI: function() {
            // Create container if it doesn't exist
            const container = document.createElement('div');
            container.className = 'phase-timer-container';
            
            // Create timer HTML
            container.innerHTML = `
                <div class="timer-display">
                    <span class="timer-icon">⏱</span>
                    <span class="timer-value">00:00</span>
                </div>
                <div class="timer-progress">
                    <div class="timer-progress-bar" style="width: 100%"></div>
                </div>
                <div class="timer-status">Ready</div>
                <div class="timer-controls">
                    <button class="timer-control-btn pause-timer">⏸</button>
                    <button class="timer-control-btn add-time">+</button>
                </div>
                
                <div class="resources-display">
                    <div class="resource time-resource">
                        <span class="resource-icon">⏱</span>
                        <span class="resource-value">45</span>
                        <span class="resource-label">Time</span>
                    </div>
                    <div class="resource staff-resource">
                        <span class="resource-icon">👥</span>
                        <span class="resource-value">8</span>
                        <span class="resource-label">Staff</span>
                    </div>
                    <div class="resource political-resource">
                        <span class="resource-icon">⚖️</span>
                        <span class="resource-value">100</span>
                        <span class="resource-label">Political</span>
                    </div>
                </div>
            `;
            
            // Create pause overlay
            const overlay = document.createElement('div');
            overlay.className = 'timer-overlay';
            overlay.innerHTML = `
                <div class="timer-pause-message">
                    <div class="timer-pause-icon">⏸</div>
                    <div class="timer-pause-text">Simulation Paused</div>
                    <button class="timer-resume-btn">Resume</button>
                </div>
            `;
            
            // Add to DOM
            document.querySelector('.app-footer').appendChild(container);
            document.body.appendChild(overlay);
            
            // Save references
            this.elements.container = container;
            this.elements.overlay = overlay;
            
            // Set up UI
            this._setupTimerUI();
        },

        /**
         * Set up timer UI elements and event listeners
         * @private
         */
        _setupTimerUI: function() {
            // Get element references
            this.elements.timerValue = document.querySelector('.timer-value');
            this.elements.progressBar = document.querySelector('.timer-progress-bar');
            this.elements.pauseButton = document.querySelector('.pause-timer');
            this.elements.timeStatus = document.querySelector('.timer-status');
            this.elements.overlay = document.querySelector('.timer-overlay');
            this.elements.resumeButton = document.querySelector('.timer-resume-btn');
            
            // Set up event listeners
            if (this.elements.pauseButton) {
                this.elements.pauseButton.addEventListener('click', () => {
                    if (this.timerState.isRunning) {
                        this.pauseTimer();
                    } else if (this.timerState.isPaused) {
                        this.resumeTimer();
                    }
                });
            }
            
            if (this.elements.resumeButton) {
                this.elements.resumeButton.addEventListener('click', () => {
                    this.resumeTimer();
                });
            }
            
            const addTimeButton = document.querySelector('.add-time');
            if (addTimeButton) {
                addTimeButton.addEventListener('click', () => {
                    this.addTime(60); // Add 1 minute
                });
            }
            
            // Update resources display
            this._updateResourcesDisplay();
            
            // Listen for resource changes
            document.addEventListener('aidcraft:statechange', (event) => {
                const { path } = event.detail;
                
                if (path.startsWith('resources.')) {
                    this._updateResourcesDisplay();
                }
            });
        },

        /**
         * Update timer UI based on current state
         * @private
         */
        _updateTimerUI: function() {
            if (!this.elements.timerValue || !this.elements.progressBar) {
                return;
            }
            
            // Format time
            const minutes = Math.floor(this.timerState.timeRemaining / 60);
            const seconds = this.timerState.timeRemaining % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update time display
            this.elements.timerValue.textContent = formattedTime;
            
            // Update progress bar
            const progressPercent = (this.timerState.timeRemaining / this.timerState.timeLimit) * 100;
            this.elements.progressBar.style.width = `${progressPercent}%`;
            
            // Update status classes
            const timerDisplay = document.querySelector('.timer-display');
            if (timerDisplay) {
                timerDisplay.classList.remove('timer-normal', 'timer-warning', 'timer-danger', 'timer-paused', 'timer-finished');
                
                if (this.timerState.isPaused) {
                    timerDisplay.classList.add('timer-paused');
                    this.elements.timeStatus.textContent = 'Paused';
                } else if (this.timerState.timeRemaining <= 0) {
                    timerDisplay.classList.add('timer-finished');
                    this.elements.timeStatus.textContent = 'Time\'s up!';
                } else {
                    const percentRemaining = (this.timerState.timeRemaining / this.timerState.timeLimit) * 100;
                    
                    if (percentRemaining <= this.warningThresholds.critical) {
                        timerDisplay.classList.add('timer-danger');
                        this.elements.timeStatus.textContent = 'Critical!';
                    } else if (percentRemaining <= this.warningThresholds.danger) {
                        timerDisplay.classList.add('timer-danger');
                        this.elements.timeStatus.textContent = 'Running out!';
                    } else if (percentRemaining <= this.warningThresholds.warning) {
                        timerDisplay.classList.add('timer-warning');
                        this.elements.timeStatus.textContent = 'Hurry!';
                    } else {
                        timerDisplay.classList.add('timer-normal');
                        this.elements.timeStatus.textContent = 'In progress';
                    }
                }
            }
            
            // Update pause button text
            if (this.elements.pauseButton) {
                this.elements.pauseButton.textContent = this.timerState.isPaused ? '▶️' : '⏸';
            }
        },

        /**
         * Update resources display
         * @private
         */
        _updateResourcesDisplay: function() {
            const resources = this.stateManager.getState('resources', {
                time: 45,
                staff: 8,
                politicalCapital: 100
            });
            
            // Update time resource
            const timeValue = document.querySelector('.time-resource .resource-value');
            if (timeValue) {
                timeValue.textContent = resources.time;
            }
            
            // Update staff resource
            const staffValue = document.querySelector('.staff-resource .resource-value');
            if (staffValue) {
                staffValue.textContent = resources.staff;
            }
            
            // Update political resource
            const politicalValue = document.querySelector('.political-resource .resource-value');
            if (politicalValue) {
                politicalValue.textContent = resources.politicalCapital;
            }
        },

        /**
         * Show pause overlay
         * @private
         */
        _showPauseOverlay: function() {
            if (this.elements.overlay) {
                this.elements.overlay.classList.add('active');
            }
        },

        /**
         * Hide pause overlay
         * @private
         */
        _hidePauseOverlay: function() {
            if (this.elements.overlay) {
                this.elements.overlay.classList.remove('active');
            }
        },

        /**
         * Handle timer tick
         * @private
         */
        _tick: function() {
            if (this.timerState.isPaused) {
                return;
            }
            
            // Calculate time elapsed
            const elapsedSeconds = Math.floor((Date.now() - this.timerState.startTime) / 1000);
            this.timerState.timeRemaining = Math.max(0, this.timerState.timeLimit - elapsedSeconds);
            
            // Update timer UI
            this._updateTimerUI();
            
            // Check for timer expiration
            if (this.timerState.timeRemaining <= 0) {
                this._handleTimerExpiration();
            }
        },

        /**
         * Handle timer expiration
         * @private
         */
        _handleTimerExpiration: function() {
            // Stop the timer
            this.stopTimer();
            
            console.log(`Phase timer expired for ${this.timerState.currentPhase}`);
            
            // Dispatch timer expired event
            document.dispatchEvent(new CustomEvent('aidcraft:timerComplete', {
                detail: {
                    phase: this.timerState.currentPhase
                }
            }));
            
            // Update UI to show expired state
            if (this.elements.container) {
                this.elements.container.classList.add('phase-timer-container--expired');
            }
        },

        /**
         * Handle phase change event
         * @param {Event} event - Phase change event
         * @private
         */
        _handlePhaseChange: function(event) {
            const { newPhase } = event.detail;
            
            if (newPhase) {
                // Stop current timer if running
                this.stopTimer();
                
                // Start timer for new phase
                this.startTimer(newPhase);
            }
        },

        /**
         * Handle modal opened event
         * @private
         */
        _handleModalOpened: function() {
            // Pause timer when modal is opened
            if (this.timerState.isRunning) {
                this.pauseTimer();
                
                // Flag that this pause was due to a modal
                this.timerState.pausedByModal = true;
            }
        },

        /**
         * Handle modal closed event
         * @private
         */
        _handleModalClosed: function() {
            // Resume timer if it was paused by a modal
            if (this.timerState.isPaused && this.timerState.pausedByModal) {
                this.resumeTimer();
                this.timerState.pausedByModal = false;
            }
        }
    };

    // Expose the phase timer globally
    window.phaseTimer = PhaseTimer;
})(); 