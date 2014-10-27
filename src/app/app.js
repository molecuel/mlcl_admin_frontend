angular.module( 'ngBoilerplate', [
  'mlcl_forms',
  'templates-app',
  'templates-common',
  'mlcl_admin.menu',
  'mlcl_admin.home',
  'mlcl_admin.elements',
  'mlcl_admin.about',
  'mlcl_admin.login',
  'mlcl_admin.loginservices',
  'mlcl_admin.configservice',
  'ui.router',
  'ngAnimate',
  'angular-growl'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.config(['growlProvider', function(growlProvider) {
    growlProvider.onlyUniqueMessages(false);
    growlProvider.globalTimeToLive(5000);
}])

.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $state, $rootScope, $scope, AuthenticationService, growl ) {
  $scope.auth = AuthenticationService;
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    // check the pageTitle
    if ( angular.isDefined(toState.data) && angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | MOLECUEL' ;
    }

    // check if the user is authenticated or the ressource is public
    if(!AuthenticationService.isAuthenticated && !toState.data.public) {
      $state.go('login');
    }
  });

  // if the logout completes
  $rootScope.$on('event:auth-logout-complete', function() {
    $state.go('login');
  });

  // if the login completes
  $rootScope.$on('event:auth-login-success', function(event, status, nextstate) {
    if(nextstate && nextstate.state) {
      if(nextstate.param) {
        $state.go(nextstate.state, nextstate.param);
      } else {
        $state.go(nextstate.state);
      }
    } else {
      $state.go('mlcl.home');
    }
  });
});

angular.module('mlcl_admin.configservice', [])
.factory('ConfigService', function($rootScope, $http) {
  var service = {
    set: function(name, value) {
      if(value) {
        localStorage.setItem(name, value);
      }
    },
    get: function(name) {
      var value = localStorage.getItem(name);
      if(value && value !== 'undefined') {
        return value;
      } else {
        return;
      }
    },
    unset: function(name) {
      localStorage.removeItem(name);
    },
    getApiHost: function() {
      var host = '';
      if(this.get('apiHost')) {
        if(this.get('apiSSL')) {
          host ='https://';
        } else {
          host ='http://';
        }
        host = host + this.get('apiHost');
      }
      return host;
    },
    setApiHost: function(host, ssl) {
      if(host) {
        this.set('apiHost', host);
      } else {
        this.unset('apiHost');
      }
      if(ssl) {
        this.set('apiSSL', true);
      } else {
        this.unset('apiSSL');
      }
    },
    unsetApiHost: function() {
      this.unset('apiHost');
      this.unset('apiSSL');
    }
  };
  return service;
});
