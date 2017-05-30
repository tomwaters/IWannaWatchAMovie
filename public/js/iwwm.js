angular.module('iwwmApp', [])
    .factory('iwwmFactory', function($http) {
        var iwwmFactory = {};
        iwwmFactory.getMovies = function() {
            return $http.get('/api/programmes');
        }
        return iwwmFactory;
    })
    .controller('iwwmController', function($scope, iwwmFactory) {
        iwwmFactory.getMovies().then(function(response) {
            $scope.movies = response.data;
        }, function() {
            $scope.movies = [];
            console.log('error getting movies');
        });
    });