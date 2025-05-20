export class Shop {
  /**
   * @property {HTMLElement} container - The container element holding all items
   * @property {Map<BigInt, Item>} items - Map of id to Item instances
   * @property {Function} onItemChange - Callback for when any item changes
   */
  constructor(containerSelector = '.item-list', isMobile = false) {
    // Find the container element
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Container element not found: ${containerSelector}`);
    }

    // Initialize items map
    this.items = new Map();

    // Load initial items
    this.loadItems();
    
    // Set up styles
    this.setupStyles();
  }

  /**
   * Loads all items from the container
   */
  loadItems() {
    // Clear existing items
    this.items.clear();

    // Find all item elements
    const itemElements = this.container.querySelectorAll('.item-bar');

    // Create Item instances
    itemElements.forEach(element => {
      const item = new Item(element);

      // Store the proxied item
      this.items.set(item.id, item);
    });
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    if (!this.isMobile) return;

    for (const item of this.items.values()) {
      item.setupEventListeners();
    }
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

  /**
   * Update based on cycle properties
   */
  update(currentSprinkles) {
    // Todo: Implement logic to update the shop based on current sprinkles
    console.log('Updating shop with current sprinkles:', currentSprinkles);
  }

  /**
   * Gets an item by id
   * @param {BigInt|string|number} id - The item id
   * @returns {Item|undefined} - The item or undefined if not found
   */
  getItem(id) {
    // Convert to BigInt if needed
    const itemId = typeof id !== 'bigint' ? BigInt(id) : id;
    return this.items.get(itemId);
  }

  /**
   * Gets all items
   * @returns {Item[]} - Array of all items
   */
  getAllItems() {
    return Array.from(this.items.values());
  }

  /**
   * Adds a new item to the shop
   * @param {Object} itemData - The item data
   * @returns {Item} - The new item
   */
  addItem(itemData) {
    // Create a new item element
    const itemElement = Item.prototype.toHTML.call({
      id: itemData.id || BigInt(Date.now()),
      name: itemData.name || 'New Item',
      description: itemData.description || '',
      price: typeof itemData.price === 'bigint' ? itemData.price : BigInt(itemData.price || 0),
      sprinkles_per_cycle: itemData.sprinkles_per_cycle || 0,
      cycles_per_minute: itemData.cycles_per_minute || 0,
      count: typeof itemData.count === 'bigint' ? itemData.count : BigInt(itemData.count || 0)
    });

    // Add to container
    this.container.appendChild(itemElement);

    // Create and store the item (loadItems will be triggered by observer)
    const item = new Item(itemElement);
    this.items.set(item.id, item);

    return item;
  }

  /**
   * Removes an item from the shop
   * @param {BigInt|string|number} id - The item id
   * @returns {boolean} - Whether the item was removed
   */
  removeItem(id) {
    // Convert to BigInt if needed
    const itemId = typeof id !== 'bigint' ? BigInt(id) : id;

    // Get the item
    const item = this.items.get(itemId);
    if (!item) {
      return false;
    }

    // Remove from DOM
    item.element.remove();

    // Remove from map
    return this.items.delete(itemId);
  }

  /**
   * Updates an item by id
   * @param {BigInt|string|number} id - The item id
   * @param {Object} properties - The properties to update
   * @returns {Item|null} - The updated item or null if not found
   */
  updateItem(id, properties) {
    // Convert to BigInt if needed
    const itemId = typeof id !== 'bigint' ? BigInt(id) : id;

    // Get the item
    const item = this.items.get(itemId);
    if (!item) {
      return null;
    }

    // Update the item
    item.update(properties);

    return item;
  }

  /**
   * Gets the total count of all items
   * @returns {BigInt} - The total count
   */
  getTotalCount() {
    return Array.from(this.items.values()).reduce(
      (total, item) => total + item.count,
      BigInt(0)
    );
  }

  /**
   * Gets the total value of all items (price * count)
   * @returns {BigInt} - The total value
   */
  getTotalValue() {
    return Array.from(this.items.values()).reduce(
      (total, item) => total + (item.price * item.count),
      BigInt(0)
    );
  }

  /**
   * Gets the total sprinkles per minute
   * @returns {number} - Sprinkles per minute
   */
  getTotalSprinklesPerMinute() {
    return Array.from(this.items.values()).reduce(
      (total, item) => {
        const itemTotal = Number(item.count) *
          item.sprinkles_per_cycle *
          item.cycles_per_minute;
        return total + itemTotal;
      },
      0
    );
  }

  /**
   * Updates the UI for all items
   */
  refreshUI() {
    Array.from(this.items.values()).forEach(item => {
      // Trigger update for all relevant properties
      ['name', 'description', 'price', 'sprinkles_per_cycle',
        'cycles_per_minute', 'count'].forEach(prop => {
          item.updateHTML(prop, item[prop]);
        });
    });
  }

  /**
   * Saves the current shop state to localStorage
   * @param {string} key - The key to save under
   */
  saveToLocalStorage(key = 'shop_items') {
    // Convert items to JSON
    const itemsData = Array.from(this.items.values()).map(item => item.toJSON());

    // Save to localStorage
    localStorage.setItem(key, JSON.stringify(itemsData));
  }

  /**
   * Loads shop state from localStorage
   * @param {string} key - The key to load from
   * @returns {boolean} - Whether the load was successful
   */
  loadFromLocalStorage(key = 'shop_items') {
    // Get from localStorage
    const data = localStorage.getItem(key);
    if (!data) {
      return false;
    }

    try {
      // Parse JSON
      const itemsData = JSON.parse(data);

      // Clear current items
      this.container.innerHTML = '';
      this.items.clear();

      // Add items
      itemsData.forEach(itemData => {
        this.addItem({
          ...itemData,
          id: BigInt(itemData.id),
          price: BigInt(itemData.price),
          count: BigInt(itemData.count)
        });
      });

      return true;
    } catch (error) {
      console.error('Error loading shop from localStorage:', error);
      return false;
    }
  }
}

export class Item {
  /**
   * @property {BigInt} id - The item's unique identifier
   * @property {string} name - The item's name
   * @property {string} description - The item's description
   * @property {BigInt} price - The item's price in cents
   * @property {number} sprinkles_per_cycle - Sprinkles produced per cycle
   * @property {number} cycles_per_minute - Cycles completed per minute
   * @property {BigInt} count - The number of items owned
   * @property {HTMLElement} element - Reference to the HTML element
   * @property {HTMLElement} itemBarElement - Element to catch hover events
   * @property {HTMLElement} itemCountElement - Element to display the count
   * @property {HTMLElement} titleElement - Element to display the title
   * @property {HTMLElement} priceElement - Element to display the price
   * @property {HTMLElement} descriptionElement - Element to display the description
   * @property {HTMLElement} detailRows - Element to display the details
   * @property {HTMLElement} countElement - Element to display the count
   * @property {HTMLElement} progressFillElement - Element to display the progress
   */
  constructor(element, isMobile = false) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('Expected an HTMLElement');
    }

    // Store reference to the element
    this.element = element;

    // Initialize with default values
    this.isMobile = isMobile;
    this.id = BigInt(0);
    this.name = '';
    this.description = '';
    this.price = BigInt(0);
    this.sprinkles_per_cycle = 0.0;
    this.cycles_per_minute = 0.0;
    this.count = BigInt(0);
    this.itemBarElement = this.element.querySelector('.item-bar');
    this.titleElement = this.element.querySelector('.item-title');
    this.priceElement = this.element.querySelector('.item-price');
    this.descriptionElement = this.element.querySelector('.item-description');
    this.detailRows = this.element.querySelectorAll('.item-detail-row');
    this.countElement = this.element.querySelector('.item-count');
    this.progressFillElement = this.element.querySelector('.progress-fill');
    this.dropdownContentElement = this.element.querySelector('.dropdown-content');

    // Parse the element
    this.parseElement(element);

    // Set up proxy to automatically update HTML when properties change
    return new Proxy(this, {
      set: (target, prop, value) => {
        // Update the property
        target[prop] = value;

        // Update the HTML if it's one of our tracked properties
        if (['name', 'description', 'price', 'sprinkles_per_cycle',
          'cycles_per_minute', 'count'].includes(prop)) {
          target.updateHTML(prop, value);
        }

        return true;
      }
    });
  }

  /**
   * Parses the HTML element and extracts data
   * @param {HTMLElement} element - The item element to parse
   */
  parseElement(element) {
    // Extract name
    if (this.titleElement) {
      this.name = this.titleElement.textContent.trim();
    }

    // Extract price (convert to BigInt cents for uint64_t)
    if (this.priceElement) {
      // Get the raw value attribute if available, otherwise parse the text
      if (this.priceElement.hasAttribute('value')) {
        this.price = BigInt(this.priceElement.getAttribute('value'));
      } else {
        // Remove $ and convert to cents (multiply by 100)
        const priceText = this.priceElement.textContent.replace('$', '').trim();
        this.price = BigInt(Math.round(parseFloat(priceText) * 100));
      }
    }

    // Extract description
    if (this.descriptionElement) {
      this.description = this.descriptionElement.textContent.trim();
    }

    // Extract sprinkles_per_cycle (fixing the selector issue)
    this.detailRows.forEach(row => {
      const label = row.querySelector('.detail-label');
      const value = row.querySelector('.detail-value');

      if (!label || !value) return;

      if (label.textContent.includes('Sprinkles Per Cycle')) {
        this.sprinkles_per_cycle = parseFloat(value.textContent.trim());
      } else if (label.textContent.includes('Cycles Per Minute')) {
        this.cycles_per_minute = parseFloat(value.textContent.trim());
      }
    });

    // Extract count
    if (this.countElement) {
      this.count = BigInt(this.countElement.textContent.trim());
    }

    // Generate an ID if not present
    if (this.id === BigInt(0)) {
      this.id = this.generateId();
    }
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    if (!this.itemBarElement) return;
    if (!this.isMobile) return;

    this.element.addEventListener('click', function (e) {
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
    this.dropdownContentElement.addEventListener('click', function (e) {
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
    switch (property) {
      case 'name':
        if (this.titleElement) {
          this.titleElement.textContent = value;
        }
        break;

      case 'description':
        if (this.descriptionElement) {
          this.descriptionElement.textContent = value;
        }
        break;

      case 'price':
        if (this.priceElement) {
          // Convert the BigInt to a dollar amount string
          const dollars = Number(value) / 100;
          this.priceElement.setAttribute('value', value.toString());
          this.priceElement.textContent = `$${dollars.toFixed(2)}`;
        }
        break;

      case 'sprinkles_per_cycle':
        this.updateDetailValue('Sprinkles Per Cycle', value);
        break;

      case 'cycles_per_minute':
        this.updateDetailValue('Cycles Per Minute', value);
        break;

      case 'count':
        if (this.countElement) {
          this.countElement.textContent = value.toString();
        }
        break;
    }
  }

  /**
   * Helper method to update a detail row value
   * @param {string} labelText - The label text to search for
   * @param {any} value - The new value
   */
  updateDetailValue(labelText, value) {
    const detailRows = this.element.querySelectorAll('.item-detail-row');
    detailRows.forEach(row => {
      const label = row.querySelector('.detail-label');
      // Check if the label text includes the specified text
      if (!label || label.textContent.includes(labelText)) return;
      // Find the value element in the same row
      const valueElement = row.querySelector('.detail-value');
      if (!valueElement) return;

      valueElement.textContent = value.toString();
    });
  }

  /**
   * Updates multiple properties at once
   * @param {Object} properties - Object with properties to update
   */
  update(properties) {
    for (const [key, value] of Object.entries(properties)) {
      if (!this.hasOwnProperty(key)) continue;
      // This will trigger the proxy setter which updates the HTML
      this[key] = value;
    }
  }

  /**
   * Generates a simple hash-based ID if none is provided
   * @returns {BigInt} - A generated ID
   */
  generateId() {
    let hash = 0;
    const str = this.name + this.description;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return BigInt(Math.abs(hash));
  }

  /**
   * Creates a new Item instance from an HTML string
   * @param {string} html - HTML string representing an item
   * @returns {Item} - A new Item instance
   */
  static fromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return new Item(template.content.firstChild);
  }

  /**
  * Creates a new HTML element from an Item instance
  * @returns {HTMLElement} - A new HTML element
  */
  toHTML() {
    // Format the price for display
    const priceInDollars = Number(this.price) / 100;
    const priceString = priceInDollars.toFixed(2);

    // Create the HTML
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="item-bar">
        <div class="item-left-border"></div>
        <div class="item-content">
          <div class="item-header">
            <div class="item-title">${this.name}</div>
            <div value="${this.price}" class="item-price">$${priceString}</div>
          </div>
          <div class="item-description">${this.description}</div>
          <div class="item-details">
            <div class="item-detail-row">
              <span class="detail-label">Sprinkles Per Cycle:</span>
              <span class="detail-value">${this.sprinkles_per_cycle}</span>
            </div>
            <div class="item-detail-row">
              <span class="detail-label">Cycles Per Minute:</span>
              <span class="detail-value">${this.cycles_per_minute}</span>
            </div>
          </div>
          <div class="item-progress">
            <div class="progress-fill" value="95" style="width: 95%"></div>
          </div>
        </div>
        <div class="item-count-container">
          <div class="item-count">${this.count}</div>
        </div>
      </div>
    `.trim();

    return template.content.firstChild;
  }

  /**
   * Returns a string representation of the item
   * @returns {string} - String representation
   */
  toString() {
    return `Item(id=${this.id}, name="${this.name}", price=${this.price}, count=${this.count})`;
  }

  /**
   * Returns a JSON representation of the item
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
      description: this.description,
      price: this.price.toString(),
      sprinkles_per_cycle: this.sprinkles_per_cycle,
      cycles_per_minute: this.cycles_per_minute,
      count: this.count.toString()
    };
  }
}