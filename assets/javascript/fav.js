
$(document).ready(function() {
        
    var config = {
        apiKey: "AIzaSyC9pE2ORuZUcAnZM_4fnUDSScgurVLBbN8",
        authDomain: "gwbootcamp-97ba0.firebaseapp.com",
        databaseURL: "https://gwbootcamp-97ba0.firebaseio.com",
        projectId: "gwbootcamp-97ba0",
        storageBucket: "gwbootcamp-97ba0.appspot.com",
        messagingSenderId: "454079581913"
      };
    firebase.initializeApp(config);

    var database = firebase.database();

    database.ref('/meetupFavs').on("child_added", function(snapshot) {
        var sv = snapshot.val();

        
        console.log(sv.favMeetup.name);
        //dont change this
        var listings = $('.container');
        

       

        
        var details = $("<div>");
        details.html(sv.favMeetup.name);

        listings.append(details);

    });
    
});

