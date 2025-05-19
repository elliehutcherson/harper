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

document.addEventListener('DOMContentLoaded', function () {
    // Get the donut image
    const donut_image = document.querySelector('.image-container img');

    if (!donut_image) {
        console.error('Donut image not found');
        return;
    }
    
    // Add click event listener
    donut_image.addEventListener('click', function () {
        // Remove the animation class if it exists
        this.classList.remove('image-bounce');

        // Force a reflow to restart the animation
        void this.offsetWidth;

        // Add the animation class
        this.classList.add('image-bounce');

        // Optional: Increment sprinkle count
        env.addSprinkles(1);
    });
});
