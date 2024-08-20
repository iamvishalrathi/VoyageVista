mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    // You can add layers to the predetermined slots within the Standard style basemap.
    style: 'mapbox://styles/mapbox/standard',
    center: listing.geometry.coordinates, // starting position [lng,lat]
    zoom: 9,
    maxZoom: 20
});

map.on('style.load', () => {
    map.addSource('urban-areas', {
        'type': 'geojson',
        'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/ne_50m_urban_areas.geojson'
    });

    map.addLayer({
        'id': 'urban-areas-fill',
        'type': 'fill',
        // This property allows you to identify which `slot` in
        // the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
        'slot': 'middle',
        'source': 'urban-areas',
        'layout': {},
        'paint': {
            'fill-color': '#f08',
            'fill-opacity': 0.4
        }
    });
});

const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
    .addTo(map);