import { Shop } from './shop.js';

export class Environment {
  /**
   * @property {Shop} shop - The shop instance
   * @property {BigInt} totalSprinkles - Total sprinkles accumulated over all time
   * @property {BigInt} currentSprinkles - Current sprinkles available to spend
   * @property {number} startTime - Timestamp when the environment started
   * @property {number} lastUpdateTime - Timestamp of the last update
   * @property {number} updateInterval - Milliseconds between updates
   * @property {number} animationFrameId - ID for the animation frame
   * @property {HTMLElement} sprinkleCountElement - Element to display current sprinkles
   * @property {HTMLElement} statsSprinkleCountElement - Element to display current sprinkles
   * @property {HTMLElement} statsTotalSprinklesElement - Element to display total sprinkles
   * @property {HTMLElement} statsTimeElement - Element to display elapsed time
   * @property {HTMLElement} statsSprinklesPerMinuteElement - Element to display SPM
   */
  constructor(config = {}) {
    // Initialize configuration with defaults
    this.config = {
      shopSelector: '.items-list',
      sprinkleCountSelector: '#sprinkle-count',
      statsSprinkleCountSelector: '#stats-current-sprinkles',
      statsTotalSprinklesSelector: '#stats-total-sprinkles',
      statsTimeSelector: '#stats-elapsed-time',
      statsSprinklesPerMinuteSelector: '#stats-sprinkles-per-minute',
      updateInterval: 100, // milliseconds between updates (10 updates per second)
      saveInterval: 30000, // save every 30 seconds
      localStorageKey: 'sprinkle_game_save',
    };

    // Find UI elements
    this.sprinkleCountElement = document.querySelector(this.config.sprinkleCountSelector);
    this.statsSprinkleCountElement = document.querySelector(this.config.statsSprinkleCountSelector);
    this.statsTotalSprinklesElement = document.querySelector(this.config.statsTotalSprinklesSelector);
    this.statsTimeElement = document.querySelector(this.config.statsTimeSelector);
    this.statsSprinklesPerMinuteElement = document.querySelector(this.config.statsSprinklesPerMinuteSelector);

    // Initialize state
    this.totalSprinkles = BigInt(0);
    this.currentSprinkles = BigInt(0);
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.lastSaveTime = this.startTime;
    this.updateInterval = this.config.updateInterval;
    this.animationFrameId = null;
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Initialize the shop
    this.shop = new Shop(this.config.shopSelector);

    // Load saved state
    // this.loadState();

    // Start the update loop
    this.start();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Starts the update loop
   */
  start() {
    if (this.animationFrameId) return; // Already running

    // Start the update loop
    const updateLoop = () => {
      // Get current time
      const currentTime = Date.now();

      // Check if enough time has passed since the last update
      if (currentTime - this.lastUpdateTime >= this.updateInterval) {
        // Update the game state
        this.update(currentTime);
        this.lastUpdateTime = currentTime;
      }

      // Check if it's time to save
      if (currentTime - this.lastSaveTime >= this.config.saveInterval) {
        this.saveState();
        this.lastSaveTime = currentTime;
      }

      // Schedule the next update
      this.animationFrameId = requestAnimationFrame(updateLoop);
    };

    // Start the update loop
    this.animationFrameId = requestAnimationFrame(updateLoop);
  }

  /**
   * Stops the update loop
   */
  stop() {
    if (!this.animationFrameId) return; // Not running

    // Stop the update loop
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;

    // Save the state
    this.saveState();
  }

  /**
   * Updates the game state
   * @param {number} currentTime - Current timestamp
   */
  update(currentTime) {
    // Calculate elapsed time in seconds
    const elapsedSeconds = (currentTime - this.lastUpdateTime) / 1000;

    // Calculate sprinkles generated this update
    const sprinklesPerSecond = this.shop.getTotalSprinklesPerMinute() / 60;
    const newSprinkles = BigInt(Math.floor(sprinklesPerSecond * elapsedSeconds));

    // Add sprinkles
    this.currentSprinkles += newSprinkles;
    this.totalSprinkles += newSprinkles;

    // Update the UI
    this.updateUI();
  }

  /**
   * Updates the UI elements
   */
  updateUI() {
    // Format sprinkle counts
    const formattedCurrentSprinkles = this.formatNumber(this.currentSprinkles);
    const formattedTotalSprinkles = this.formatNumber(this.totalSprinkles);

    // Update sprinkle counts
    if (this.sprinkleCountElement) {
      this.sprinkleCountElement.textContent = formattedCurrentSprinkles;
    }
    
    if (this.statsSprinkleCountElement) {
      this.statsSprinkleCountElement.textContent = formattedCurrentSprinkles;
    }

    if (this.statsTotalSprinklesElement) {
      this.statsTotalSprinklesElement.textContent = formattedTotalSprinkles;
    }

    // Update elapsed time
    if (this.statsTimeElement) {
      const elapsedTime = Date.now() - this.startTime;
      this.statsTimeElement.textContent = this.formatTime(elapsedTime);
    }

    // Update sprinkles per minute
    if (this.statsSprinklesPerMinuteElement) {
      const spm = this.shop.getTotalSprinklesPerMinute();
      this.statsSprinklesPerMinuteElement.textContent = this.formatDecimal(spm);
    }
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // Save state before the page unloads
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });

