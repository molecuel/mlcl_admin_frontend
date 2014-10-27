angular.module( 'mlcl_admin.login', [
  'ui.router',
  'ui.bootstrap',
  'mlcl_admin.loginservices'
])

.config(function config( $stateProvider) {
  $stateProvider.state( 'login', {
    url: '/login?server&ssl',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'login/login.tpl.html'
      }
    },
    data:{
      public: true,
      pageTitle: 'Login'
    }
  });
})

.controller( 'LoginCtrl', function AboutCtrl( $scope, AuthenticationService, $stateParams) {
  $scope.auth = AuthenticationService;
  if($stateParams.server) {
    if(!$scope.config) {
      $scope.config = {};
    }
    if($stateParams.ssl === '1' || $stateParams.ssl === 'true') {
      $scope.config.ssl = true;
    }
    $scope.config.server = $stateParams.server;
    $scope.serverchange = true;
  }
});
