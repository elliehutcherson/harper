import { Shop } from './shop.js';
import { formatNumber, formatDecimal, formatTime, roundDownDateToTenths } from './utils.js';

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
      donutSelector: '.image-container img',
      shopSelector: '.items-list',
      sprinkleCountSelector: '#sprinkle-count',
      statsSprinkleCountSelector: '#stats-current-sprinkles',
      statsTotalSprinklesSelector: '#stats-total-sprinkles',
      statsTimeSelector: '#stats-elapsed-time',
      statsSprinklesPerMinuteSelector: '#stats-sprinkles-per-minute',
      updateInterval: 100, // milliseconds between updates (10 updates per second)
      saveInterval: 30000, // save every 30 seconds
      localStorageKey: 'sprinkle_game_save',
      clickSprinkles: BigInt(1),
    };

    // Find UI elements
    this.donutImage = document.querySelector(this.config.donutSelector);
    this.sprinkleCountElement = document.querySelector(this.config.sprinkleCountSelector);
    this.statsSprinkleCountElement = document.querySelector(this.config.statsSprinkleCountSelector);
    this.statsTotalSprinklesElement = document.querySelector(this.config.statsTotalSprinklesSelector);
    this.statsTimeElement = document.querySelector(this.config.statsTimeSelector);
    this.statsSprinklesPerMinuteElement = document.querySelector(this.config.statsSprinklesPerMinuteSelector);

    if (!this.donutImage) {
      throw new Error(`Donut image not found: ${this.config.donutSelector}`);
    }
    if (!this.sprinkleCountElement) {
      throw new Error(`Sprinkle count element not found: ${this.config.sprinkleCountSelector}`);
    }
    if (!this.statsSprinkleCountElement) {
      throw new Error(`Stats sprinkle count element not found: ${this.config.statsSprinkleCountSelector}`);
    }
    if (!this.statsTotalSprinklesElement) {
      throw new Error(`Stats total sprinkles element not found: ${this.config.statsTotalSprinklesSelector}`);
    }
    if (!this.statsTimeElement) {
      throw new Error(`Stats time element not found: ${this.config.statsTimeSelector}`);
    }
    if (!this.statsSprinklesPerMinuteElement) {
      throw new Error(`Stats sprinkles per minute element not found: ${this.config.statsSprinklesPerMinuteSelector}`);
    }

    // Initialize state
    this.totalSprinkles = BigInt(0);
    this.currentSprinkles = BigInt(0);
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.lastSaveTime = this.startTime;
    this.updateInterval = this.config.updateInterval;
    this.animationFrameId = null;
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.started = false;

    this.init();
    console.log('Current sprinkles:', this.currentSprinkles);
  }

  async init() {
    // Initialize the shop
    let shopConfig = {
      containerSelector: this.config.shopSelector,
      onBuy: this.onBuy.bind(this),
      onCycle: this.onCycle.bind(this),
      isMobile: this.isMobile,
    };
    this.shop = new Shop(shopConfig);
    if (!this.shop) {
      throw new Error('Failed to initialize shop');
    }

    await this.shop.init();

    // Set up event listeners
    this.setupEventListeners();

    // Start the update loop
    this.start();
  }

  /**
   * Starts the update loop
   */
  start() {
    if (this.started) return; // Already running
    this.started = true;

    // Start the update loop
    const updateLoop = () => {
      // Get current time
      let currentTime = Date.now();
      currentTime = roundDownDateToTenths(currentTime);

      // Check if enough time has passed since the last update
      if (currentTime - this.lastUpdateTime < this.updateInterval) return;
      
      let cycles = Math.floor((currentTime - this.lastUpdateTime) / this.updateInterval);
      console.log('Update loop cycles:', cycles, 'Current time:', currentTime, 'Last update time:', this.lastUpdateTime);
      // Update the game state
      this.update(cycles);
      this.lastUpdateTime = currentTime;
    };

    setInterval((updateLoop), this.updateInterval);
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
   * @param {number} cycles - Number of cycles since the last update
   */
  update(cycles) {
    this.shop.update(cycles);
    // Update the UI
    this.updateUI();
  }

  /**
   * Updates the UI elements
   */
  updateUI() {
    // Format sprinkle counts
    const formattedCurrentSprinkles = formatNumber(this.currentSprinkles);
    const formattedTotalSprinkles = formatNumber(this.totalSprinkles);

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
      this.statsTimeElement.textContent = formatTime(elapsedTime);
    }

    // Update sprinkles per minute
    if (this.statsSprinklesPerMinuteElement) {
      const spm = this.getTotalSprinklesPerMinute();
      this.statsSprinklesPerMinuteElement.textContent = formatDecimal(spm);
    }
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    console.log('Setting up event listeners for environment');
    this.shop.setupEventListeners();
    this.donutImage.addEventListener('click', (e) => {
      this.onDonutClick(e.target);
    });
  }

  /**
   * Buys an item from the shop
   * @param { } price 
   * @returns {boolean} - True if the purchase was successful, false otherwise
   */
  onBuy(price) {
    console.log('Buying item with price:', price, 'Current sprinkles:', this.currentSprinkles);
    if (this.currentSprinkles < price) {
      return false; // Not enough sprinkles
    }

    this.currentSprinkles -= price;
    return true; // Purchase successful
  }

  /**
   * On an items cycle, increase the total sprinkles
   * @param {BigInt} sprinkles - The amount of sprinkles to add
   */
  onCycle(sprinkles) {
    console.log('Adding sprinkles from item cycle:', sprinkles);
    if (!sprinkles) {
      console.warn('No sprinkles to add');
      return;
    }
    // Add sprinkles to the current sprinkles
    this.addSprinkles(sprinkles);
  }

  /**
   * On click, add sprinkles
   */
  onDonutClick(e) {
    // Remove the animation class if it exists
    e.classList.remove('image-bounce');

    // Force a reflow to restart the animation
    void e.offsetWidth;

    // Add the animation class
    e.classList.add('image-bounce');

    // Optional: Increment sprinkle count
    this.addSprinkles(this.config.clickSprinkles);
  }

  /**
   * Add sprinkles to the current sprinkles
   * @param {BigInt} sprinkles - The amount of sprinkles to add 
   */
  addSprinkles(sprinkles) {
    this.currentSprinkles += sprinkles;
    this.totalSprinkles += sprinkles;
    this.updateUI();
  }

  getTotalSprinklesPerMinute() {
    return 0;
  }
}