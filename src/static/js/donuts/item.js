import { multiplyDecimalBigint, formatNumber, bigIntPercent } from "./utils.js";

export class Item {
  /**
   * @property {BigInt} id - The item's unique identifier
   * @property {string} name - The item's name
   * @property {string} description - The item's description
   * @property {BigInt} price - The item's price in cents
   * @property {BigInt} sprinkles_per_cycle - Sprinkles produced per cycle
   * @property {BigInt} progress_per_segment - Progress completed per cycle 
   * @property {BigInt} count - The number of items owned
   * @property {number} price_multiplier - Multiplier for the price after each purchase
   * @property {boolean} isMobile - Flag for mobile devices
   * @property {Function} onBuy - Callback function for buy action, must return a boolean
   * @property {Function} onCycle - Callback function invoked on each completed cycle
   * @property {Function} getTotalSprinklesPerMinute - Callback function to get total sprinkles per minute
   * @property {HTMLElement} itemBarElement - Element to catch hover events
   * @property {HTMLElement} titleElement - Element to display the title
   * @property {HTMLElement} priceElement - Element to display the price
   * @property {HTMLElement} descriptionElement - Element to display the description
   * @property {HTMLElement} detailRows - Element to display the details
   * @property {HTMLElement} countElement - Element to display the count
   * @property {HTMLElement} progressFillElement - Element to display the progress
   * @property {HTMLElement} dropdownContentElement - Element to display the dropdown content
   * @property {HTMLElement} buyElement - Element containing the buy button
   */
  constructor(config) {
    if (!(config.element instanceof HTMLElement)) {
      throw new Error('Expected an HTMLElement');
    }
    // Store reference to the element
    this.itemBarElement = config.element;

    if (typeof config.onBuy !== 'function') {
      throw new Error('Expected a function for onBuy');
    }
    // Store the buy callback
    this.onBuy = config.onBuy;

    if (typeof config.onCycle !== 'function') {
      throw new Error('Expected a function for onCycle');
    }
    // Store the cycle callback
    this.onCycle = config.onCycle;

    if (typeof config.getTotalSprinklesPerMinute !== 'function') {
      throw new Error('Expected a function for getTotalSprinklesPerMinute');
    }
    // Store the total sprinkles per minute callback
    this.getTotalSprinklesPerMinute = config.getTotalSprinklesPerMinute;

    // Initialize with default values
    this.id = config.properties.id || BigInt(0);
    this.name = config.properties.name || '';
    this.description = config.properties.description || '';
    this.price = BigInt(config.properties.price) || BigInt(0);
    this.sprinkles_per_cycle = BigInt(config.properties.sprinkles_per_cycle) || BigInt(0);
    this.progress_per_segment = config.properties.progress_per_segment || 0.0;
    this.count = BigInt(config.properties.count) || BigInt(0);
    this.price_multiplier = config.properties.price_multiplier || 1.1;
    this.progress = 0;
    this.sprinkles_created = BigInt(0);
    this.current_price = this.price;
    this.previous_prices = [this.price];

    this.isMobile = config.isMobile || false;
    this.titleElement = this.itemBarElement.querySelector('.item-title');
    this.priceElement = this.itemBarElement.querySelector('.item-price');
    this.descriptionElement = this.itemBarElement.querySelector('.item-description');
    this.detailRows = this.itemBarElement.querySelectorAll('.item-detail-row');
    this.countElement = this.itemBarElement.querySelector('.item-count-display');
    this.progressFillElement = this.itemBarElement.querySelector('.progress-fill');
    this.dropdownContentElement = this.itemBarElement.querySelector('.dropdown-content');
    this.buyElement = this.itemBarElement.querySelector('.buy-button');


    // Set up proxy to automatically update HTML when properties change
    return new Proxy(this, {
      set: (target, prop, value) => {
        // Update the property
        target[prop] = value;

        // Update the HTML if it's one of our tracked properties
        if (['name', 'description', 'price', 'sprinkles_per_cycle',
          'progress_per_segment', 'count'].includes(prop)) {
          target.updateHTML(prop, value);
        }

        return true;
      }
    });
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    console.log('Setting up event listeners for item:', this.name);
    if (!this.itemBarElement) return;

    this.buyElement.addEventListener('click', this.buy.bind(this));

    if (!this.isMobile) return;

    this.itemBarElement.addEventListener('click', (e) => {
      // Toggle dropdown visibility
      const dropdown = this.querySelector('.item-dropdown');

      // Close all other open dropdowns
      document.querySelectorAll('.item-dropdown.active').forEach(d => {
        if (d !== dropdown) {
          d.classList.remove('active');
        }
      });

      // Toggle this dropdown
      dropdown.classList.toggle('active');

      // Prevent event bubbling
      e.stopPropagation();
    });

    // Add click handlers for dropdown close buttons
    this.dropdownContentElement.addEventListener('click', (e) => {
      // Check if click was on the close button (::after)
      const rect = this.getBoundingClientRect();
      const closeButtonX = rect.right - 30;
      const closeButtonY = rect.top + 20;

      if (e.clientX >= closeButtonX && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= closeButtonY) {
        // Click was on close button
        this.closest('.item-dropdown').classList.remove('active');
        e.stopPropagation();
      }
    });
  }

