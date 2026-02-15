import React from 'react';

interface MapComponentProps {
    query: string;
    waypoints?: string[];
    origin?: string;
    destination?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ query, waypoints, origin, destination }) => {
    // Construct the embed URL
    // Note: For a real production app with high usage, you would need an API Key.
    // For basic testing/demo, the simplified embed format often works without a key, 
    // or you use: https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=...
    // Here we use a direct search embed which is robust for demos.

    let src = '';

    if (origin && destination) {
        // Explicit route from origin to destination (High level view)
        const encOrigin = encodeURIComponent(origin);
        const encDest = encodeURIComponent(destination);
        // Remove z parameter to let Google Maps auto-zoom to fit the route
        src = `https://maps.google.com/maps?saddr=${encOrigin}&daddr=${encDest}&t=&ie=UTF8&iwloc=&output=embed`;
    } else if (waypoints && waypoints.length > 1) {
        // Route through waypoints
        const origin = encodeURIComponent(waypoints[0]);
        const dest = encodeURIComponent(waypoints[waypoints.length - 1]);
        // Remove z parameter to let Google Maps auto-zoom to fit the route
        src = `https://maps.google.com/maps?saddr=${origin}&daddr=${dest}&t=&ie=UTF8&iwloc=&output=embed`;
    } else {
        const encodedQuery = encodeURIComponent(query);
        // Keep z=13 for single location query as a reasonable default
        src = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }

    return (
        <div className="glass-panel" style={{
            height: '300px',
            padding: '0',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                id="gmap_canvas"
                src={src}
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                style={{ filter: 'invert(90%) hue-rotate(180deg)' }} // Dark mode hack for iframe map
            />
        </div>
    );
};

export default MapComponent;
