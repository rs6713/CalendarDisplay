/* 
*  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. 
*  See LICENSE in the source repository root for complete license information. 
*/

var APPLICATION_CONFIG = {
    clientID: "b9de4238-7562-46de-bc0d-14931da45bcb",
    redirectUri: "http://localhost:5000/",
    interactionMode: "popUp",
    graphEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphScopes: ["user.read calendars.read"]
};

var colors=["#333333","#F17BD6", "#CCAD14", "#00CCA4", "#A46496", "#5CA4A3", "#7F6E19"];
var janfirst2000=5;//fell on a saturday

var monthsLength=[31,28,31,30,31,30,31,31,30,31,30,31];
var months=["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
