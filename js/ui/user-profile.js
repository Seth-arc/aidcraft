/**
 * AidCraft Workshop Simulation - User Profile
 * Manages user profiles, settings, and progress tracking.
 */

(function() {
  'use strict';

  /**
   * UserProfile - Manages user profiles and settings
   */
  const UserProfile = {
    initialized: false,
    stateManager: window.stateManager,
    profileContainer: null,
    userData: null,
    
    /**
     * Initialize the user profile
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve) => {
        console.log('Initializing User Profile...');
        
        // Find profile container
        this.profileContainer = document.getElementById('user-profile');
        
        // Load user data from state
        this.userData = this.stateManager.getState('user', {
          id: this._generateUserId(),
          name: 'Workshop Participant',
          completedSimulations: 0,
          currentProgress: 0,
          settings: {
            notifications: true,
            sounds: true,
            autoSave: true,
            difficulty: 'standard'
          }
        });
        
        // Update state with user data if it's new
        if (!this.stateManager.getState('user')) {
          this.stateManager.setState('user', this.userData, true);
        }
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Create profile UI
        this._createProfileUI();
        
        this.initialized = true;
        console.log('User Profile initialized');
        resolve();
      });
    },
    
    /**
     * Get the current user's profile data
     * @returns {Object} User profile data
     */
    getUserData: function() {
      return { ...this.userData };
    },
    
    /**
     * Update user profile data
     * @param {Object} updates - Data to update in profile
     * @returns {boolean} Success or failure
     */
    updateUserData: function(updates) {
      if (!this.initialized) {
        console.error('User Profile not initialized');
        return false;
      }
      
      // Merge updates with existing data
      this.userData = {
        ...this.userData,
        ...updates
      };
      
      // Update state
      this.stateManager.setState('user', this.userData, true);
      
      // Update UI
      this._createProfileUI();
      
      console.log('User profile updated');
      return true;
    },
    
    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     * @returns {boolean} Success or failure
     */
    updateSettings: function(settings) {
      if (!this.initialized) {
        console.error('User Profile not initialized');
        return false;
      }
      
      // Merge settings with existing settings
      this.userData.settings = {
        ...this.userData.settings,
        ...settings
      };
      
      // Update state
      this.stateManager.setState('user', this.userData, true);
      
      console.log('User settings updated');
      return true;
    },
    
    /**
     * Track a completed simulation
     * @returns {boolean} Success or failure
     */
    trackCompletedSimulation: function() {
      if (!this.initialized) {
        console.error('User Profile not initialized');
        return false;
      }
      
      this.userData.completedSimulations += 1;
      this.updateUserData(this.userData);
      
      console.log('Completed simulation tracked');
      return true;
    },
    
    /**
     * Update simulation progress
     * @param {number} progress - Progress value between 0 and 1
     * @returns {boolean} Success or failure
     */
    updateProgress: function(progress) {
      if (!this.initialized) {
        console.error('User Profile not initialized');
        return false;
      }
      
      // Ensure progress is between 0 and 1
      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      
      this.userData.currentProgress = clampedProgress;
      this.updateUserData(this.userData);
      
      console.log(`Progress updated to ${clampedProgress}`);
      return true;
    },
    
    /**
     * Show profile settings dialog
     */
    showSettingsDialog: function() {
      if (!this.initialized || !window.uiInteractions) {
        return;
      }
      
      const settings = this.userData.settings;
      
      // Create form content
      const content = `
        <form id="settings-form" class="settings-form">
          <div class="form-group">
            <label for="user-name">Name</label>
            <input type="text" id="user-name" value="${this.userData.name}" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Notifications</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notifications" ${settings.notifications ? 'checked' : ''}>
              <label for="notifications"></label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Sound Effects</label>
            <div class="toggle-switch">
              <input type="checkbox" id="sounds" ${settings.sounds ? 'checked' : ''}>
              <label for="sounds"></label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Auto-Save</label>
            <div class="toggle-switch">
              <input type="checkbox" id="auto-save" ${settings.autoSave ? 'checked' : ''}>
              <label for="auto-save"></label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="difficulty">Difficulty</label>
            <select id="difficulty" class="form-control">
              <option value="easy" ${settings.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="standard" ${settings.difficulty === 'standard' ? 'selected' : ''}>Standard</option>
              <option value="challenging" ${settings.difficulty === 'challenging' ? 'selected' : ''}>Challenging</option>
            </select>
          </div>
        </form>
      `;
      
      // Show settings modal
      window.uiInteractions.showModal(
        'User Settings',
        content,
        [
          {
            text: 'Cancel',
            action: 'cancel',
            class: 'btn-secondary'
          },
          {
            text: 'Save',
            action: 'save',
            class: 'btn-primary',
            callback: () => {
              const form = document.getElementById('settings-form');
              if (!form) return;
              
              // Get form values
              const name = form.querySelector('#user-name').value;
              const notifications = form.querySelector('#notifications').checked;
              const sounds = form.querySelector('#sounds').checked;
              const autoSave = form.querySelector('#auto-save').checked;
              const difficulty = form.querySelector('#difficulty').value;
              
              // Update user profile
              this.updateUserData({
                name: name,
                settings: {
                  notifications: notifications,
                  sounds: sounds,
                  autoSave: autoSave,
                  difficulty: difficulty
                }
              });
              
              // Show success notification
              window.uiInteractions.showNotification('Settings saved successfully', 'success');
            }
          }
        ]
      );
    },
    
    /**
     * Generate a unique user ID
     * @private
     * @returns {string} Unique ID
     */
    _generateUserId: function() {
      return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Create the profile UI
     * @private
     */
    _createProfileUI: function() {
      if (!this.profileContainer) return;
      
      // Calculate progress percentage
      const progressPercent = Math.round(this.userData.currentProgress * 100);
      
      // Create profile HTML
      this.profileContainer.innerHTML = `
        <div class="user-profile__avatar">
          <img src="assets/images/logos/aidcraft-icon.svg" alt="User Avatar">
        </div>
        <div class="user-profile__info">
          <div class="user-profile__name">${this.userData.name}</div>
          <div class="user-profile__progress">
            <div class="user-profile__progress-label">Progress: ${progressPercent}%</div>
            <div class="user-profile__progress-bar">
              <div class="user-profile__progress-value" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
        <button class="user-profile__settings-btn" id="user-settings-btn">
          <span class="sr-only">Settings</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      `;
      
      // Add event listener to settings button
      const settingsBtn = this.profileContainer.querySelector('#user-settings-btn');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          this.showSettingsDialog();
        });
      }
    },
    
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Listen for phase changes to update progress
      document.addEventListener('aidcraft:phasechange', (event) => {
        const { newPhase } = event.detail;
        
        // Update progress based on phase index
        const phaseIndex = ['analysis', 'funding', 'negotiation', 'outcome'].indexOf(newPhase);
        if (phaseIndex >= 0) {
          const progress = phaseIndex / 3; // 3 is the max index (outcome)
          this.updateProgress(progress);
        }
      });
      
      // Listen for completed simulation
      document.addEventListener('aidcraft:simulationcomplete', () => {
        this.trackCompletedSimulation();
      });
    }
  };
  
  // Make UserProfile available globally
  window.userProfile = UserProfile;
})(); 