const socket = io(); // A connection request goes to the backend

function getDeviceInfo() {
    if (typeof platform !== 'undefined') {
        const platformInfo = platform.parse(navigator.userAgent);
        let deviceInfo = platformInfo.name; 

        if (platformInfo.os) {
            deviceInfo += ` on ${platformInfo.os.family}`;
        }

        return deviceInfo;
    } else {
        return `Device: ${navigator.userAgent.split(' ')[0]}`; 
    }
}

const deviceInfo = getDeviceInfo();
console.log("Device Info: ", deviceInfo);

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            socket.emit("send-location", { deviceInfo, latitude, longitude });
        },
        (err) => {
            console.log(err);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0, // Not to use cached data
        }
    );
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, deviceInfo, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        markers[id].getPopup().setContent(`Device: ${deviceInfo}`);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup(`Device: ${deviceInfo}`).openPopup();
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
