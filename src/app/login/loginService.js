/**
 * Created by dob on 07.04.14.
 */
angular.module('mlcl_admin.loginservices', ['mlcl_admin.configservice', 'angular-growl'])
.factory('AuthenticationService', function($rootScope, $http, ConfigService, growl) {
  var saveData = function (data) {
    if (!data) {
      localStorage.removeItem('userData');
    } else {
      localStorage.setItem('userData', JSON.stringify(data));
      setHeaders(data.token);
    }
  };

  var setHeaders = function (token) {
    if (!token) {
      delete $http.defaults.headers.common.Authorization;
      return;
    }
    $http.defaults.headers.common.Authorization = token;
  };

  var getData = function() {
    var storageData = localStorage.getItem('userData');
    var data;
    if(storageData) {
      data = JSON.parse(storageData);
    }
    if(data && data.token) {
      service.user = data;
      service.authToken = data.token;
      service.isAuthenticated = true;
      setHeaders(service.authToken);
    }
  };
  /**
   * Service
   * public methods
   * @type {{login: login, logout: logout, loginCancelled: loginCancelled}}
   */
  var service = {
    setNext: function(state, stateParams) {
      if(state) {
        this.nextState = state;
        if(stateParams) {
          this.nextStateParam = stateParams;
        }
      } else {
        this.nextState = undefined;
        this.nextStateParam = undefined;
      }
    },
    login: function(user, config) {
      var self = this;
      if(config) {
        ConfigService.setApiHost(config.server, config.ssl);
      } else {
        ConfigService.unsetApiHost();
      }
      $http.post(ConfigService.getApiHost() +'/login/jwt', {username: user.username, password: user.password}, { ignoreAuthModule: true })
        .success(function (data, status, headers, config) {
          saveData(data);
          self.isAuthenticated = true;
          config.headers.Authorization = data.token;
          if(self.nextState) {
            $rootScope.$broadcast('event:auth-login-success', status, {state: self.nextState, param: self.nextStateParam});
            self.setNext();
          } else {
            $rootScope.$broadcast('event:auth-login-success', status);
            self.setNext();
          }
          return config;
        })
        .error(function (data, status, headers, config) {
          if(status === 404) {
            growl.addErrorMessage('Error while connecting to server');
          } else if(status === 401) {
            growl.addWarnMessage('Wrong username or password');
          }
          $rootScope.$broadcast('event:auth-login-failed', status);
        });
    },
    logout: function(user) {
      saveData();
      localStorage.clear();
      this.isAuthenticated = false;
      delete $http.defaults.headers.common['Authorization'];
      $rootScope.$broadcast('event:auth-logout-complete');
    },
    userRoles: null,
    user: {},
    isAuthenticated: null,
    authToken: null
  };

  getData();
  return service;
})

.factory('authHttpResponseInterceptor',['$q', '$injector', function($q, $injector) {
  return {
    response: function(response){
      return response || $q.when(response);
    },
    responseError: function(rejection) {
      if (rejection.status === 401) {
        if(rejection.data && rejection.data && rejection.data.name === 'TokenExpiredError') {
            // inject the stuff
            var AuthenticationService = $injector.get('AuthenticationService');
            var stateService = $injector.get('$state');
            AuthenticationService.logout();
            if(stateService.current.name !== 'login') {
              AuthenticationService.setNext(angular.copy(stateService.current.name), angular.copy(stateService.params));
            }
            stateService.go('login');
            rejection.data = 'Session expired';
        }
      }
      return $q.reject(rejection);
    }
  };
}])
.config(['$httpProvider',function($httpProvider) {
    //Http Intercpetor to check auth failures for xhr requests
    $httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);
