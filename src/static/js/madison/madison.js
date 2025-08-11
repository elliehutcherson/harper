const madison = [43.073052, -89.401230]; // Example coordinates for Madison, WI
// Initialize the map
const map = L.map('map').setView(madison, 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Sample house data with construction dates
const houses = [
  { lat: 43.073052, lng: -89.401230, builtDate: new Date('2020-03-15'), address: '123 Main St' },
  { lat: 43.074062, lng: -89.401231, builtDate: new Date('2020-06-22'), address: '456 Oak Ave' },
  { lat: 43.075072, lng: -89.401232, builtDate: new Date('2020-09-10'), address: '789 Pine Rd' },
  { lat: 43.076082, lng: -89.401233, builtDate: new Date('2021-01-05'), address: '321 Elm St' },
  { lat: 43.077092, lng: -89.401234, builtDate: new Date('2021-04-18'), address: '654 Maple Dr' },
  { lat: 43.078102, lng: -89.401235, builtDate: new Date('2021-07-30'), address: '987 Cedar Ln' },
  { lat: 43.079052, lng: -89.401236, builtDate: new Date('2021-11-12'), address: '147 Birch Way' },
  { lat: 43.080052, lng: -89.401237, builtDate: new Date('2022-02-25'), address: '258 Willow St' },
  { lat: 43.081052, lng: -89.401238, builtDate: new Date('2022-05-08'), address: '369 Spruce Ave' },
  { lat: 43.082052, lng: -89.401239, builtDate: new Date('2022-08-15'), address: '741 Ash Rd' },
  { lat: 43.083052, lng: -89.401240, builtDate: new Date('2022-12-01'), address: '852 Poplar St' },
  { lat: 43.084052, lng: -89.401241, builtDate: new Date('2023-03-20'), address: '963 Hickory Dr' },
  { lat: 43.073062, lng: -89.401330, builtDate: new Date('2020-03-20'), address: '124 Main St' },
  { lat: 43.073062, lng: -89.401431, builtDate: new Date('2020-06-15'), address: '457 Oak Ave' },
  { lat: 43.073062, lng: -89.401532, builtDate: new Date('2020-09-10'), address: '790 Pine Rd' },
  { lat: 43.073062, lng: -89.401633, builtDate: new Date('2021-12-05'), address: '322 Elm St' },
  { lat: 43.073062, lng: -89.401734, builtDate: new Date('2021-12-20'), address: '655 Maple Dr' },
  { lat: 43.073062, lng: -89.401835, builtDate: new Date('2021-12-25'), address: '988 Cedar Ln' },
  { lat: 43.073062, lng: -89.401936, builtDate: new Date('2021-12-30'), address: '148 Birch Way' },
  { lat: 43.073062, lng: -89.402037, builtDate: new Date('2022-01-05'), address: '259 Willow St' },
  { lat: 43.073062, lng: -89.402138, builtDate: new Date('2022-01-10'), address: '370 Spruce Ave' },
  { lat: 43.073062, lng: -89.402239, builtDate: new Date('2022-01-15'), address: '742 Ash Rd' },
  { lat: 43.073062, lng: -89.402340, builtDate: new Date('2022-01-20'), address: '853 Poplar St' },
  { lat: 43.073062, lng: -89.402441, builtDate: new Date('2022-01-25'), address: '964 Hickory Dr' }
];

// Store markers for easy access
const markers = [];
const startDate = new Date('2020-01-01');
const endDate = new Date('2023-12-31');

// Initialize markers (all hidden initially)
houses.forEach((house, index) => {
  const marker = L.circleMarker([house.lat, house.lng], {
    radius: 6,
    fillColor: '#4CAF50',
    color: '#2E7D32',
    weight: 2,
    opacity: 0,
    fillOpacity: 0
  }).addTo(map);

  marker.bindPopup(`
                <strong>${house.address}</strong><br>
                Built: ${house.builtDate.toLocaleDateString()}
            `);

  markers.push({
    marker: marker,
    builtDate: house.builtDate,
    address: house.address
  });
});

// Get DOM elements
const slider = document.getElementById('date-slider');
const dateDisplay = document.getElementById('date-display');

// Function to update the map based on slider value
function updateMap() {
  const sliderValue = parseInt(slider.value);
  const currentDate = new Date(startDate.getTime() + (sliderValue * 24 * 60 * 60 * 1000));

  // Update date display
  dateDisplay.textContent = currentDate.toLocaleDateString();

  // Update markers
  markers.forEach(item => {
    if (item.builtDate <= currentDate) {
      // House should be visible
      if (item.marker.options.opacity === 0) {
        // House is being built - animate it in
        item.marker.setStyle({
          opacity: 1,
          fillOpacity: 0.8
        });

        // Add animation class
        const element = item.marker.getElement();
        if (element) {
          element.classList.add('new');
          setTimeout(() => {
            element.classList.remove('new');
          }, 300);
        }
      }
    } else {
      // House should be hidden
      item.marker.setStyle({
        opacity: 0,
        fillOpacity: 0
      });
    }
  });
}

// Event listener for slider
slider.addEventListener('input', updateMap);

// Initialize the map
updateMap();

// Optional: Auto-play functionality
let autoPlay = false;
let autoPlayInterval;

// Add keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!autoPlay) {
      // Start auto-play
      autoPlay = true;
      autoPlayInterval = setInterval(() => {
        let currentValue = parseInt(slider.value);
        if (currentValue < parseInt(slider.max)) {
          slider.value = currentValue + 1;
          updateMap();
        } else {
          // End of timeline reached
          autoPlay = false;
          clearInterval(autoPlayInterval);
        }
      }, 50); // Adjust speed as needed
    } else {
      // Stop auto-play
      autoPlay = false;
      clearInterval(autoPlayInterval);
    }
  }
});

// Title card expand/collapse functionality
const titleCard = document.getElementById('title-card');
const titleContent = document.getElementById('title-content');
const expandIcon = document.getElementById('expand-icon');

titleCard.addEventListener('click', () => {
  if (titleContent.classList.contains('expanded')) {
    titleContent.classList.remove('expanded');
    expandIcon.textContent = '▼';
    expandIcon.style.transform = 'rotate(0deg)';
  } else {
    titleContent.classList.add('expanded');
    expandIcon.textContent = '▲';
    expandIcon.style.transform = 'rotate(180deg)';
  }
});

// Add instruction text
const instruction = L.control({ position: 'topright' });
instruction.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info');
  div.innerHTML = `
                <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-size: 12px;">
                    <strong>Quick Tips:</strong><br>
                    • Click title to expand info<br>
                    • Drag slider to change date<br>
                    • Press SPACE to auto-play
                </div>
            `;
  return div;
};
instruction.addTo(map);