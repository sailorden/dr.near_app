angular.module('DrNEAR.controllers', ['ngCordova','DrNEAR.services'])
    .controller( 'AppCtrl', function(
        $scope, $state, $ionicSlideBoxDelegate, $location,
        ionicMaterialMotion, ionicMaterialInk, Session, USER_ROLES
    ){
        this.session = Session;
    })

    .controller( 'ActivityCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk, Session
    ) {
        this.items = [];
        var context = this;

        var Activity = Parse.Object.extend( 'Activity' );
        var query = new Parse.Query( Activity );
        query.limit( 10 );
        query.descending( 'createdAt' );
        query.find().then(
            function( results ) {
                $timeout( function(){
                    context.items.splice(0);
                    for ( var i = 0; i < results.length; i++ ) {
                        context.items.push( results[i] );
                    }
                }, 10);
                $timeout( function(){
                    ionicMaterialMotion.fadeSlideIn({
                        selector: '.animate-fade-slide-in .item'
                    });
                    ionicMaterialInk.displayEffect();
                }, 20);
            },
            function( err ) {
                console.log( 'err', err );
            }
        );
    })

    .controller( 'ActivityPostCtrl', function(
        $scope, $state, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk, Session
    ) {
        var context = this;

        this.post = function( entry ) {
            var Activity = Parse.Object.extend( 'Activity' );
            var activity = new Activity();

            var acl = new Parse.ACL( Parse.User.current() );
            acl.setPublicReadAccess( true );
            activity.setACL( acl );

            activity.set( 'title',   entry.title );
            activity.set( 'content', entry.content );
            activity.save().then(function(){
                $timeout( function(){
                    $state.go( 'app.activity' );
                },100);
            });
        };
    })

    .controller( 'AlertCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ) {
        console.log( 'AlertCtrl' );

        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();

        // Set Ink
        ionicMaterialInk.displayEffect();
    })

    .controller( 'SettingCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ) {
        console.log( 'SettingCtrl' );
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();

        // Set Ink
        ionicMaterialInk.displayEffect();
    })

    .controller( 'SearchCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ){
        console.log( 'SearchCtrl' );
        // $scope.$parent.showHeader();
        // $scope.$parent.clearFabs();

        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();

        // Set Ink
        ionicMaterialInk.displayEffect();

        $scope.data = {};
        
        $scope.items = [
            { price: '$4.99', text: 'Pizza' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
            { price: '$2.99', text: 'Burger' },
            { price: '$3.99', text: 'Pasta' },
        ];
        $scope.clearSearch = function() {
            $scope.data.searchQuery = '';
        };
    })

    .controller( 'MessagesCtrl', function( $scope, $location ) {
        console.log( 'MessageCtrl' );
    })

    .controller('AmessageCtrl', function( $scope, $location, $stateParams ) {
        console.log( 'AmessageCtrl' );
    })

    .controller('ProfileCtrl', function(
        $scope, $stateParams, $timeout,
        ionicMaterialMotion, ionicMaterialInk
    ) {
        console.log( 'ProfileCtrl' );
        $timeout(function() {
            ionicMaterialMotion.slideUp({
                selector: '.slide-up'
            });
        }, 300);

        $timeout(function() {
            ionicMaterialMotion.fadeSlideInRight({
                startVelocity: 2000
            });
        }, 800);
        // Set Ink
        ionicMaterialInk.displayEffect();
    })

    .controller('ProfEditCtrl', function( $cordovaCamera ) {
        console.log( 'ProfEditCtrl' );
        var context = this;

        this.useCamera = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 100,
                targetHeight: 100,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
            $cordovaCamera.getPicture(options).then(function(imageData) {
                var image = document.getElementById('avatar');
                image.src = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                // error
            });
        };
    })

    .controller( 'SignupCtrl', function( $scope, $timeout, $location ) {
        console.log( 'SignupCtrl' );
        Parse.User.logOut();
        $scope.user = { name: '', password: '', email: '' };
        $scope.signup = function() {
            var user = new Parse.User();
            user.set( 'username', $scope.user.name );
            user.set( 'email', $scope.user.email );
            user.set( 'password', $scope.user.password );
            user.signUp(null, {
                success: function(user) {
                    $scope.$apply( function(){
                        $scope.username = '';
                        $scope.password = '';
                        $scope.email    = '';
                        $scope.error    = '';
                        console.log(user);
                        $location.path( '/main' );
                    });
                },
                error: function(user, error) {
                    // Show the error message somewhere and let the user try again.
                    $timeout( function(){
                        $scope.error = error.message;
                    }, 100);
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };
        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };
        // Open the login modal
        $scope.login = function() {
            $location.path('/login');
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
                        $location.path('/activity');

                    } else {
                        alert('Facebook login failed');
                    }
                },
                {scope: 'email,publish_actions'});
        }
        $scope.back = function () {
            $location.path('/');

        };
    })

    .controller( 'LoginCtrl', function( $scope, $state, $location, $rootScope, $timeout, Session, AUTH_EVENTS ) {
        Parse.User.logOut();
        Session.destroy();

        this.credentials = { username: '', password: ''};

        var context = this;
        this.login = function () {
            Parse.User.logIn( context.credentials.username, context.credentials.password )
                .then( function( user ) {
                    Session.create( user )
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }, function(err) {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });
        };

        $scope.fbLogin = function(credentials) {
            openFB.login(
                function(response, user) {
                    if (response.status === 'connected') {
                        console.log('Facebook login succeeded');
                        $scope.closeLogin();
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                        $scope.setCurrentUser(user);
                        $location.path('/main');
                    } else {
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        alert('Facebook login failed');
                    }
                },
                {scope: 'email,publish_actions'});
        };
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };
        $scope.signup = function () {
            $location.path('/signup');

        };
        $scope.back = function () {
            $location.path('/');
        };
    })

    .controller( 'IntroCtrl',function($scope, $state, $stateParams, $ionicSlideBoxDelegate, 
                                      $ionicModal, $timeout, $location){
        console.log( 'IntroCtrl' );
        $scope.$parent.clearFabs();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);

        $timeout(function() {
            ionicMaterialMotion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);
        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();
        // Activate ink for controller
        ionicMaterialInk.displayEffect();
        // Delay expansion
        $timeout(function() {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);
        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();
        // Set Ink
        ionicMaterialInk.displayEffect();
        // Called to navigate to the main app
        $scope.startApp = function() {
            $location.path('/signup');
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
        $scope.signup = function() {
            $location.path( '/signup' );
        };
        $scope.login = function() {
            $location.path( '/login' );
        };
    });
