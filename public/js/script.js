const socket = io(); //a connection req goes to the backends


if(navigator.geolocation){
    navigator.geolocation.watchPosition((pos)=>{
        const {latitude, longitude}= pos.coords;
        socket.emit("send-location", {latitude, longitude})
    }, 
        (err)=>{
        console.log(err);
    },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0, //not to use cached data
      } 

    );
}

const map = L.map("map").setView([0,0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const markers = {};

socket.on('receive-location', (data)=>{
    const {id, latitude, longitude} = data;
    // map.setView([latitude, longitude]);

    if(markers[id]){
        markers[id].setLatLng([latitude, longitude])
    }else{
        markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup(`User: ${id}`).openPopup();
    }
});


socket.on('user-disconnected',(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})
