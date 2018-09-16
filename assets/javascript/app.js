var latitude,longitude;

// TESTING PURPOSES: Counter variables tracking number of events with a venue property and those with only a group property
/* var venueCount = 0;
var groupCount = 0; */

var events = {

    "type": "FeatureCollection",
    "features": []
}

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

function displayMeetupAPI() {

    var proxyURL = "https://cors-anywhere.herokuapp.com/";
    var queryURL = proxyURL + "https://api.meetup.com/find/upcoming_events?key=3f604954571041164226827581f6062&radius=30.0&lat=" + latitude + "&lon=" + longitude;

    // Creating an AJAX call for Meetup API
    $.ajax({
    url: queryURL,
    method: "GET"
    }).then(function(response) {

        // Logging original response object that is coming over from Meetup API
        console.log(response);

        for (var i = 0; i < response.events.length; i++) {

            var event = {

                "type": "Feature",
                "geometry": {
    
                    "type": "Point",
                    "coordinates": []
                },
                "properties": {
    
                    "name": "",
                    "link": "",
                    "visibility": "",
                    "address": ""
                }
            }

            if (response.events[i].hasOwnProperty("venue")) {

                // TESTING PURPOSES: Counter var tracking number of events with a venue property
                /* venueCount++; */

                event.geometry.coordinates.push(response.events[i].venue.lat);
                event.geometry.coordinates.push(response.events[i].venue.lon);
                event.properties.name = response.events[i].name;
                event.properties.link = response.events[i].link;
                event.properties.visibility = response.events[i].visibility;
                event.properties.address = response.events[i].venue.address_1 + ", " + response.events[i].venue.city + ", " + response.events[i].venue.state;

                events.features.push(event);
            }
            else {

                // TESTING PURPOSES: Counter var tracking number of events with only a group property
                /* groupCount++; */

                event.geometry.coordinates.push(response.events[i].group.lat);
                event.geometry.coordinates.push(response.events[i].group.lon);
                event.properties.name = response.events[i].name;
                event.properties.link = response.events[i].link;
                event.properties.visibility = response.events[i].visibility;
                event.properties.address = response.events[i].group.localized_location;

                events.features.push(event);
            }
        }

        // TESTING PURPOSES: Logging counter variables for events with a venue property and those with only a group property
        /* console.log(venueCount);
        console.log(groupCount); */

        // Logging final events object, so that you can compare to original logging of response object
        console.log(events);
    });
}

// Button added for testing purposes, so that you can run the AJAX call to Meetup API
$(document).on("click", "#get-res", displayMeetupAPI);