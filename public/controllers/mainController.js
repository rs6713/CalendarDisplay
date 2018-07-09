/*
  Better way string/uploading attachments- timeout?
  Need to set max number events display per month?
  Create good class structure
  Clean up code,
  New front end designs
*/

//All events collected in association with a year
//these can then be repeatedly used.
//Issue is when exceeds max data storage
//Allow filter event types? clear/reset colouring, #222222
console.log("Maincontroller");
(function () {
  angular
    .module('app')
    .controller('MainController', MainController);

  function MainController($scope, $http, $log, GraphHelper) {
    let vm = this;

    // View model methods
    vm.login = login;
    vm.logout = logout;
    vm.isAuthenticated = isAuthenticated;
    vm.initAuth = initAuth;
    console.log("Creating main controller");

    vm.appCalendar= new calendar(GraphHelper);
    /////////////////////////////////////////
    // End of exposed properties and methods.
    vm.getTimeStyle=function(hover){
      if(hover && vm.appCalendar.currentTime.split(" ").length!=3){
        return {"text-shadow": "0px 0px 0px white", "cursor":"pointer"};
      }
      return {"text-shadow": "0px 0px 0px white"}
    }

    vm.getAttachStyle=function(hover2){

      if(hover2){
        return {
          "position":"absolute",
          "top":"0.5em",
          "right":"0.5em",
          "font-size":"1.5em",
          "cursor":"pointer",
          "text-shadow": "0px 0px 0px white"
        };
      }else{
        return {
          "position":"absolute",
          "top":"0.5em",
          "right":"0.5em",
          "font-size":"1.5em",
          "cursor":"pointer",
          "text-shadow": "0px 0px 0px white"
        };
      }
    }
    
    function initAuth() {
        // Check initial connection status.
        if (localStorage.token) {
          console.log("Localstorage token exists, logged in");
          // Add the required Authorization header with bearer token.
          $http.defaults.headers.common.Authorization = 'Bearer ' + localStorage.token;
          vm.appCalendar.getCalendar(GraphHelper);
        }else{
          console.log("Localstorage token doesn't exist, need to log in");
          vm.login();
        }
    }


    vm.initAuth();

    function unique(arr){
      return arr.filter(function(item, pos){
        return arr.indexOf(item)== pos; 
      });
    }

    


    function isAuthenticated() {
      return localStorage.getItem('user') !== null ;
    }

    function login() {
      GraphHelper.login();
    }

    function logout() {
      GraphHelper.logout();
    }

  };
})();