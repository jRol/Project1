
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
              var listings = $('.container');
              
      
             
      
              
              var details = $("<div>");
              details.html("<p>"+sv.favMeetup.name+"</p>");
      
              listings.append(details);
      
          });
          } else {
            console.log("boo hoo. no user");
          }
      });
      
      
      
  });