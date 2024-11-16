// js/map.js
class MapManager {
    constructor() {
        this.map = L.map('map', {
            center: [42.3601, -71.0942],
            zoom: 13,
            zoomControl: true
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }
            
    initializeUI() {
        // Create transport mode buttons
        const modesContainer = document.querySelector('.transport-modes');
        Object.keys(CONFIG.transportModes).forEach(mode => {
            const button = document.createElement('button');
            button.className = 'mode-button';
            button.dataset.mode = mode;
            button.textContent = CONFIG.transportModes[mode].name;
            if (mode === this.selectedMode) button.classList.add('active');
            modesContainer.appendChild(button);
        });
        
        this.setupEventListeners();
    }

    initializeMap() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    clearMap() {
        if (this.route) {
            this.map.removeLayer(this.route);
        }
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }


    async geocodeAddress(address) {
        try {
            // Using Nominatim instead of OpenRouteService for geocoding (no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            }
            throw new Error('Location not found');
        } catch (error) {
            console.error('Geocoding failed:', error);
            throw error;
        }
    }

    async calculateRoute(start, end, mode) {
        try {
            this.clearMap();
            
            const startCoords = await this.geocodeAddress(start);
            const endCoords = await this.geocodeAddress(end);
            
            if (!startCoords || !endCoords) {
                throw new Error('Unable to geocode addresses');
            }

            // Add markers for start and end points
            this.addMarker([startCoords[1], startCoords[0]], 'Start');
            this.addMarker([endCoords[1], endCoords[0]], 'End');

            // Convert transport mode to ORS profile
            const profile = this.getORSProfile(mode);

            // Prepare request body
            const body = {
                coordinates: [
                    startCoords,
                    endCoords
                ],
                options: {
                    alternative_routes: {
                        target_count: 1,
                        weight_factor: 1.6
                    }
                },
                preference: this.getRoutePreference(mode),
                units: "km",
                instructions: true,
                language: "en"
            };

            // Make API request
            const response = await fetch(
                `https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png'
                    },
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayRoute(data);

            // Calculate and return route details
            return this.processRouteData(data);

        } catch (error) {
            console.error('Route calculation failed:', error);
            throw error;
        }
    }

    getORSProfile(mode) {
        // Map transport modes to ORS profiles
        const profiles = {
            car: 'driving-car',
            electricCar: 'driving-car',
            motorcycle: 'driving-car',
            scooter: 'cycling-regular',
            bicycle: 'cycling-regular',
            walking: 'foot-walking'
        };
        return profiles[mode] || 'driving-car';
    }

    getRoutePreference(mode) {
        // Set route preferences based on mode
        const preferences = {
            car: 'recommended',
            electricCar: 'recommended',
            motorcycle: 'recommended',
            scooter: 'recommended',
            bicycle: 'recommended',
            walking: 'recommended'
        };
        return preferences[mode] || 'recommended';
    }

    addMarker(coords, label) {
        const marker = L.marker(coords)
            .bindPopup(label)
            .addTo(this.map);
        this.markers.push(marker);
    }

    displayRoute(routeData) {
        if (this.route) {
            this.map.removeLayer(this.route);
        }

        // Style the route based on transport mode
        const routeStyle = {
            color: '#3388ff',
            weight: 6,
            opacity: 0.7
        };

        this.route = L.geoJSON(routeData, {
            style: routeStyle
        }).addTo(this.map);

        // Add hover effect
        this.route.on('mouseover', (e) => {
            e.layer.setStyle({
                weight: 8,
                opacity: 1
            });
        });

        this.route.on('mouseout', (e) => {
            e.layer.setStyle(routeStyle);
        });

        // Fit map to show entire route
        this.map.fitBounds(this.route.getBounds(), {
            padding: [50, 50]
        });
    }

    processRouteData(data) {
        if (!data.features || !data.features[0] || !data.features[0].properties) {
            throw new Error('Invalid route data');
        }

        const properties = data.features[0].properties;
        const segments = data.features[0].geometry.coordinates;

        return {
            distance: properties.segments[0].distance, // in meters
            duration: properties.segments[0].duration, // in seconds
            ascent: properties.ascent,
            descent: properties.descent,
            segments: segments,
            bounds: this.route.getBounds(),
            instructions: properties.segments[0].steps
        };
    }

    // Calculate elevation profile
    async getElevationProfile(coordinates) {
        try {
            const response = await fetch(
                `${this.baseUrl}/elevation/line`, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        coordinates: coordinates,
                        format_in: 'polyline',
                        format_out: 'polyline'
                    })
                }
            );

            const data = await response.json();
            return data.elevation;
        } catch (error) {
            console.error('Elevation calculation failed:', error);
            return null;
        }
    }

    // Add elevation profile visualization
    displayElevationProfile(elevationData) {
        // Create elevation profile using D3.js
        const margin = {top: 20, right: 20, bottom: 30, left: 50};
        const width = 600 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = d3.select('#elevation-profile')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const x = d3.scaleLinear()
            .domain([0, elevationData.length - 1])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(elevationData), d3.max(elevationData)])
            .range([height, 0]);

        // Create line generator
        const line = d3.line()
            .x((d, i) => x(i))
            .y(d => y(d));

        // Add path
        svg.append('path')
            .datum(elevationData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    }
}
