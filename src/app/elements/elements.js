angular.module( 'mlcl_admin.elements', [
  'ui.router',
  'ui.bootstrap',
  'mlcl_admin.configservice'
])
.config(function($stateProvider) {
  $stateProvider.state( 'mlcl.elements::list', {
    url: '/elements/:elmodel',
    views: {
      "main@": {
        controller: 'ElementsCtrl',
        templateUrl: 'elements/elements-list.tpl.html'
      }
    }
  })
  .state( 'mlcl.elements::new', {
    url: '/elements/:model/new',
    views: {
      "main@": {
        controller: 'ElementsCtrl',
        templateUrl: 'elements/elements-edit.tpl.html'
      }
    }
  })
  .state( 'mlcl.elements::edit', {
    url: '/elements/:model/:record/edit',
    views: {
      "main@": {
        controller: 'ElementsCtrl',
        templateUrl: 'elements/elements-edit.tpl.html'
      }
    }
  });
})

.run(function(MenuService) {
  MenuService.registerMenu('elements');
})

.directive('menuElements', function($compile, growl, ConfigService, $http){
  return {
    restrict: 'E',
    // this is needed to replace the directive div container!
    replace: true,
    templateUrl: 'elements/menu-elements.tpl.html',
    link: function($scope) {
      $http.get(ConfigService.getApiHost() +'/api/models/editable')
      .success(function (data, status, headers, config) {
        $scope.menuitems = data;
      })
      .error(function (data, status, headers, config) {
        if(status === 404) {
          growl.addErrorMessage('Error while listing models from server');
        }
      });
    }
  };
})

.controller( 'ElementsCtrl', function AboutCtrl( $scope, ConfigService, $state, $stateParams, $templateCache, growl, $rootScope  ) {
  $scope.params = $stateParams;
  $scope.deleteOptions = {};
  $scope.deleteRedirect = function() {
    $state.go('mlcl.elements::list', {elmodel: $scope.params.model});
  };
  $scope.deleteOptions.deleteRedirect = $scope.deleteRedirect;
  $scope.config = ConfigService;
  $scope.apiserver = ConfigService.getApiHost();
});
