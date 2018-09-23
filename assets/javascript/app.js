var latitude, longitude;
var category, startDate="T00:00:00", endDate="T23:59:59";

// TESTING PURPOSES: Counter variables tracking number of events with a venue property and those with only a group property
/* var venueCount = 0;
var groupCount = 0; */

var events = {};
var map;
var mapInitiated=false;
var email;


$(document).ready(function() {
    longitude=sessionStorage.getItem("longitude");
    latitude=sessionStorage.getItem("latitude");
    getCategories();
    getWeather();

    var config = {
        apiKey: "AIzaSyC9pE2ORuZUcAnZM_4fnUDSScgurVLBbN8",
        authDomain: "gwbootcamp-97ba0.firebaseapp.com",
        databaseURL: "https://gwbootcamp-97ba0.firebaseio.com",
        projectId: "gwbootcamp-97ba0",
        storageBucket: "gwbootcamp-97ba0.appspot.com",
        messagingSenderId: "454079581913"
        };

    firebase.initializeApp(config);
        
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log("user signed in");
          console.log(user.displayName);
          email=user.email;
        } else {
          console.log("boo hoo. no user");
        }
    });
    console.log(mapInitiated);
    displayMeetupAPI();
    
});

$(document).on("click",'.star',function(){
    var favMeetup = events.features[$(this).attr("data-position")];
    console.log("star clicked");
    console.log($(this).attr("data-position"));

    console.log(favMeetup.properties);
    
    var database = firebase.database();
    sessionStorage.setItem("email", email);
    database.ref('/meetupFavs').push({
        email: email,
        favMeetup: favMeetup.properties
    });
    
    $("#myModal").modal();

    setTimeout(function(){
        $('#myModal').modal('hide')
      }, 3000);
    
    
     
});

function displayMeetupAPI() {

    

    console.log("in "+ latitude);
        console.log(longitude);
    var proxyURL = "https://cors-anywhere.herokuapp.com/";
    //var proxyURL="https://secret-ocean-49799.herokuapp.com/";

    var queryURL = proxyURL + "https://api.meetup.com/find/upcoming_events?key=3f604954571041164226827581f6062&radius=30.0&lat=" + latitude + "&lon=" + longitude;

    if (mapInitiated) {
        if (startDate === "T00:00:00" || endDate === "T23:59:59") {

            queryURL = queryURL + "&topic_category=" + category;
        }
        else {

            queryURL = queryURL + "&topic_category=" + category + "&start_date_range=" + startDate + "&end_date_range=" + endDate;
        }
    }

    console.log(queryURL);

    // Creating an AJAX call for Meetup API
    $.ajax({
    url: queryURL,
    method: "GET"
    }).then(function(response) {

        events = {

            "type": "FeatureCollection",
            "features": []
        };
        
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

            if (response.events[i].hasOwnProperty("venue") && response.events[i].venue.lon != 0) {

                event.geometry.coordinates.push(response.events[i].venue.lon);
                event.geometry.coordinates.push(response.events[i].venue.lat);
                event.properties.name = response.events[i].name;
                event.properties.link = response.events[i].link;
                event.properties.visibility = response.events[i].visibility;
                event.properties.address = response.events[i].venue.address_1 + ", " + response.events[i].venue.city + ", " + response.events[i].venue.state;

                events.features.push(event);
            }
            else { 
                event.geometry.coordinates.push(response.events[i].group.lon);
                event.geometry.coordinates.push(response.events[i].group.lat);
                event.properties.name = response.events[i].name;
                event.properties.link = response.events[i].link;
                event.properties.visibility = response.events[i].visibility;
                event.properties.address = response.events[i].group.localized_location;

                events.features.push(event);
            }

        }
        if (mapInitiated)
            updateMap();
        else   
            renderMap();
    });
}



var renderMap = function () {
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWlzaHRpYXEiLCJhIjoiY2psdnBtY2VvMDUyMTNxcXN0ZGJwcjd2YiJ9.jiV57t9pdOYOb8iJc_xABg';
    map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [longitude, latitude], // starting position [lng, lat]
        zoom: 8 // starting zoom
    });
    
    //create the geocoder
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });
    
    
    map.addControl(geocoder);
    geocoder.on('result', function(ev) {
        events = {};
        
        //once the location changes run displayMeetupAPI to get new data 
        longitude=ev.result.geometry.coordinates[0];
        latitude=ev.result.geometry.coordinates[1];

        console.log(latitude);
        console.log(longitude);

        displayMeetupAPI();
    });

    
    
    map.on('load', function (e) {
        map.addSource("places", {
            "type": "geojson",
            "data": events
        });

        // Initialize the list
        displayMarkers(events);
        buildLocationList(events);
        mapInitiated=true;
    
    });


}

function updateMap(){
    console.log("in update map");
    console.log(events);

    clearMap();
    getWeather();
    map.getSource('places').setData(events);
    
    //create the Markters
    displayMarkers(events);

    //Populate the meetup table
    buildLocationList(events);
    
}

function clearMap() {
    $('.marker').remove();
    $('#listings').empty();
}