    // Pause when tab is not visible and resume when it becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return this.stop();
      
      this.lastUpdateTime = Date.now(); // Reset last update time to avoid large jumps
      this.start();
    });

    // Example: Setup click handler for buying items
    document.addEventListener('click', (event) => {
      // Check if the click was on a "buy" button
      if (!event.target.classList.contains('buy-item-button')) return;
    
      const itemId = event.target.dataset.itemId;
      this.buyItem(itemId);
    });

    this.shop.setupEventListeners();
  }

  /**
   * Buys an item if the player has enough sprinkles
   * @param {string|BigInt} itemId - The ID of the item to buy
   * @returns {boolean} - Whether the purchase was successful
   */
  buyItem(itemId) {
    // Get the item
    const item = this.shop.getItem(itemId);
    if (!item) return false;

    // Check if the player has enough sprinkles
    if (this.currentSprinkles < item.price) return false;

    // Subtract the cost
    this.currentSprinkles -= item.price;

    // Increment the count
    item.count += BigInt(1);

    // Update the UI
    this.updateUI();

    return true;
  }

  /**
   * Saves the game state to localStorage
   */
  saveState() {
    const state = {
      totalSprinkles: this.totalSprinkles.toString(),
      currentSprinkles: this.currentSprinkles.toString(),
      startTime: this.startTime,
      items: Array.from(this.shop.items.values()).map(item => item.toJSON())
    };

    localStorage.setItem(this.config.localStorageKey, JSON.stringify(state));
    console.log('Game state saved');
  }

  /**
   * Loads the game state from localStorage
   */
  loadState() {
    const savedState = localStorage.getItem(this.config.localStorageKey);
    if (!savedState) return;

    try {
      const state = JSON.parse(savedState);

      // Restore sprinkle counts
      this.totalSprinkles = BigInt(state.totalSprinkles || 0);
      this.currentSprinkles = BigInt(state.currentSprinkles || 0);

      // Restore start time if provided
      if (state.startTime) {
        this.startTime = state.startTime;
      }

      // Restore items if provided
      if (!state.items || !Array.isArray(state.items)) {
        console.log('No items found in saved state');
        return;
      }

      // Clear current items
      const container = document.querySelector(this.config.shopSelector);
      if (container) {
        container.innerHTML = '';
      }

      // Add saved items
      state.items.forEach(itemData => {
        this.shop.addItem({
          ...itemData,
          id: BigInt(itemData.id),
          price: BigInt(itemData.price),
          count: BigInt(itemData.count)
        });
      });

      console.log('Game state loaded');
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  }

  /**
   * Resets the game state
   */
  resetState() {
    // Confirm reset
    if (!confirm('Are you sure you want to reset all progress?')) return;

    // Reset state
    this.totalSprinkles = BigInt(0);
    this.currentSprinkles = BigInt(0);
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;

    // Clear the shop
    const container = document.querySelector(this.config.shopSelector);
    if (container) {
      container.innerHTML = '';
    }

    // Reload default items (example)
    // this.loadDefaultItems();

    // Update UI
    this.updateUI();

    // Save the reset state
    this.saveState();

    console.log('Game state reset');
  }

  /**
   * Loads default items into the shop
   */
  loadDefaultItems() {
    // Example default items
    const defaultItems = [
      {
        name: "Basic Sprinkler",
        description: "A simple sprinkler that produces sprinkles slowly",
        price: 10, // $0.10
        sprinkles_per_cycle: 1,
        cycles_per_minute: 10,
        count: 1
      },
      {
        name: "Advanced Sprinkler",
        description: "An improved sprinkler with better efficiency",
        price: 100, // $1.00
        sprinkles_per_cycle: 5,
        cycles_per_minute: 12,
        count: 0
      },
      {
        name: "Super Sprinkler",
        description: "A high-performance sprinkler for serious production",
        price: 1000, // $10.00
        sprinkles_per_cycle: 25,
        cycles_per_minute: 15,
        count: 0
      }
    ];

    // Add default items to the shop
    defaultItems.forEach(item => {
      this.shop.addItem(item);
    });
  }

  /**
   * Adds sprinkles (for debugging or bonuses)
   * @param {number|string|BigInt} amount - The amount to add
   */
  addSprinkles(amount) {
    const sprinksToAdd = typeof amount === 'bigint' ? amount : BigInt(amount);
    this.currentSprinkles += sprinksToAdd;
    this.totalSprinkles += sprinksToAdd;
    this.updateUI();
  }

  /**
   * Formats a BigInt as a human-readable number (with K, M, B suffixes)
   * @param {BigInt} value - The value to format
   * @returns {string} - Formatted string
   */
  formatNumber(value) {
    const num = Number(value);

    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
  }

  /**
   * Formats milliseconds as a human-readable time string
   * @param {number} ms - Milliseconds
   * @returns {string} - Formatted time string (HH:MM:SS)
   */
  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  /**
   * Formats a decimal number with commas
   * @param {number} value - The value to format
   * @returns {string} - Formatted string
   */
  formatDecimal(value) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  }
}