/* 
*  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. 
*  See LICENSE in the source repository root for complete license information. 
*/

// This sample uses an open source OAuth 2.0 library that is compatible with the Azure AD v2.0 endpoint. 
// Microsoft does not provide fixes or direct support for this library. 
// Refer to the library’s repository to file issues or for other support. 
// For more information about auth libraries see: https://azure.microsoft.com/documentation/articles/active-directory-v2-libraries/ 
// Library repo: https://github.com/MrSwitch/hello.js

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
        return {"text-shadow": "1px 1px 3px white", "cursor":"pointer"};
      }
      return {"text-shadow": "0px 0px 0px white"}
    }

    vm.getAttachStyle=function(hover){
      if(hover){
        console.log("Hovered so good");
        return {
          "position":"absolute",
          "top":"0.5em",
          "right":"0.5em",
          "font-size":"1.5em",
          "cursor":"pointer",
          "text-shadow": "1px 1px 1px white"
        }
      }
      return {
        "position":"absolute",
        "top":"0.5em",
        "right":"0.5em",
        "font-size":"1.5em",
        "cursor":"pointer",
        "text-shadow": "0px 0px 0px white"
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