  /**
   * Updates the HTML element to reflect a property change
   * @param {string} property - The property that changed
   * @param {any} value - The new value
   */
  updateHTML(property, value) {
    if (property == 'name' && this.titleElement) {
      this.titleElement.textContent = value;
    } 
    else if (property == 'description' && this.descriptionElement) {
      this.descriptionElement.textContent = value;
    }
    else if (property == 'price' && this.priceElement) {
      // Convert the BigInt to a dollar amount string
      this.priceElement.setAttribute('value', value);
      this.priceElement.textContent = `$${formatNumber(value)}`;
    }
    else if (property == 'sprinkles_per_cycle') {
      this.updateDetailValue('sprinkles-per-cycle', value);
    }
    else if (property == 'cycles_per_minute') {
      this.updateDetailValue('cycles-per-minute', value);
    }
    else if (property == 'sprinkles_created') {
      this.updateDetailValue('total-sprinkles-created', formatNumber(value));
    }
    else if (property == 'percent_spm') {
      this.updateDetailValue('percent-spm', value);
    } 
    else if (property == 'progress_per_segment') {
      this.updateDetailValue('progress-per-segment', value);
    }
    else if (property == 'count' && this.countElement) {
      this.countElement.textContent = value.toString();
      // Highlight the count with an animation
      this.countElement.classList.remove('count-increment');
      void this.countElement.offsetWidth;
      this.countElement.classList.add('count-increment');
    }
    else if (property == 'progress' && this.progressFillElement) {
      // Update the progress bar
      const progress = Math.min(Math.max(value, 0), 1); // Clamp between 0 and 1
      this.progressFillElement.style.width = `${progress * 100}%`;
    } else {
      console.warn(`Property ${property} not recognized for update`);
    }
  }

  /**
   * Helper method to update a detail row value
   * @param {string} className - The label text to search for
   * @param {any} value - The new value
   */
  updateDetailValue(className, value) {
    const detailRows = this.itemBarElement.querySelectorAll('.item-detail-row');
    detailRows.forEach(row => {
      const element = row.querySelector('.detail-value');
      // Check if the label text includes the specified text
      if (!element || !element.classList.contains(className)) return;
      console.log(`Updating detail row for label: ${className}, value: ${value}, classList: ${element.classList}`);
      element.textContent = value.toString();
    });
  }

  /**
   * Update loop, increase progress bar, and update sprinkles 
   * @param {number} cycles - Cycles since last update
   */
  update(cycles) {
    if (!cycles) {
      console.warn('No cycles provided for update');
      return;
    }
    if (this.count <= 0) return;
    if (this.cycles <= 0) return;

    let full_progress = this.progress + (this.progress_per_segment * cycles);
    let full_cycles = Math.floor(full_progress);
    this.progress = full_progress % 1;

    this.updateHTML('progress', this.progress);
    if (full_cycles <= 0) return;

    let sprinkles = (this.sprinkles_per_cycle * this.count) + BigInt(full_cycles);
    // Add sprinkles to the total
    this.onCycle(sprinkles);
    this.sprinkles_created += sprinkles;
    console.log(`Item ${this.name} produced ${sprinkles} sprinkles over ${full_cycles} cycles. Total sprinkles created: ${this.sprinkles_created}`);
    this.updateHTML('sprinkles_created', this.sprinkles_created);
  }

  /**
   * Handles the buy button click eventk
   */
  buy() {
    // Call the onBuy function and check if it returns true
    const success = this.onBuy(this.current_price);
    if (!success) {
      // Not enough sprinkles - provide feedback
      this.buyElement.textContent = "Not enough sprinkles!";
      this.buyElement.style.backgroundColor = "#e74c3c";

      // Get the price text
      // Reset button after delay
      setTimeout(() => {
        this.buyElement.textContent = `Buy for $${formatNumber(this.current_price)}`;
        this.buyElement.style.removeProperty('background-color');
      }, 1500);

      console.log(`Not enough sprinkles to buy ${this.name}`);
      return;
    }

    // Increment item count
    this.count++;
    // Update the price for the next purchase
    this.current_price = multiplyDecimalBigint(this.price_multiplier, this.current_price);

    // Visual feedback for purchase
    this.buyElement.textContent = "Bought!";

    // Reset button after delay
    setTimeout(() => {
      this.buyElement.textContent = `Buy for $${formatNumber(this.current_price.toString())}`;
    }, 1000);

    this.updateHTML('price', this.current_price);
    this.updateHTML('count', this.count);
    this.updateHTML('sprinkles_created', this.sprinkles_created);
    this.updateHTML('percent_spm', this.percentTotalSprinklesPerMinute());
    this.updateHTML('progress_per_segment', this.progress_per_segment);
    this.updateHTML('sprinkles_per_cycle', this.sprinkles_per_cycle);
    this.updateHTML('cycles_per_minute', this.cyclesPerMinute());

    console.log(`Purchased ${this.name} for ${this.current_price} sprinkles. New count: ${this.count}`);
  }

  /**
   * Return the number of sprinkles produced per minute
   * @returns {BigInt} - The number of sprinkles produced per minute
   */
  sprinklesPerMinute(segments_per_minute = 600) {
    if (this.sprinkles_per_cycle <= 0) return 0;
    if (this.progress_per_segment <= 0) return 0;
    let cycles_per_minute = segments_per_minute * this.progress_per_segment;
    // Calculate sprinkles per minute
    return this.sprinkles_per_cycle * this.count * BigInt(cycles_per_minute);
  }

  /**
   * Return a percentage of the total sprinkles produced per minute
   * @returns {number} - The percentage of total sprinkles produced per minute
   */
  percentTotalSprinklesPerMinute() {
    if (this.sprinkles_per_cycle <= 0) return 0;
    if (this.progress_per_segment <= 0) return 0;
    if (this.count <= 0) return 0;

    let spm = this.sprinklesPerMinute();
    let total_spm = this.getTotalSprinklesPerMinute();
    return bigIntPercent(spm, total_spm);
  }

  cyclesPerMinute(segments_per_minute = 600) {
    if (this.progress_per_segment <= 0) return 0;
    // Calculate cycles per minute
    return segments_per_minute * this.progress_per_segment;
  }
}