angular.module('DrNEAR.services',['ngResource'])
    .constant( 'User', Parse.User )
    .constant( 'Activity', Parse.Object.extend("Activity") )
    .constant( 'Message', Parse.Object.extend("Message") )
    .constant( 'Disease', Parse.Object.extend("Disease") )
    .constant( 'FollowingUser', Parse.Object.extend("FollowingUser") )
    .constant( 'FollowingDisease', Parse.Object.extend("FollowingDisease") )
    .constant( 'FollowingActivity', Parse.Object.extend("FollowingActivity") )

    .factory( 'UserFactory', function( $timeout, FollowingUser, FollowingDisease, FollowingActivity ) {
        var UserObject = function( obj, opts ){
            if ( typeof(opts) !== 'object' ){
                opts = {};
            }

            var context = this;
            context.object          = obj;
            context.followings      = [];
            context.followers       = [];
            context.diseases        = [];
            context.blocked         = [];
            context.muted           = [];
            context.likeActivities  = [];

            context.load();
        };

        UserObject.prototype.fetchDiseases = function(opts){
            var followingDiseaseQuery = new Parse.Query(FollowingDisease);
            followingDiseaseQuery.equalTo("from", this.object);
            followingDiseaseQuery.include("to");
            return followingDiseaseQuery.find(opts);
        };

        UserObject.prototype.fetchFollowings = function(opts){
            var followingUserQuery = new Parse.Query(FollowingUser);
            followingUserQuery.equalTo("from", this.object);
            followingUserQuery.include("to");
            return followingUserQuery.find(opts);
        };

        UserObject.prototype.fetchFollowers = function(opts){
            var followerUserQuery = new Parse.Query(FollowingUser);
            followerUserQuery.equalTo("to",this.object);
            followerUserQuery.include("from");
            return followerUserQuery.find(opts);
        };

        UserObject.prototype.fetchLikeActivities = function(opts){
            var followingActivityQuery = new Parse.Query(FollowingActivity);
            followingActivityQuery.equalTo("from",this.object);
            followingActivityQuery.include("to");
            return followingActivityQuery.find(opts);
        };

        UserObject.prototype.save = function(){
            this.object.set( "username", this.username );
            this.object.set( "name", this.name );
            this.object.set( "bio", this.bio );
            this.object.set( "email", this.email );
            return this.object.save();
        };

        UserObject.prototype.load = function(){
            console.log('Session.load');
            this.username      = this.object.get('username');
            this.name          = this.object.get('name') || this.object.get('username');
            this.iconurl       = this.object.get('icon') ? this.object.get('icon').url() : 'img/material1.jpg';
            this.bio           = this.object.get('bio');
            this.email         = this.object.get('email');
            this.emailVerified = this.object.get('emailVerified');
            this.role          = this.object.get('role');

            var context = this;
            context.fetchDiseases().then( function(diseases){
                context.fetchFollowings().then(function(followings){
                    context.fetchFollowers().then(function(followers){
                        context.fetchLikeActivities().then(function(likeActivities){
                            $timeout(function(){
                                context.diseases        = diseases;
                                context.followings      = followings;
                                context.followers       = followers;
                                context.likeActivities  = likeActivities;
                            });
                        });
                    });
                });
            });
        };

        UserObject.prototype.isFollowing = function( target ) {
            if ( target.className == 'Disease' ) {
                return 0 < this.diseases.filter( function( item ){
                    return item.get('to').id == target.id;
                }).length;
            }
            else if ( target.className == 'User' ) {
                return 0 < this.followings.filter( function( item ){
                    return item.get('to').id == target.id;
                }).length;
            }
            else if ( target.className == 'Activity' ) {
                return 0 < this.likeActivities.filter( function( item ){
                    return item.get('to').id == target.id;
                }).length;
            }
            return false;
        };

        UserObject.prototype.toggleFollowing = function( target ) {
            var context = this;
            if ( this.isFollowing( target ) ) {
                console.log( 'unfollow' );
                var q = new Parse.Query(
                    target.className == 'Disease' ? FollowingDisease : (target.className == 'User' ? FollowingUser :FollowingActivity)
                );
                q.equalTo( 'from', this.object );
                q.equalTo( 'to', target );
                return q.find().then(function(results){
                    for ( var i = 0; i < results.length; i++ ){
                        results[i].destroy();
                    }
                });
            }
            else {
                console.log( 'follow' );
                var d = target.className == 'Disease' ? new FollowingDisease() 
                                                      : (target.className == 'User' ? new FollowingUser() : new FollowingActivity());
                d.set( 'from', this.object );
                d.set( 'to', target );
                return d.save();
            }
        }

        UserObject.prototype.fetchFollowing = function ( target ){
            var context = this;
            if ( target.className == 'Activity') {
                context.fetchLikeActivities().then( function(likeActivities){
                   $timeout(function(){
                       context.likeActivities = likeActivities;
                   })
                })
            }
        };
        return {
        create : function( user, opts ) {
            return new UserObject( user, opts );
            }
        };
    })
 
    .service( 'Session', function( UserFactory, $timeout ){
        var service = {
            user            : undefined,
            isAuthenticated : false
         };

        service.update = function() {
            var currentUser = Parse.User.current();
            if ( currentUser ) {
                service.user = UserFactory.create( currentUser );
                service.isAuthenticated = true;
            }
        };

        service.destroy = function() {
            if ( service.user ) {
                Parse.User.logOut();
                service.user = undefined;
                service.isAuthenticated = false;
            }
        };

        service.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            // return service.enable && (authorizedRoles.indexOf(Session.role) !== -1);
            return service.isAuthenticated;
        };

        // service.update();
        return service;
    })

    .constant('AUTH_EVENTS', {
        loginSuccess     : 'auth-login-success',
        loginFailed      : 'auth-login-failed',
        logoutSuccess    : 'auth-logout-success',
        sessionTimeout   : 'auth-session-timeout',
        notAuthenticated : 'auth-not-authenticated',
        notAuthorized    : 'auth-not-authorized'
    })

    .constant('USER_ROLES', {
        all    : '*',
        admin  : 'admin',
        editor : 'editor',
        guest  : 'guest'
    })

    .directive('formAutofillFix', function ($timeout) {
        console.log( 'formAutofillFix' );
        return function (scope, element, attrs) {
            element.prop('method', 'post');
            if (attrs.ngSubmit) {
                $timeout(function () {
                    element
                        .unbind('submit')
                        .bind('submit', function (event) {
                            event.preventDefault();
                            element
                                .find('input, textarea, select')
                                .trigger('input')
                                .trigger('change')
                                .trigger('keydown');
                            scope.$apply(attrs.ngSubmit);
                        });
                });
            }
        };
    })
    .service('Profile', function(Activity, $timeout) {
        var service = {
            user            : undefined,
            activities      : []
        };

        service.update = function(user) {
            service.activities = [];
            service.user = user;

            var query = new Parse.Query( Activity );
            query.limit( 10 );
            query.descending( 'createdAt' );
            query.equalTo( 'user', user );
            query.include( 'user' );
            query.find().then(
                function( results ) {
                    $timeout( function(){
                        service.activities.splice(0);
                        for ( var i = 0; i < results.length; i++ ) {
                            service.activities.push( results[i] );
                        }
                    });
                },
                function( err ) {
                    console.log( 'err', err );
                }
            );
        };

        return service;

    })

    .directive("match", ["$parse", function($parse) {
       return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          scope.$watch(function() {
            var target = $parse(attrs.match)(scope);  // 比較対象となるモデルの値
            return !ctrl.$modelValue || target.$modelValue === ctrl.$modelValue;
          }, function(currentValue) {
            ctrl.$setValidity('mismatch', currentValue);
          });
        }
      }
    }
    ]);
