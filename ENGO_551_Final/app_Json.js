//Javascript to update positions of assets using live Json data file  
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwcGVyMTA1IiwiYSI6ImNsc3p1ZzJrZzByczkycG1jcjNxdGtzZ3oifQ.G3wkyPSEdYzXGhj0ib1PKA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    projection: 'globe',
    zoom: 1.5,
    center: [-90, 40]
});

map.on('style.load', () => {
    map.setFog({});
});
const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
        const zoom = map.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
                const zoomDif =
                    (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                distancePerSecond *= zoomDif;
            }
            const center = map.getCenter();
            center.lng -= distancePerSecond;
            map.easeTo({ center, duration: 1000, easing: (n) => n });
        }
    }

    map.on('mousedown', () => {
        userInteracting = true;
    });

    map.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
    });

    map.on('dragend', () => {
        userInteracting = false;
        spinGlobe();
    });
    map.on('pitchend', () => {
        userInteracting = false;
        spinGlobe();
    });
    map.on('rotateend', () => {
        userInteracting = false;
        spinGlobe();
    });

    map.on('moveend', () => {
        spinGlobe();
    });

let assets = [
    { id: 'asset1', type: 'responder1', coordinates: [-114.05, 51.05] },
    { id: 'asset2', type: 'responder2', coordinates: [-114.06, 51.03] },
    { id: 'asset3', type: 'responder3', coordinates: [-114.07, 51.06] },
    { id: 'asset4', type: 'responder4', coordinates: [-114.08, 51.07] }
];

const reportedIncidents = [];

// Function to update asset positions from JSON file
function updateAssetPositions() {
    fetch('live_assets.json')
        .then(response => response.json())
        .then(data => {
            assets = data;
            assets.forEach(asset => {
                map.getSource(asset.id).setData({
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: asset.coordinates
                        }
                    }]
                });
            });
        })
        .catch(error => {
            console.error('Error fetching live asset data:', error);
        });
}

// Wait for the map style to be fully loaded
map.on('style.load', function () {
    // Load a custom marker image
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        function (error, image) {
            if (error) throw error;
            // Add the loaded image as a custom icon
            map.addImage('custom-marker', image);
            
            // Add assets to the map
            assets.forEach(asset => {
                map.addLayer({
                    id: asset.id,
                    type: 'symbol',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: asset.coordinates
                                },
                                properties: {}
                            }]
                        }
                    },
                    layout: {
                        'icon-image': 'custom-marker', // Use the custom icon
                        'icon-size': 0.5
                    }
                });
            });

            // Call function to update asset positions every 5 seconds
            setInterval(updateAssetPositions, 5000);
        }
    );

    // Event listener for clicking on the map to report an incident
    map.on('click', async function (e) {
        const coordinates = e.lngLat.toArray();
        const incidentId = `incident-${Date.now()}`;
        
        // Add the reported incident to the map as a marker
        map.addLayer({
            id: incidentId,
            type: 'symbol',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        properties: {}
                    }]
                }
            },
            layout: {
                'icon-image': 'custom-marker', // Use the custom icon
                'icon-size': 0.5
            }
        });

        // Add the reported incident to the list of reported incidents
        reportedIncidents.push({ id: incidentId, coordinates: coordinates });

        // Draw a circle around the closest asset to the reported incident
        const closestAsset = findClosestAsset(coordinates);
        if (closestAsset) {
            map.addLayer({
                id: `circle-${incidentId}`,
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: closestAsset.coordinates
                        }
                    }
                },
                paint: {
                    'circle-radius': 25,
                    'circle-color': '#ff0000',
                    'circle-opacity': 0.3
                }
            });

            // Calculate realistic response time (driving time) to the incident
            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${closestAsset.coordinates[0]},${closestAsset.coordinates[1]};${coordinates[0]},${coordinates[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`);
            const data = await response.json();
            const drivingTime = Math.round(data.routes[0].duration / 60); // Convert seconds to minutes
            const incidentMessage = `Incident at ${coordinates[1]}, ${coordinates[0]}. Responder: ${closestAsset.type}. Estimated Response Time: ${drivingTime} minutes.`;
            alert(incidentMessage);
        }
    });

    // Event listener for clicking on a marker to remove it
    map.on('click', function (e) {
        const features = map.queryRenderedFeatures(e.point, { layers: assets.map(asset => asset.id).concat(reportedIncidents.map(incident => incident.id)) });
        if (features.length > 0) {
            const featureId = features[0].layer.id;
            const index = reportedIncidents.findIndex(incident => incident.id === featureId);
            if (index !== -1) {
                // Remove the incident from the map
                map.removeLayer(featureId);
                map.removeSource(featureId);
                // Remove the incident from the list of reported incidents
                reportedIncidents.splice(index, 1);
                // Remove the circle around the closest asset
                const circleId = `circle-${featureId}`;
                if (map.getLayer(circleId)) {
                    map.removeLayer(circleId);
                    map.removeSource(circleId);
                }
            }
        }
    });
});

function findClosestAsset(incidentCoordinates) {
    let closestAsset = null;
    let minDistance = Number.MAX_VALUE;
    assets.forEach(asset => {
        const distance = calculateDistance(asset.coordinates, incidentCoordinates);
        if (distance < minDistance) {
            minDistance = distance;
            closestAsset = asset;
        }
    });
    return closestAsset;
}

function calculateDistance(coord1, coord2) {
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
}
