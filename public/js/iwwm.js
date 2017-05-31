angular.module('iwwmApp', [])
    .factory('iwwmFactory', function($http) {
        var iwwmFactory = {};
        iwwmFactory.getMovies = function() {
            return $http.get('/api/programmes');
        }
        return iwwmFactory;
    })
    .filter('iwwmStart', function() {
        return function(items, mode) {
            if(!items) {
                return;
            }

            let now = new Date('2017-05-29T20:00:00');//Date.now();
            let modeSoon = new Date(now);
            modeSoon.setHours(modeSoon.getHours() + 2);

            return items.filter(function(element){
                let start = new Date(element.Start);
                switch(mode) {
                    case 'now':
                        return start < now && new Date(element.End) > now;
                    case 'soon':
                        return start >= now & start < modeSoon;
                    case 'later':
                        return start >= modeSoon;
                    case 'all': default:
                        return true;
                }
            });
        }
    })
    .controller('iwwmController', function($scope, iwwmFactory, iwwmStartFilter) {
        iwwmFactory.getMovies().then(function(response) {
            $scope.movies = response.data;
        }, function() {
            $scope.movies = [];
            console.log('error getting movies');
        });
    });