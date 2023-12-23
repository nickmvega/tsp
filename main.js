import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js';

const canvasContainer = document.querySelector('#canvasContainer');

//SHADERS
const vertexShader = `
    varying vec2 vertexUV;
    varying vec3 vertexNormal;

    void main() {
        vertexUV = uv;
        vertexNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D globeTexture;
    varying vec2 vertexUV; 
    varying vec3 vertexNormal;

    void main() {
        float intensity = 1.05 - dot(
            vertexNormal, vec3(0.0, 0.0, 1.0));
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) *
            pow(intensity, 1.5);
    
        gl_FragColor = vec4(atmosphere + 
            texture2D(globeTexture, vertexUV).xyz, 1.0);
    }
`;

//LIST OF CITIES
const cities = [
    // Chicago, USA
    { name: "Chicago", country: "USA", lat: 41.8781, lon: -87.6298 },

    // Top Cities in the World
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
    { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
    { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
    { name: "Dubai", country: "United Arab Emirates", lat: 25.276987, lon: 55.296249 },
    { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
    { name: "New York City", country: "USA", lat: 40.7128, lon: -74.0060 },
    { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lon: 101.6869 },
    { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
    { name: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 },
    { name: "Antalya", country: "Turkey", lat: 36.8969, lon: 30.7133 },
    { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780 },
    { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694 },
    { name: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734 },
    { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
    { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.1900 },
    { name: "Taipei", country: "Taiwan", lat: 25.032969, lon: 121.565418 },
    { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
    { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023 },
    { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },
    { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
    { name: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378 },
    { name: "Los Angeles", country: "USA", lat: 34.0522, lon: -118.2437 },
    { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
    { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603 },
    { name: "Venice", country: "Italy", lat: 45.4408, lon: 12.3155 },
    { name: "Miami", country: "USA", lat: 25.7617, lon: -80.1918 },
    { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
    { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
    { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393 },

    // South America
    { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
    { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
    { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
    { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428 },
    { name: "Bogotá", country: "Colombia", lat: 4.7110, lon: -74.0721 },
    { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693 },
    { name: "Quito", country: "Ecuador", lat: -0.1807, lon: -78.4678 },
    { name: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036 },
    { name: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645 },
    { name: "Asunción", country: "Paraguay", lat: -25.2637, lon: -57.5759 },
    
    // Central America
    { name: "Panama City", country: "Panama", lat: 8.9824, lon: -79.5199 },
    { name: "San José", country: "Costa Rica", lat: 9.9281, lon: -84.0907 },
    { name: "Guatemala City", country: "Guatemala", lat: 14.6349, lon: -90.5069 },
    { name: "Managua", country: "Nicaragua", lat: 12.1140, lon: -86.2362 },
    { name: "Tegucigalpa", country: "Honduras", lat: 14.0723, lon: -87.1921 },
    { name: "San Salvador", country: "El Salvador", lat: 13.6929, lon: -89.2182 },
    { name: "Belize City", country: "Belize", lat: 17.5046, lon: -88.1962 },
    { name: "San Pedro Sula", country: "Honduras", lat: 15.5000, lon: -88.0333 },
    { name: "Leon", country: "Nicaragua", lat: 12.4379, lon: -86.8780 },
    { name: "Antigua Guatemala", country: "Guatemala", lat: 14.5586, lon: -90.7295 },

    // Africa
    { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
    { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
    { name: "Marrakech", country: "Morocco", lat: 31.6295, lon: -7.9811 },
    { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
    { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
    { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
    { name: "Addis Ababa", country: "Ethiopia", lat: 9.03, lon: 38.74 },
    { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lon: 39.2083 },
    { name: "Kampala", country: "Uganda", lat: 0.3476, lon: 32.5825 },
    { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898 },

    // India
    { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
    { name: "New Delhi", country: "India", lat: 28.6139, lon: 77.2090 },
    
    // Russia
    { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
    { name: "Saint Petersburg", country: "Russia", lat: 59.9343, lon: 30.3351 },
    
    // Norway
    { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522 },

    // Finland
    { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384 },
 
    // Iceland
    { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426 },
 
    // Greenland
    { name: "Nuuk", country: "Greenland", lat: 64.1814, lon: -51.6941 },
 
    // Hawaii (USA)
    { name: "Honolulu", country: "USA", lat: 21.3069, lon: -157.8583 },
 
    // Sri Lanka
    { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612 },
 
    // Senegal
    { name: "Dakar", country: "Senegal", lat: 14.7167, lon: -17.4677 },
 
    // Alaska (USA)
    { name: "Anchorage", country: "USA", lat: 61.2181, lon: -149.9003 }
];

//VARIABLES
let selectedCityMarker = null; // Store the currently selected city marker
let hoveredCityMarker = null; // Store the currently hovered city marker
let selectedCities = [];
let startingCityName;
let currentStep = 1;
let controls;

//SCENE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    canvasContainer.offsetWidth / canvasContainer.offsetHeight,
    0.1,
    1000
);

//RENDER
const renderer = new THREE.WebGLRenderer(
    {
        antialias: true,
        canvas: document.querySelector('canvas')
});
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio)

//SPHERE
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            globeTexture: {
                value: new THREE.TextureLoader().load('./image/globe.jpeg')
            }
        }
    })
);

scene.add(sphere);

//ORBIT CONTROLS
function createOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
}

//STARS
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.4
})
const starVertices = []
for (let i = 0; i < 40000; i++) {
    const x = (Math.random() - 0.5) * 3000
    const y = (Math.random() - 0.5) * 3000
    const z = (Math.random() - 0.5) * 3000;
    starVertices.push(x, y, z)
}

starGeometry.setAttribute('position',
    new THREE.Float32BufferAttribute(
        starVertices, 3));

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//CREATION OF CITY MARKERS
const globeRadius = 5; // Same as your sphere's radius
const citySize = 0.05; // Adjust the size of the city marker

cities.forEach(city => {
    const position = latLongToVector3(city.lat, city.lon, globeRadius);

    const cityGeometry = new THREE.SphereGeometry(citySize, 32, 32);
    const cityMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cityMarker = new THREE.Mesh(cityGeometry, cityMaterial);

    cityMarker.position.set(position.x, position.y, position.z);
    sphere.add(cityMarker); // Add city marker as a child of the globe

    cityMarker.userData = {
        isCityMarker: true,
        cityName: city.name,
        country: city.country
    };

    cityMarker.userData.isCityMarker = true;
});

function latLongToVector3(lat, lon, radius) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);

    var x = -(radius * Math.sin(phi) * Math.cos(theta));
    var y = radius * Math.cos(phi);
    var z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}


function onMouseMove(event) {

    if (currentStep !== 1 && currentStep !== 3) {
        return;
    }

    const bounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    // Reset previously hovered marker if it's not the selected marker
    if (hoveredCityMarker && hoveredCityMarker !== selectedCityMarker) {
        hoveredCityMarker.material.color.set(0xff0000); // Red color for city markers
    }

    // Check if we're hovering over a new city marker
    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Skip interaction for starting city in Step 3
        if (currentStep === 3 && object.userData.cityName === startingCityName) {
            return;
        }

        if (currentStep === 1 && object.userData.cityName === startingCityName) {
            return;
        }

        if (object.userData && object.userData.isCityMarker) {
            if (object !== selectedCityMarker && object.material && object.material.isMaterial && object.material.color) {
                object.material.color.set(0x800080); // Purple color for hovered city
                hoveredCityMarker = object;
            }
        }
    } else {
        hoveredCityMarker = null;
    }
}


function onClick(event) {
    if (currentStep == 1) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0 && intersects[0].object.userData && intersects[0].object.userData.isCityMarker) {
            const cityMarker = intersects[0].object;

            if (selectedCityMarker === cityMarker) {
                selectedCityMarker.material.color.set(0xff0000); // Red color
                selectedCityMarker = null;
                document.getElementById('citySelect').value = ''; // Reset select element
            } else {
                if (selectedCityMarker) {
                    selectedCityMarker.material.color.set(0xff0000); // Red color
                }

                selectedCityMarker = cityMarker;
                selectedCityMarker.material.color.set(0x00ff00); // Green color for selected city

                const cityInfo = `${selectedCityMarker.userData.cityName}, ${selectedCityMarker.userData.country}`;
                const selectElement = document.getElementById('citySelect');
                for (let i = 0; i < selectElement.options.length; i++) {
                    if (selectElement.options[i].text === cityInfo) {
                        selectElement.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    } else if (currentStep == 3) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
    
        if (intersects.length > 0 && intersects[0].object.userData && intersects[0].object.userData.isCityMarker) {
            const cityMarker = intersects[0].object;
    
            // console.log("Clicked City Marker:", cityMarker.userData.cityName);
            // console.log("Starting City:", startingCityName);
            // Skip interaction for the starting city
            if (cityMarker.userData.cityName === startingCityName) {
                return;
            }
    
            if (!selectedCities.includes(cityMarker.userData.cityName)) {
                const dropdowns = document.querySelectorAll("#cityDropdowns select");
                const currentDropdown = Array.from(dropdowns).find(dropdown => dropdown.value === '');
    
                if (currentDropdown) {
                    const cityInfo = `${cityMarker.userData.cityName}, ${cityMarker.userData.country}`;
    
                    currentDropdown.value = cityInfo;
                    selectedCityMarker = cityMarker;
                    selectedCityMarker.material.color.set(0xffa500); // Set color to orange
        
                    cityMarker.userData.isSelected = true;
                    selectedCities.push(cityMarker.userData.cityName);
    
                    currentDropdown.disabled = true; // Disable the dropdown
                    updateDropdownOptions(); // Update options in future dropdowns
                }
            }
        }
    }    
}


function updateDropdownOptions() {
    const dropdowns = document.querySelectorAll("#cityDropdowns select");

    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Pick a city</option>'; // Reset options

        cities.forEach(city => {
            if (!selectedCities.includes(city.name) || city.name + ', ' + city.country === currentValue) {
                const option = document.createElement('option');
                option.value = city.name + ', ' + city.country;
                option.textContent = city.name + ', ' + city.country;
                dropdown.appendChild(option);
            }
        });

        dropdown.value = currentValue; // Restore the selected value
    });
}

function updateStepVisibility() {
    // Define all the step elements
    const citySelect = document.getElementById("citySelect");
    const numCities = document.getElementById("numCities");
    const cityDropdowns = document.getElementById("cityDropdowns");
    const algorithmSelect = document.getElementById("algorithmSelect");
    const nextButton = document.getElementById("nextButton");
    const startButton = document.getElementById("startButton");

    // Adjust button visibility
    nextButton.style.display = (currentStep < 4) ? 'block' : 'none';
    startButton.style.display = (currentStep >= 4) ? 'block' : 'none';

    // Show and manage the current step
    switch (currentStep) {
        case 1:
            citySelect.style.display = 'block';
            citySelect.disabled = false;
            break;
        case 2:
            citySelect.disabled = true;
            numCities.style.display = 'block';
            numCities.disabled = false;
            break;
        case 3:
            numCities.disabled = true;
            cityDropdowns.style.display = 'block';
            break;
        case 4:
            cityDropdowns.disabled = true;
            algorithmSelect.style.display = 'block';
            break;
    }
}

function handleCitySelection(selectedValue, dropdownStep) {
    const selectedCity = selectedValue.split(", ")[0];
    if (dropdownStep == 3 && !selectedCities.includes(selectedCity)) {
        selectedCities.push(selectedCity);
        highlightCityOnMap(selectedCity, 3);
        updateDropdownOptions();
        // Disable the dropdown that made the selection
        event.target.disabled = true;
    }
}

function highlightCityOnMap(selectedCity, currentStep) {
    // Find and highlight the new city marker
    for (let i = 0; i < sphere.children.length; i++) {
        const object = sphere.children[i];
        if (object.userData && object.userData.isCityMarker && object.userData.cityName === selectedCity) {
            const color = currentStep == 1 ? 0x00ff00 : 0xffa500; // Green for step 1, Orange for step 3
            object.material.color.set(color);
            if (currentStep == 3) {
                selectedCityMarker = object; // Only update selectedCityMarker for step 3
            }
            break;
        }
    }
}



//EVENT LISTENERS
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mousedown', onClick);

document.getElementById('citySelect').addEventListener('change', (event) => {
    const selectedCity = event.target.value.split(", ")[0];
    highlightCityOnMap(selectedCity, 1); // Always pass 1 as the step for this dropdown

    if (currentStep == 1) {
        startingCityName = selectedCity;
    }
});


document.getElementById('numCities').addEventListener('input', (event) => {
    const numberOfCities = parseInt(event.target.value, 10);
    const cityDropdowns = document.getElementById('cityDropdowns');

    cityDropdowns.innerHTML = ''; // Clear existing dropdowns

    for (let i = 1; i <= numberOfCities; i++) {
        const select = document.createElement('select');
        select.id = 'citySelect' + i;
        select.innerHTML = `<option value="">${i}. Pick a city</option>`;

        cities.forEach(city => {
            // Check if the city is neither already selected nor the starting city
            if (!selectedCities.includes(city.name) && city.name !== startingCityName) {
                const option = document.createElement('option');
                option.value = city.name + ', ' + city.country;
                option.textContent = city.name + ', ' + city.country;
                select.appendChild(option);
            }
        });

        select.addEventListener('change', (e) => {
            handleCitySelection(e.target.value, 3); // Pass 3 as the step for these dropdowns
        });

        cityDropdowns.appendChild(select);
    }
});


function getSelectedCities() {
    // Extracting the starting city
    const citySelectElement = document.getElementById('citySelect');
    const startingCity = citySelectElement.value;

    // Extracting cities to visit
    const cityDropdowns = document.querySelectorAll("#cityDropdowns select");
    let citiesToVisit = [];

    cityDropdowns.forEach(dropdown => {
        if (dropdown.value) {
            citiesToVisit.push(dropdown.value);
        }
    });

    return { startingCity, citiesToVisit };
}

window.onload = function() {
    // For 'citySelect'
    const citySelectElement = document.getElementById('citySelect');

    cities.forEach(city => {
        const cityOption = document.createElement('option');
        cityOption.value = city.name + ', ' + city.country;
        cityOption.textContent = city.name + ', ' + city.country;
        citySelectElement.appendChild(cityOption);
    });

    // For 'algorithmSelect'
    var algorithms = {
        'dfs': 'Depth First Search (Brute Force Method)',
        // Add more algorithms here if needed
    };

    var algorithmSelectElement = document.getElementById('algorithmSelect');

    for (var key in algorithms) {
        var algorithmOption = document.createElement('option');
        algorithmOption.value = key;
        algorithmOption.textContent = algorithms[key];
        algorithmSelectElement.appendChild(algorithmOption);
    }

    document.getElementById("startButton").addEventListener("click", function() {
        // Retrieve the selected algorithm
        var selectedAlgorithm = document.getElementById('algorithmSelect').value;

        // Retrieve the starting city and cities to visit
        let { startingCity, citiesToVisit } = getSelectedCities();

        // Convert city names to city objects (assuming you have lat, lon for each city)
        // Adjust this part based on how your cities data is structured
        const cityObjects = cities.map(city => ({
            name: city.name,
            lat: city.lat,
            lon: city.lon
        }));

        const startingCityObj = cityObjects.find(city => city.name === startingCity);
        const citiesToVisitObj = citiesToVisit.map(cityName => cityObjects.find(city => city.name === cityName));

        // Check if the starting city and cities to visit are valid
        if (startingCityObj && citiesToVisitObj.length > 0) {
            // Execute the selected algorithm
            if (selectedAlgorithm === 'dfs') {
                dfs(startingCityObj, citiesToVisitObj).then(([bestCost, bestPath]) => {
                    console.log("Best Cost:", bestCost);
                    console.log("Best Path:", bestPath);
                    // Additional code to handle the result
                });
            }
            // Add more conditions here if you have more algorithms
        } else {
            console.error("Invalid city data");
        }
    });
};



document.getElementById("nextButton").addEventListener("click", function() {
    if (currentStep < 4) {
        currentStep++;
        updateStepVisibility();
    }
});

document.getElementById("resetButton").addEventListener("click", function() {
    currentStep = 1;

    // Reset the starting city
    document.getElementById("citySelect").value = '';
    startingCityName = null;

    // Reset the number of cities input and re-enable it
    const numCitiesInput = document.getElementById("numCities");
    numCitiesInput.value = '';
    numCitiesInput.disabled = false; // Re-enable the input

    // Clear the city dropdowns
    document.getElementById("cityDropdowns").innerHTML = '';

    // Reset selected cities and markers
    selectedCities = [];
    sphere.children.forEach(child => {
        if (child.userData && child.userData.isCityMarker) {
            child.material.color.set(0xff0000); // Reset marker color
        }
    });

    updateStepVisibility();
});

//ANIMATE
sphere.rotation.x = THREE.MathUtils.degToRad(23.5);

function animate() {
    requestAnimationFrame(animate);

    // Always rotate the Earth
    sphere.rotation.y += 0.00085;

    renderer.render(scene, camera);
    controls.update();
}

//INITIALIZATION
createOrbitControls();
camera.position.z = 10;
updateStepVisibility();
animate()
