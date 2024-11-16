// js/config.js
const CONFIG = {
    transportModes: {
        car: { name: 'Car', carbonPerMile: 404 },
        electricCar: { name: 'Electric Car', carbonPerMile: 100 },
        motorcycle: { name: 'Motorcycle', carbonPerMile: 280 },
        scooter: { name: 'Scooter', carbonPerMile: 50 },
        walking: { name: 'Walking', carbonPerMile: 0 },
        bicycle: { name: 'Bicycle', carbonPerMile: 0 }
    },
    apis: {
        weather: 'YOUR_WEATHER_API_KEY',
        airQuality: 'YOUR_AIRNOW_API_KEY',
        routing: '5b3ce3597851110001cf62483ee3405e20b844b4b5e0390a3f701f55'
    }
};
