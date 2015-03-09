angular.module('starter.controllers', ['Myapp.services'])

.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
  console.log("Hello");
  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('home');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
})
.controller('LoginCtrl', function( $scope, $location ) {
        $scope.user  = {};
        $scope.fbLogin = function() {
            var myExpDate = new Date();
            myExpDate.setMonth( myExpDate.getMonth( ) + 2 );
            myExpDate = myExpDate.toISOString();
            var facebookAuthData = {
            "id": result.id+"",
            "access_token": result["accessToken"],
            "expiration_date": result["expirationDate"].slice(0, -1).replace("+", ".")+"Z"
            }
        Parse.FacebookUtils.logIn(facebookAuthData, {

        success: function(_user) {
            console.log("User is logged into Parse");
        },

        error: function(error1, error2){
            console.log("Unable to create/login to as Facebook user");
            console.log("  ERROR1 = "+JSON.stringify(error1));
            console.log("  ERROR2 = "+JSON.stringify(error2));
        }
        });
        };
        $scope.logout = function() {
            $location.path( '/logout' );
        };
    })
.controller( 'MessagesCtrl', [ '$scope', '$location', 'LoginUser', function( $scope, $location, LoginUser ) {
        $scope.loginUser;
        $scope.messages  = [];
        LoginUser.then( function( user ) {
            $scope.loginUser = user;

            var MessageObject = Parse.Object.extend( 'Message2' );

            var queryFrom = new Parse.Query( MessageObject );
            queryFrom.equalTo( 'from', $scope.loginUser );
            var queryTo = new Parse.Query( MessageObject );
            queryTo.equalTo( 'to', $scope.loginUser );

            var query = Parse.Query.or( queryFrom, queryTo );
            query.limit( 50 );
            query.descending( 'createdAt' );
            query.include( 'from' ); // from を一緒に取り出す
            query.include( 'to' );   // to を一緒に取り出す
            query.find().then( function( results ) {
                $scope.$apply( function(){
                    var uniqueUsers = {};
                    for ( var i = 0; i < results.length; i++ ) {
                        var type = (results[i].get('from').id == $scope.loginUser.id) ? 'sent' : 'received';
                        var userMessageId = (type == 'sent') // 同じ相手との重複表示を避ける
                            ? results[i].get('from').id + ':' + results[i].get('to').id
                            : results[i].get('to').id + ':' + results[i].get('from').id;
                        if ( !uniqueUsers[userMessageId] || ( uniqueUsers[userMessageId] < results[i].createdAt ) ) {
                            uniqueUsers[userMessageId] = results[i].createdAt;
                            $scope.messages.push({
                                umid   : userMessageId,
                                object : angular.copy( results[i] ),
                                type   : type
                            });
                        }
                    }
                });
            });
        });
        $scope.detail = function( msg ) {
            var user = (msg.type == 'sent') ? msg.object.get('to') : msg.object.get('from');
            $location.path( '/amessage/' + user.id );
        };
    }])           
.controller('AmessageCtrl', [ '$scope', '$location', '$stateParams', 'LoginUser', function( $scope, $location, $stateParams, LoginUser ) {
        console.log("hello");
        $scope.loginUser;
        $scope.messages = [];

        LoginUser.then( function( user ) {
            $scope.loginUser  = user;

            var MessageObject = Parse.Object.extend( 'Message2' );
            var UserObject = Parse.Object.extend( 'User2' );

            var targetUser = new UserObject();
            targetUser.id = $stateParams.uid; // 特定のユーザーとのやりとりを検索

            var queryFrom = new Parse.Query( MessageObject );
            queryFrom.equalTo( 'from', $scope.loginUser );    // 自分から
            queryFrom.equalTo( 'to', targetUser );            // 特定ユーザー

            var queryTo = new Parse.Query( MessageObject );
            queryTo.equalTo( 'from', targetUser );            // 特定ユーザーから
            queryTo.equalTo( 'to', $scope.loginUser );

            console.log(targetUser)        // 自分

            var query = Parse.Query.or( queryFrom, queryTo ); // のいずれか
            query.limit( 50 );
            query.descending( 'createdAt' );
            query.include( 'from' );
            query.include( 'to' );
            query.find().then( function( results ) {
                $scope.$apply( function(){
                    for ( var i = 0; i < results.length; i++ ) {
                        var type = (results[i].get('from').id == $scope.loginUser.id) ? 'sent' : 'received';
                        $scope.messages.push({
                            object : angular.copy( results[i] ),
                            type   : type,
                            user   : user
                        });
                        if ( !$scope.targetUser ) {
                            $scope.targetUser = (type == 'sent') ? results[i].get('to') : results[i].get('from');
                        }
                    }
                });
            });
        });

        $scope.back = function() {
            $location.path( '/' );
        };
    }])
.controller( 'DiseaseCtrl', ['$scope',
        function($scope){
            $scope.diseases = [
            { 
              name : "Distal Myopathy", 
              medicine : "MIDAZOLAM,",
              photo : "Userphoto", },
            ];
        } ] )
.controller( 'MedicineCtrl', ['$scope',
        function($scope){
            $scope.medicines = [
            { 
              company : "Novartis Pharma", 
              medicine : "Glivec", },
            ];
}])
.controller('ProfileCtrl', function($scope) {
    openFB.api({
        path: '/me',
        params: {fields: 'id,name'},
        success: function(user) {
            $scope.$apply(function() {
                $scope.user = user;
            });
        },
        error: function(error) {
            alert('Facebook error: ' + error.error_description);
        }
    });
})
.controller( 'MainCtrl',function($scope, $ionicModal, $timeout){
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  $scope.fbLogin = function() {
    openFB.login(
        function(response) {
            if (response.status === 'connected') {
                console.log('Facebook login succeeded');
                $scope.closeLogin();
            } else {
                alert('Facebook login failed');
            }
        },
        {scope: 'email,publish_actions'});
  }
    $scope.users = [
    { 
      name : "Nakagawa Shintaro", 
      position : "patient",
      diseases : "Hand-Schuller-Christain", 
      medicine :"Grivec"},
    ];
    $scope.timelines = [
    { 
      title: "medicine", 
      comment:"I'm not much better,and there is a little hope of recovery",
      userphoto :"user photo"}
    ];
    $scope.diseases = [ 
    { name: 'Distal Myopathy', 
      medicines: [ 
        { name: 'medicine1', 
          users: [ 
          { name: 'userA' }, 
          { name: 'userB' }, 
          { name: 'userC'} 
          ] 
        },
        { name: 'medicine2', 
          users: [ 
          { name: 'userD' }, 
          { name: 'userE' } 
          ] 
        },
        { name: 'medicine3', 
          users: [ { name: 'userF' } 
          ] 
        },
        { name: 'medicine4',
          users: [ { name: 'userG' } 
          ] 
        },
        { name: 'medicine5', 
          users: [ { name: 'userH' } 
          ] 
        } 
      ] 
    },

    { name: 'Hand-Schuller-Christain disease', 
      medicines: [ 
      { name: 'medicine6', 
          users: [ { name: 'userI' } ] 
        }]  
    },
    { name: 'muscular dystrophy',
      medicines:[ 
      { name: 'medicine7', 
       users: [ { name: 'userJ' }]
      },
      { name: 'medicine8', 
       users: [ { name: 'userK' }] 
       },
      { name: 'medicine9', 
        users: [ { name: 'userL' }]
      }]},
    ]}
  )