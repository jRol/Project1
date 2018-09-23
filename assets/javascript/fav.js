
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
    var email;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log("user signed in");
          console.log(user.displayName);
          email=user.email;
          console.log(email);
          database.ref('/meetupFavs').orderByChild('email').equalTo(email).on("child_added", function(snapshot) {
            var sv = snapshot.val();
            console.log(sv);
            
            console.log(sv.favMeetup.name);
            //dont change this
            var listings = $('#container');
            
    
            var favButton = $("<p class='mx-1 my-1 star' data-toggle='modal' data-target='#myModal' >");
            favButton.html('<i class="fas fa-trash-alt float-left"></i>');
           
            listings.append(favButton);
    
            //you can display what ever else you want
            var details = $("<h5 class='ml-1 my-0'>");
            details.html(sv.favMeetup.name);
            listings.append(details);
            
            var address = $("<p>");
            address.html(sv.favMeetup.address);
              listings.append(address);
            
          //   var details = $("<div>");
          //   details.html("<p>"+sv.favMeetup.name+"</p>");
    
           
    
        });
        } else {
          console.log("boo hoo. no user");
        }
    });
    
    
    
});