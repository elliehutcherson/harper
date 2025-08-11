// Import the class
import { Environment } from './environment.js';


// Initialize the environment
const env = new Environment({
  shopSelector: '.items-list',
  sprinkleCountSelector: '#current-sprinkles',
  totalSprinklesSelector: '#total-sprinkles',
  timeSelector: '#elapsed-time',
  sprinklesPerMinuteSelector: '#sprinkles-per-minute',
  updateInterval: 100, // 10 updates per second
  saveInterval: 30000, // save every 30 seconds
});

// For debugging or manual testing
window.env = env;
