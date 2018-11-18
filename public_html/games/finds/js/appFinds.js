//var app = angular.module("appFinds", ['ui.bootstrap']);



app.service('gamesService', function () {
  var games = [];

  var request = new XMLHttpRequest();
  request.open("GET", "games/finds/maps.json", false);
  request.send(null);


  var myObj = JSON.parse(request.responseText);
  games = Object.keys(myObj)

  this.getGames = function () {
    return games;
  }

  this.getJson = function () {
    return myObj;
  }
});

app.service('commService', function () {
  var observerCallbacks = [];

  this.currentGame = 'First';
//register an observer
  this.registerObserverCallback = function (callback) {
    observerCallbacks.push(callback);
  };

  //call this when you know 'foo' has been changed
  this.notifyObservers = function () {
    angular.forEach(observerCallbacks, function (callback) {
      callback();
    });
  };


});



app.controller("gamesCtrl", function ($scope, commService, gamesService) {




  $scope.games = gamesService.getGames();


  $scope.changeGame = function (game) {
    commService.currentGame = game;
    commService.notifyObservers();

  }

});
app.controller("imageCtrl", function ($scope, commService, $uibModal, gamesService) {


  var canvas;
  var ctx;
  var imageObj = null;

  $scope.areas = [];
  $scope.areasFound = [];
  $scope.finished = false;

  $scope.task;
  $scope.hint;
  $scope.showHint = false;
  $scope.showHintText = 'Show hint';

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  imageObj = new Image();
  imageObj.onload = function () {
    ctx.drawImage(imageObj, 0, 0);
  };

  canvas.addEventListener('mousedown', mouseDown, false);

  getData('First');

  var gameChanged = function () {
    $scope.reset();
    getData(commService.currentGame);
  };

  commService.registerObserverCallback(gameChanged);

  $scope.hintShowHide = function () {
    $scope.showHint = $scope.showHint ? false : true;
    $scope.showHintText = $scope.showHint ? 'Hide hint' : 'Show hint';
  };

  $scope.reset = function () {
    ctx.clearRect(0, 0, 700, 537);
    imageObj = new Image();
    ctx.drawImage(imageObj, 0, 0);
    $scope.areasFound = [];
    $scope.task = null;
    $scope.hint = null;
    $scope.showHint = false;
    $scope.finished = false;
    getData(commService.currentGame);
  };

  $scope.drawAreas = function () {
    ctx.clearRect(0, 0, 700, 537);

    ctx.drawImage(imageObj, 0, 0);
    ctx.strokeStyle = 'red';

    for (i in $scope.areas) {
      ctx.strokeRect($scope.areas[i].x, $scope.areas[i].y, $scope.areas[i].w, $scope.areas[i].h);
    }
  };

  function mouseDown(e) {
    console.log(e.offsetX + " " + e.offsetY);
    checkFound(e.offsetX, e.offsetY)

  }

  function checkFound(x, y) {
    for (i in $scope.areas) {
      var rectLeft = $scope.areas[i].x;
      var rectRight = $scope.areas[i].x + $scope.areas[i].w;

      var rectTop = $scope.areas[i].y;
      var rectBottom = $scope.areas[i].y + $scope.areas[i].h;

      if (x >= rectLeft && x <= rectRight
              && y >= rectTop && y <= rectBottom) {

        // prvi put dodajem
        if ($scope.areasFound.length === 0) {
          $scope.areasFound.push($scope.areas[i]);
          $scope.$apply();

          ctx.strokeRect($scope.areas[i].x, $scope.areas[i].y, $scope.areas[i].w, $scope.areas[i].h);
        } else {
          //pretraži da već ne postoji
          var areaFoundExists = false;
          for (j in $scope.areasFound) {
            if ($scope.areasFound[j].id === $scope.areas[i].id) {
              areaFoundExists = true;
            }
          }

          if (areaFoundExists === false) {
            $scope.areasFound.push($scope.areas[i]);
            $scope.$apply();

            ctx.strokeRect($scope.areas[i].x, $scope.areas[i].y, $scope.areas[i].w, $scope.areas[i].h);
          }
        }

        $scope.finished = $scope.areasFound.length === $scope.areas.length;
        $scope.$apply();
        if ($scope.finished) {
          /*
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'stackedModal.html',
            size: 'sm'
          });
          */
        }
      }
    }
  }

  function getData(game) {
    var myObj = gamesService.getJson();
    gameObj = myObj[game]

    imageObj.src = '/Kids/games/finds/img/' + gameObj.img;
    imageObj.onload = function () {
      ctx.drawImage(imageObj, 0, 0);
    };

    // determine the areas
    for (i in gameObj.areas) {
      $scope.areas[i] = gameObj.areas[i];
    }

    $scope.task = gameObj.task;
    $scope.hint = gameObj.hint;



  }

});
