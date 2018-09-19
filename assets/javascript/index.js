var latitude, longitude;

$(document).ready(function() {
    
    sessionStorage.clear();
    geoLoc();
       

    $("#confirm").on("click", function(){
        
        if(longitude && latitude) {
            // Store all content into sessionStorage
            sessionStorage.setItem("longitude", longitude);
            sessionStorage.setItem("latitude", latitude);
            window.location.href = "main.html";
        }
        
    });
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
    
    var APIKey = "9cf07e60efb34da49a4496096daf288b";
    var queryURL="https://api.openweathermap.org/data/2.5/weather?lat="+latitude + "&lon=" + longitude + "&APPID=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
             
        $("#currLoc").text(response.name);
    
            
    });    
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWlzaHRpYXEiLCJhIjoiY2psdnBtY2VvMDUyMTNxcXN0ZGJwcjd2YiJ9.jiV57t9pdOYOb8iJc_xABg';
    
    var mapL = new mapboxgl.Map({
        container: 'mapLanding', // container id
        style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
        center: [longitude, latitude], // starting position [lng, lat]
        zoom: 8 // starting zoom
    }); 
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });
    $('#geocoderLanding').append(geocoder.onAdd(mapL));
    geocoder.on('result', function(ev) {
       
        
        //once the location changes run displayMeetupAPI to get new data 
        longitude=ev.result.geometry.coordinates[0];
        latitude=ev.result.geometry.coordinates[1];
        
    });
    
}
