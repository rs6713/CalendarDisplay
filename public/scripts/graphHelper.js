/* 
*  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. 
*  See LICENSE in the source repository root for complete license information. 
*/

// This sample uses an open source OAuth 2.0 library that is compatible with the Azure AD v2.0 endpoint. 
// Microsoft does not provide fixes or direct support for this library. 
// Refer to the library’s repository to file issues or for other support. 
// For more information about auth libraries see: https://azure.microsoft.com/documentation/articles/active-directory-v2-libraries/ 
// Library repo: https://github.com/MrSwitch/hello.js

"use strict";

function createApplication(applicationConfig) {

    var clientApplication = new Msal.UserAgentApplication(applicationConfig.clientID, null, function (errorDesc, token, error, tokenType) {
        // Called after loginRedirect or acquireTokenPopup
    });

    return clientApplication;
}

var clientApplication;
console.log("graphHelper");

(function () {
  console.log("inside graph helper");
  angular
    .module('app')
    .service('GraphHelper', ['$http', function ($http) {

      // Initialize the auth request.
      console.log("Initializing graphhelper");
      clientApplication = createApplication(APPLICATION_CONFIG);
      console.log("Graphhelper after created application");
      return {


        //Sign in and sign out the user.
        login: function login() {
            clientApplication.loginPopup(APPLICATION_CONFIG.graphScopes).then(function (idToken) {
                console.log("Idtoken from login popup", idToken);
                clientApplication.acquireTokenSilent(APPLICATION_CONFIG.graphScopes).then(function (accessToken) {
                    console.log("Localstorage token, gotten by login popup:", accessToken);
                    localStorage.token = accessToken;
                    window.location.reload(); // -->goes back, page start as normal
                }, function (error) {
                    clientApplication.acquireTokenPopup(APPLICATION_CONFIG.graphScopes).then(function (accessToken) {
                        localStorage.token = accessToken;
                    }, function (error) {
                        window.alert("Error acquiring the popup:\n" + error);
                    });
                })
            }, function (error) {
                window.alert("Error during login:\n" + error);
            });
        },

        logout: function logout() {
            clientApplication.logout();
            delete localStorage.token;
            delete localStorage.user;
        },

        // Get the profile of the current user.
        me: function me() {
          return $http.get('https://graph.microsoft.com/v1.0/me');
        },

        //Get calendar events between specified dates
        //https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=2017-01-01T19:00:00.0000000&endDateTime=2017-01-07T19:00:00.0000000
        getCalendar: function getCalendar(currentTime){
            //console.log(currentTime);
            var period= getTimePeriod(currentTime);
            console.log("Getting events during: ", period);
            return $http.get("https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime="+period[0]+"&endDateTime="+ period[1]+"&$count=true&$top=1000");
        },
        getAttachment: function getAttachment(eventId){
            return $http.get("https://graph.microsoft.com/v1.0/me/events/"+eventId+"/attachments/");
        }
      }
    }]);
})();

// data format 2017-01-07T19:00:00.0000000
//time is space separated day, month, year
function getTimePeriod(time){
    var time= time.split(" "); 
    var months=["","January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
    
    if(time.length==1){ 
        return [time[0]+"-01-01T00:00:00.0000000", (parseInt(time[0])+1)+"-01-01T00:00:00.0000000"];
    }else{
        var month= String(months.indexOf(time[1]));
        if(month.length==1){
            month="0"+month;
        }
        var endMonth= String(months.indexOf(time[1])+1);
        var yearOverflow=0;
        if(parseInt(endMonth)>12){
            endMonth="01";
            yearOverflow=1;
        }
        if(endMonth.length==1){
            endMonth="0"+endMonth;
        }
        
        if(time.length==2){
            //console.log("year, startmonth, endmonth", time[0], month, endMonth);
            return [ time[0]+"-" + month+"-01T00:00:00.0000000", String(parseInt(time[0])+yearOverflow)+"-" +endMonth+"-01T00:00:00.0000000"];
        }else{
            var day=String(time[2]);
            day= day.length==2? day: "0"+day;
            return [ time[0]+"-" + month+"-"+ day+"T00:00:00.0000000", time[0]+"-" +month+"-"+day+"T23:59:59.0000000"];
        }
    }


};