function displayMarkers(events) {

    
    events.features.forEach(function(marker, i) {
       
        var el = document.createElement('div');
        el.innerHTML="<i class='fas fa-map-marker-alt fa-2x'>";
        el.setAttribute("class","marker");
        
                
        new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);
    
        el.addEventListener('click', function(e){
            // 1. Fly to the point
            flyToEvent(marker);
    
            // 2. Close all other popups and display popup for clicked store
            createPopUp(marker);
    
            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');
    
            e.stopPropagation();
            if (activeItem[0]) {
               activeItem[0].classList.remove('active');
            }
    
            var listing = document.getElementById('listing-' + i);
            listing.classList.add('active');
    
        });
    });
}
function flyToEvent(currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 12
    });
}

function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();


    var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h5>'+currentFeature.properties.name+'</h5>' +
            '<p>' + currentFeature.properties.address + '</p>')
        .addTo(map);
}

function buildLocationList(data) {
    for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];

        //this is where all the properties are
        var prop = currentFeature.properties;

       

        var listing = $("<div class='mb-4' >");
        listing.addClass('item');
        listing.attr("id","listing-" + i);

         //dont change this
         var listings = $('#listings');
         
        
        var favButton = $("<p class='mx-1 my-1 star' data-toggle='modal' data-target='#myModal' >");
        favButton.html('<i class="fas fa-star float-left"></i>');
        favButton.attr("data-position",i);
        listing.append(favButton);

        //you can display what ever else you want
        var details = $("<h5 class='ml-1 my-0 '>");
        details.html(prop.name);

        listing.append(details);


       


        //this is converting the address to a link. you can change it to what you want
        // dont change the rest of the code
        var link = $('<a id="star-icon" class="ml-2">');
        link.attr("href", '#');
        link.addClass("link");
        link.attr("data-position", i);
        link.html(prop.address);
        listing.append(link);

        listings.append(listing);
        
        //dont change this
        $(document).on('click','.link' ,function(e){
            // Update the currentFeature to the store associated with the clicked link
            var clickedListing = data.features[$(this).attr("data-position")];
            console.log("listing clicked");
            console.log($(this).attr("data-position"));
            // 1. Fly to the point
            flyToEvent(clickedListing);
        
            // 2. Close all other popups and display popup for clicked store
            createPopUp(clickedListing);
        
            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');
        
            if (activeItem[0]) {
            activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');
        
         });

        


        
    }
}

function getCategories() {

    var proxyURL = "https://cors-anywhere.herokuapp.com/";
    var queryURL = proxyURL + "https://api.meetup.com/find/topic_categories?key=3f604954571041164226827581f6062";

    // Creating an AJAX call for Meetup API
    $.ajax({
    url: queryURL,
    method: "GET"
    }).then(function(response) {

        console.log(category);
        // Logging original response object that is coming over from Meetup API
        console.log(response);

        for (var i = 0; i < response.length; i++) { 

            var newCategory = $("<option>");
            newCategory.attr("value", response[i].id);
            newCategory.text(response[i].name);
            $("#categories-drop").append(newCategory);
        }

        $("#confirm").on("click", function() {

            $("#start-date").removeClass("is-invalid");

            console.log(category);
            
            // Set category value to selected option in #categories-drop
            var categories = document.getElementById("categories-drop");
            var selectedValue = categories.options[categories.selectedIndex].value;
            category = selectedValue;

            // Set startDate and endDate values to input of #start-date and #end-date
            startDate = $("#start-date").val().trim() + "T00:00:00";
            endDate = $("#end-date").val().trim() + "T23:59:59";

            // if validateDateTime(startDate, endDate) is false display validation error message, else run displayMeetupAPI()
            if (!validateDateTime(startDate, endDate)) {

                $("#start-date").addClass("is-invalid");
            }
            else {

                displayMeetupAPI();  
            }
            
          /*   displayMeetupAPI(); */
           /*  if (selectedValue === "choose") {

                console.log("Please select a category type");
                category = selectedValue;
            }
            else {

                console.log(selectedValue);
                category = selectedValue;
            } */
            console.log(category);
        });
    });
}

function validateDateTime(start, end) {

    if (start === "T00:00:00" || end === "T23:59:59") {

        return true;
    }
    else {

        return new Date(end) > new Date(start);
    } 
}

function getWeather() {

    var APIKey = "9cf07e60efb34da49a4496096daf288b";
    var queryURL="https://api.openweathermap.org/data/2.5/weather?lat="+latitude + "&lon=" + longitude + "&APPID=" + APIKey+"&units=imperial";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
             
        console.log(response.main.temp+"F");
        $("#temp").html(parseInt(response.main.temp)+"<sup>o</sup>F");
        $("#location").html("<h1>"+response.name+"</h1>");

        var d = new Date();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $("#day").html(days[d.getDay()]);

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        $("#date").html(months[d.getMonth()] +" "+dd+", "+yyyy);
        
        var iconCode = response.weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
        $("#icon").html("<img src='" + iconUrl  + "' class='img-fluid w-25'>");
        $("#icon").prepend("<p>"+response.weather[0].main+"</p>");
 
            
    });  

   

}