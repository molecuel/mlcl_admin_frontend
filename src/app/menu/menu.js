angular.module( 'mlcl_admin.menu', [
  'ui.router',
  'mlcl_admin.configservice'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state('mlcl', {
    abstract: true,
    views: {
      'menu@': {
        controller: 'MenuCtrl',
        templateUrl: 'menu/menu.tpl.html'
      }
    }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'MenuCtrl', function( $scope, $http, ConfigService, MenuService) {
  $scope.menus = MenuService.getItems();
})

.factory('MenuService', function MenuService($rootScope, $http, ConfigService) {
  var service =  {
    registerMenu: function(name) {
      if(!this.menu) {
        this.menu = [];
      }
      this.menu.push(name);
    },
    getItems: function() {
      return this.menu;
    }
  };

  return service;
})

.directive('mlcladminmenu', function(MenuService, $compile){
	return {
		restrict: 'A',
    scope: true,
    transclude: true,
		link: function($scope, $element) {
      _.each(MenuService.getItems(), function(item) {
        var submenu = $compile('<menu-'+item+'></menu-'+ item+ '>')($scope);
        $element.append(submenu);
      });
    }
  };
});
