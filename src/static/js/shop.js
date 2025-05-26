import mustache from 'https://cdn.skypack.dev/mustache';
import { Item } from './item.js';
import { formatNumber } from './utils.js';

export class Shop {
  /**
   * @property {HTMLElement} container - The container element holding all items
   * @property {Map<BigInt, Item>} items - Map of id to Item instances
   * @property {boolean} isMobile - Flag to indicate if the shop is in mobile mode
   * @property {Function} onBuy - Callback function for buy events
   */
  constructor(config) {
    // Find the container element
    this.container = document.querySelector(config.containerSelector);
    if (!this.container) {
      throw new Error(`Container element not found: ${containerSelector}`);
    }

    if (typeof config.onBuy !== 'function') {
      throw new Error('Expected a function for onBuy');
    }
    // Store the buy callback
    this.onBuyEnvironment = config.onBuy;

    if (typeof config.onCycle !== 'function') {
      throw new Error('Expected a function for onCycle');
    }
    // Store the cycle callback
    this.onCycle = config.onCycle;

    this.isMobile = config.isMobile || false;
    this.totalSpm = BigInt(0);
    this.items_loaded = false;
    this.totalSpmCached = false;

    // Initialize items map
    this.items = new Map();
  }

  async init() {
    // Load initial items
    await this.loadItems(); 

    // Set up styles
    this.setupStyles();
  }

  /**
   * Loads all items from the container
   */
  async loadItems() {
    // Clear existing items
    this.items.clear();

    const item_html_response = await fetch('/static/html/item.html');
    this.item_html_source = await item_html_response.text();

    const items_json_response = await fetch('/static/json/items.json');
    const items_json = await items_json_response.text();
    let items = JSON.parse(items_json);

    for (let item of items) {
      this.addItem(item);
    }

    this.items_loaded = true;
  }

  addItem(item_properties) {
    // Check if the item already exists
    if (this.items.has(item_properties.id)) {
      console.warn(`Item with ID ${item_properties.id} already exists.`);
      return;
    }

    item_properties.price_formatted = formatNumber(item_properties.price);
    console.log('price_formatted:', item_properties.price_formatted);
    let item_html = mustache.render(this.item_html_source, item_properties);
    console.log('item_html:', item_html);
    this.container.insertAdjacentHTML('beforeend', item_html);

    // Create a new Item instance
    const new_item = new Item({
      properties: item_properties,
      isMobile: this.isMobile,
      onBuy: this.onBuy.bind(this),
      onCycle: this.onCycle.bind(this),
      getTotalSprinklesPerMinute: this.getTotalSprinklesPerMinute.bind(this),
      element: this.container.lastElementChild,
    });

    // Store the proxied item
    this.items.set(new_item.id, new_item);
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    console.log('Setting up event listeners for shop');
    for (const item of this.items.values()) {
      console.log('Setting up event listeners for item:', item.name);
      item.setupEventListeners();
    }

    if (!this.isMobile) return;
    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
      // Close all open dropdowns
      document.querySelectorAll('.item-dropdown.active').forEach(d => {
        d.classList.remove('active');
      });
    });
  }

  /**
   * Sets up styles for the shop
   */
  setupStyles() {
    if (!this.isMobile) return;
    // Add mobile-specific CSS
    const style = document.createElement('style');
    style.textContent = `
            .item-dropdown {
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .item-dropdown.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
        `;
    document.head.appendChild(style);
  }

  onBuy(price) {
    this.totalSpmCached = false; // Invalidate cache
    return this.onBuyEnvironment(price);
  }

  /**
   * Updates all items in the shop
   * @param {number} cycles - The number of cycles to update
   */
  update(cycles) {
    for (var item of this.items.values()) {
      item.update(cycles);
    }
  }

  getTotalSprinklesPerMinute() {
    if (this.totalSpmCached) {
      return this.totalSpm;
    }

    this.totalSpm = BigInt(0);
    for (const item of this.items.values()) {
      this.totalSpm += item.sprinklesPerMinute();
    }

    console.log('Total sprinkles per minute:', this.totalSpm);
    this.totalSpmCached = true;
    return this.totalSpm;
  }
}
