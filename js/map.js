// js/map.js
class MapManager {
    constructor() {
        this.map = L.map('map').setView([51.505, -0.09], 13);
        this.initializeMap();
        this.route = null;
    }

    initializeMap() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    async calculateRoute(start, end, mode) {
        // Implementation for route calculation using OpenRouteService
        // This is a placeholder for the actual implementation
        try {
            const response = await fetch(`https://api.openrouteservice.org/v2/directions/${mode}...`);
            const data = await response.json();
            this.displayRoute(data);
            return data;
        } catch (error) {
            console.error('Route calculation failed:', error);
        }
    }

    displayRoute(routeData) {
        if (this.route) {
            this.map.removeLayer(this.route);
        }
        this.route = L.geoJSON(routeData).addTo(this.map);
        this.map.fitBounds(this.route.getBounds());
    }
}
