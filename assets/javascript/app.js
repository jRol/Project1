var latitude,longitude;

$(document).ready(function() {

    geoLoc();
});

function geoLoc() {
  
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCurrentLocation);
       
    } else {
        console.log ("geolocation not available");
    }
}

function getCurrentLocation (position) {
 
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log ("lon is "+longitude+" and lat is "+latitude);
    
    // call all other functions from here for the first time e.g.
    //renderMaps() for now.
}
