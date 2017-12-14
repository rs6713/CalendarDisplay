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
    
    vm.eventTypes={"DEFAULT":"#333333", "DEMO": "#F17BD6", "TALK":"#CCAD14", "PUBLIC": "#00CCA4"};
    
    vm.allEvents={};

    vm.currentTheme="The theme during this period was VR and AR. Exploring the latest tech and applications available and what the future holds for this rapidly evolving space.";
    vm.currentTime="2017"; //year, month, day -sat
    vm.currentEvents={};

    vm.daysMonth=[];

    var monthsLength=[31,28,31,30,31,30,31,31,30,31,30,31];
    var months=["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
    
    var janfirst2000=5;//fell on a saturday

    var monthDescrip={"2017": {"December": "A month of many talks and demonstrations, falling under the theme of VR."}};
    var yearDescrip={"2017": "This year saw the introduction of Spark, helping to encourage innovation across the company. \
                              To accompany this advanced technology has started the development of pop-up stands to explain the latest tech to co-workers."};

    /////////////////////////////////////////
    // End of exposed properties and methods.

    //Returns keys of events in sorted arrangement
    //Different process required depending on whether year,month,day
    vm.keys=function(objIn){
      if(vm.currentTime.split(" ").length==1){
        return Object.keys(objIn).sort( function(a,b){
          if(months.indexOf(a)< months.indexOf(b)){
            return -1;
          }else{
            return 1;
          }
        });
      }
      if(vm.currentTime.split(" ").length==2){
        return Object.keys(objIn).sort();
      }
      return Object.keys(objIn);
    }

    //User jumps backward to less specific time
    vm.backTime= function(){
      vm.currentEvents={};
      var tempTime=vm.currentTime.split(" ");
      tempTime.pop();
      vm.currentTime=tempTime.join(" ");
      updateCurrentEvents();
    }

    //User jumps forward to more specific time
    //Only if not already at day level specifity
    vm.timeForward=function(newTime){
      if(vm.currentTime.split(" ").length!=3){
        vm.currentEvents={};
        
        if(vm.currentTime.split(" ").length==2){
          newTime=String(newTime).replace(/\s+/g, '');
          newTime= newTime.length< 2? "0"+newTime : newTime;
        }
        vm.currentTime+= " "+newTime;
        console.log("Forwarding curent time to: ", vm.currentTime);
        updateCurrentEvents();
      }
    }


    vm.extractDescription=function(){
      var tim=vm.currentTime.split(" ");
      //day, no description required
      if(tim.length==3){
        return ""
      //month
      }else if(tim.length==2){
        return monthDescrip[tim[0]][tim[1]]==undefined? "": monthDescrip[tim[0]][tim[1]];
      //year
      }else{
        return yearDescrip[tim[0]]==undefined? "": yearDescrip[tim[0]];
      }
    }

    //Allow to progressively step through time
    vm.changeTime= function(ch){
      vm.currentEvents={};
      var temp= vm.currentTime.split(" ");
      //When the year changes need to re-fetch calendar events
      if(temp.length==1){
        temp[0]=String(parseInt(temp[0])+ch);//increae/decrease year
        vm.currentTime=temp[0];
        if(vm.currentTime in vm.allEvents){
          updateCurrentEvents();
          return
        }
        getCalendar();
      }else if(temp.length==2){
        var idx=months.indexOf(temp[1])+ch;
        if(idx<0){
          temp[1]="December";
        }else if(idx>11){
          temp[1]="January";
        }else{
          temp[1]=months[idx];
        }
        vm.currentTime=temp.join(" ");
        console.log("month change currentime", vm.currentTime);
        updateCurrentEvents();
      }else{
        var day= parseInt(temp[2])+ch;
        var monthEnd=monthsLength[months.indexOf(parseInt(temp[1]))];
        monthEnd= monthEnd!=28 ? monthEnd : ((monthEnd%4==0 && !( !(monthEnd%100) && monthEnd%400)) ? 29 : 28);
        if(day<1){
          day=monthEnd;
        } else if(day>monthEnd){
          day=1;
        }
        temp[2]= day>9 ? String(day): "0"+String(day);
        vm.currentTime=temp.join(" ");
        updateCurrentEvents();
      }
      
    }


    function formatTime(st){
      var stNew=[];
      stNew.push(st[0]);
      stNew.push(months[parseInt(st[1]-1)]);

      if(st[2]=="01"){
        stNew.push("1st");
      }else if(st[2]=="02"){
        stNew.push("2nd");
      }else if(st[2]=="03"){
        stNew.push("3rd");
      }else{
        stNew.push(parseInt(st[2])+"th");
      }

      if(parseInt(st[3].slice(0,2))<12){
        stNew.push( parseInt(st[3].slice(0,2)) +"." + st[3].slice(3,5)+"am");
      }else{
        stNew.push((parseInt(st[3].slice(0,2))-12) +"." + st[3].slice(3,5)+"pm");
      }
      return stNew;
    }

    //Creates human friendly way to view time
    //Input is ["2017", "02", "11", "00:00"] *2
    //Output ["2017", "February", "November", "00.00am"]
    vm.displayTime=function(st,en){
      var stNew=formatTime(st);    
      var enNew=formatTime(en);

      for(var i=0; i< stNew.length; i++){
        if(stNew[i]!=enNew[i]){
          stNew=stNew.splice(i, stNew.length-1);
          enNew=enNew.splice(i, enNew.length-1);
          break;
        }
      }
      return stNew.join()+"-"+enNew.join();
    }

    //Regular expression checks file extension, checks end of contentType
    function checkImage(url) {
      console.log(url);
      var arr = [ "jpeg", "jpg", "gif", "png" ];
      for(var i=0; i<arr.length;i++){
        if( url.indexOf(arr[i]) !=-1){
          return 1;
        }
      }
      return 0;
    }

    function attachAttachment(key, i){
      GraphHelper.getAttachment(vm.currentEvents[key][i].id)
      .then(function (response) {
        $log.debug('HTTP request to the Microsoft Graph API returned successfully.', response);

        var attach= response.data.value;
        //Check if its an image
        //WILL NEED TO MAKE THIS GENERAL PURPOSE
        var img={};
        var acceptedFormats=["image/jpeg" , "image/png"];
        //console.log("Attachment type is",attach[0].contentType );
        console.log(key, i, vm.currentEvents[key]);
        if(key in vm.currentEvents && vm.currentEvents[key].length>i){
          for(var u=0; u< attach.length;u++){
            if(checkImage(attach[u].contentType)){
              var src="data:"+attach[u].contentType+";base64," + attach[u].contentBytes;
              vm.currentEvents[key][i]["images"].push(src);
              console.log("Current event has attachment", vm.currentEvents[key][i]["images"]);
            }
          }
        }


      }, function (error) {
        vm.login();
        $log.error('HTTP request to the Microsoft Graph API failed.');

      }); 
    }

    function loadAttachments(){
      for(key in vm.currentEvents){
        for(var i=0; i<vm.currentEvents[key].length;i++){
          if(vm.currentEvents[key][i]["hasAttachments"]){
            console.log("Fetching Attachments from",key, i);
            attachAttachment(key,i);
          }  
        }      
      }
    }

    //Based on currentTime interested in, load events from allEvents into currentEvents
    function updateCurrentEvents(){
      console.log("Beginning to update events, loading items from allEvents into currentEvents");
      var cTime= vm.currentTime.split(" ");
      var temp=JSON.parse(JSON.stringify(vm.allEvents));
    
      for(var i=0; i<cTime.length;i++){
        if(cTime[i] in temp){
          temp=temp[cTime[i]]
        }else{
          temp=[];
          break;
        }
      }
      console.log("The current time is level ", cTime.length, " specific.");
      
      //if a day, just array events
      if(cTime.length==3){
        //key by time
        for(var i=0; i<temp.length;i++){
          if(selectedEventTypes.indexOf(temp[i].type)!=-1 || selectedEventTypes.length==0){  
            if(temp[i].time in vm.currentEvents){
              vm.currentEvents[temp[i].time].push(temp[i]);
            }else{
              vm.currentEvents[temp[i].time]=[temp[i]];
            } 
          }
        }
      //year and month specified
      }else if(cTime.length==2){
        vm.currentEvents={};
        for(var day in temp){
          for(var i=0; i< temp[day].length; i++){
            if(selectedEventTypes.indexOf(temp[day][i].type)!=-1 || selectedEventTypes.length==0){
              if(day in vm.currentEvents){
                vm.currentEvents[day].push(temp[day][i]);
              }else{
                vm.currentEvents[day]=[temp[day][i]];
              }
            }
          }
        }
      //only year specified
      //temp is collection months->days-> event array
      }else{
        //for month
        var ks=Object.keys(temp).sort(function(a,b){return months.indexOf(a)>months.indexOf(b)? 1 : -1});
        for (var i=0;i<ks.length;i++){
          var key=ks[i];
          //month is empty
          vm.currentEvents[key]=[];
          //for day in month
          var ks2=Object.keys(temp[key]).sort();
          for (var u=0; u<ks2.length;u++){
            var key2=ks2[u];
            for( var j=0; j< temp[key][key2].length; j++){
              if(selectedEventTypes.indexOf(temp[key][key2][j].type)!=-1 || selectedEventTypes.length==0){
                vm.currentEvents[key].push(temp[key][key2][j]);
              }
            }
            
            //for(var i=0; i< temp[key][key2].length;i++){
            //  vm.currentEvents.push(temp[key][key2][i]);
            //} 
          }
          //console.log("currentevents", JSON.stringify(vm.currentEvents));
        }       
      }
      console.log("Now loading attachments into currentEvents");
      loadAttachments();
      console.log("Now updating Calendar side display");
      //Calculate day the month starts
      vm.daysMonth=[];
      var curr=vm.currentTime.split(" ");
      //console.log("current time length", curr.length);
      if(curr.length==2){
        var yr= ((parseInt(curr[0])-2000)*365);
        //console.log("Years gone by:", yr);
        var mth=0;
       //console.log(months.indexOf(curr[1]));
        for(var i=0; i<months.indexOf(curr[1]); i++){
          if(i!=1){
            mth+=monthsLength[i];
          }else{
            mth+= (parseInt(curr[0])%4==0 && !( !(parseInt(curr[0])%100) && parseInt(curr[0])%400)) ? 29 : 28;
          }
        }
        //console.log("months gone by: ", mth);
        for(var i=2000; i<parseInt(curr[0]); i++){
          if(parseInt(i)%4==0 && !( !(parseInt(i)%100) && parseInt(i)%400)){
            mth+=1;
          }
        }
        //console.log("months gone by: ", mth);
        var tim=(yr+mth+janfirst2000);
        //console.log("days gone", tim);
        tim=tim%7;
        //console.log("Month start", curr[1], tim);  

        for(var i=0; i<tim; i++){
          vm.daysMonth.push("");
        }
      
        var upto= monthsLength[months.indexOf(curr[1])] !=28? monthsLength[months.indexOf(curr[1])] : (parseInt(curr[0])%4==0 && !( !(parseInt(curr[0])%100) && parseInt(curr[0])%400)) ? 29 : 28;
        for(var i=1; i< upto+1; i++){
          vm.daysMonth.push(i);
        }
        for(var i=0; i< 7- (vm.daysMonth.length % 7);i++){
          vm.daysMonth.push("");
        }
      }
      console.log("Finished updating current events: Updating calendar side display, events & their attachments")
    }
    //vm.logout();
    function initAuth() {
        // Check initial connection status.
        if (localStorage.token) {
          console.log("lLocalstorage token exists, logged in");
          processAuth();
        }else{
          console.log("Localstorage token doesn't exist, need to log in");
          vm.login();
        }
    }

    // Auth info is saved in localStorage by now, so set the default headers and user properties.
    // Auth info is saved locally, can set localStorage.user
    function processAuth() {
        // Add the required Authorization header with bearer token.
        $http.defaults.headers.common.Authorization = 'Bearer ' + localStorage.token;
        getCalendar();
    }

    vm.initAuth();

    function unique(arr){
      return arr.filter(function(item, pos){
        return arr.indexOf(item)== pos; 
      });
    }

    var selectedEventTypes=[];

    vm.reduceCurrentEvents= function(eventType){
        //update selected event types
        var removedFilter=false;
        if(selectedEventTypes.indexOf(eventType)==-1){
          selectedEventTypes.push(eventType);
        }else{
          selectedEventTypes= selectedEventTypes.filter(e => e !== eventType);
          removedFilter=true;
        }
        console.log("Showable event types:", selectedEventTypes);
        //restore vm.currentevent to prev value
        //no filters to be applied, need reset
        //filter added, and not first filter
        if((!removedFilter && selectedEventTypes.length!=1 )|| selectedEventTypes.length==0){
          console.log("The number of visible events has increased");
          updateCurrentEvents();
        }
        if(selectedEventTypes.length!=0){
          console.log("There are filters to be applied");
          loadEventsShown();
        }
    }

    var loadEventsShown=function(){
      //console.log("currentEvents when starting to load events", JSON.stringify(vm.currentEvents));
      var events={};
      for(var key in vm.currentEvents){
        console.log(key);
        for(var i=0;i<vm.currentEvents[key].length;i++){
          console.log(vm.currentEvents[key][i].type);
          if( selectedEventTypes.indexOf(vm.currentEvents[key][i].type)!=-1 ){
            if(key in events){
              events[key].push(vm.currentEvents[key][i]);
            }else{
              events[key]=[vm.currentEvents[key][i]];
            }
          }
        }
      }
      console.log("Events to be shown", JSON.stringify(events));
      vm.currentEvents=events;
    }

    

    //Colour for days in calendar based on events
    //input is day int
    //background: -webkit-linear-gradient(left, grey, grey 30%, white 30%, blue);
    
    vm.colourDay=function(day){
      var dayColors={};

      
      //if it is a day of the month
      if(day!=""){
        day= day<10 ? "0"+String(day) : String(day);

        var curr=vm.currentTime.split(" ");
        //if the day is in allevents, so has events
        if( curr[0] in vm.allEvents && curr[1] in vm.allEvents[curr[0]] && day in vm.allEvents[curr[0]][curr[1]]){
          var temp;
          for(var i=0; i<vm.allEvents[curr[0]][curr[1]][day].length; i++){
            var newcolor=vm.eventTypes[vm.allEvents[curr[0]][curr[1]][day][i].type];
            temp= newcolor ==undefined? "#444444" : newcolor ;
            if(day in dayColors){
              dayColors[day].push(temp);
            }else{
              dayColors[day]=[temp];
            }
          }

          //Create background color or linear gradient
          if(day in dayColors && dayColors[day].length>1){
            var gradient="-webkit-radial-gradient(";
            for(var u=0; u< dayColors[day].length;u++){
              gradient+=" "+dayColors[day][u]+' '+String(100/dayColors[day].length)+"%  ,";
            }
            gradient=gradient.slice(0,gradient.length-2);
            gradient+=")";
            return 'background:'+ gradient;
          }else{
            //console.log("One event, color", temp);
            return 'background-color:'+ temp;
          }
        }
      }
      return 'background-color: #222222';
    }
    
    //Fetch all calendar dates, then place current in currentEvents
    //May lead to huge memory overflow
    function getCalendar(){
      GraphHelper.getCalendar(vm.currentTime)
      .then(function (response) {
        $log.debug('HTTP request to the Microsoft Graph API returned successfully.', response);
        console.log("The calendar events response: ", response);
        vm.currentEvents={};
        var newEvents= response.data.value;
        //For each new event, create its dict instance of values, then store in events
        console.log("number of events to be added: ", newEvents.length);
        for(var i=0; i< newEvents.length; i++){
          //Create new event
          var newEvent={};
          newEvent.id=newEvents[i].id;
          newEvent.images=[];
          newEvent.hasAttachments=newEvents[i].hasAttachments;
          newEvent.description=newEvents[i].bodyPreview;
          var title= newEvents[i].subject.split(":");
          newEvent.type="DEFAULT";
          if(title.length>1){
            newEvent.type=title[0];
            newEvent.title=title[1];
          }else{
            newEvent.title=title[0];
          }
          newEvent.start=newEvents[i].start.dateTime;
          //2017-12-07T00:00:00.0000000
          var newEnd= newEvents[i].end.dateTime.split("-");
          var newStart= newEvents[i].start.dateTime.split("-");
          newEnd=[newEnd[0], newEnd[1], newEnd[2].slice(0,2), newEnd[2].slice(3,8)];//year month day need to get time conversion as well
          newStart=[newStart[0], newStart[1], newStart[2].slice(0,2),newStart[2].slice(3,8)];
          //Adjust for full day events to 23:59:59
          if(newEnd[3]=="00:00"){
            newEnd[3]="23:59";
            var day=parseInt(newEnd[2]);
            if(day>1){
              newEnd[2]=day<10 ? "0"+String(day-1):String(day-1);
            //1st month
            }else{
              if(parseInt(newEnd[1])>1){
                newEnd[1]= (parseInt(newEnd[1])-1) <10 ? "0"+String(parseInt(newEnd[1])-1) :String(parseInt(newEnd[1])-1);
                var monthEnd= monthsLength[parseInt(newEnd[1])];
                //if february check for leap year
                if(monthEnd==28){
                  monthEnd= (parseInt(newEnd[0])%4==0 && !( !(parseInt(newEnd[0])%100) && parseInt(newEnd[0])%400)) ? 29 : 28;
                }
                newEnd[2]= String(monthEnd);
              //january 1st
              }else{
                newEnd[1]="12";
                newEnd[2]="31";
                newEnd[0]= String(parseInt(newEnd[0]-1));
              }
            }
          }
          newEvent.time=vm.displayTime(newStart, newEnd);
          //console.log("Event to be added: ",newEvent);
          //Add events to event list, 
          //If event spans multiple days, months, years, an event is added every day it occurs
            var eventToAdd= {};
            var startYear=parseInt(newStart[0]);
            var endYear=parseInt(newEnd[0]);

            //console.log("Start year, end year", startYear, endYear);
           
            for(var y=startYear; y<endYear+1; y++){
              var cMonth= parseInt(newStart[1]);
              var eMonth= parseInt(newEnd[1]);
              if(y==startYear && endYear>startYear){
                eMonth=12;
              }else if(y==endYear && endYear> startYear){
                cMonth=1;
              }
              //console.log("Current year, start month, end month", String(y), cMonth, eMonth);
              eventToAdd[0]=String (y);
              for(var m=cMonth; m<eMonth+1; m++){

                  eventToAdd[1]=m<10 ? "0"+String(m): String(m);

                  var startDay=1;
                  var endDay= monthsLength[m];
                  //February
                  if(m==1){
                    endDay= (y%4==0 && !( !(y%100) && y%400)) ? 29 : 28;
                  }

                  //if in start month, start year, make start day
                  if(m==cMonth && y==startYear){
                    startDay=parseInt(newStart[2]);
                  }

                  //If in final month and year, make end day
                  if(m==eMonth && y==endYear){
                    endDay=parseInt(newEnd[2]);
                  }
                  //console.log("START, END DAY",startDay, endDay);
                  for(u= startDay; u< endDay+1; u++){
                    eventToAdd[2]=u<10 ? "0"+String(u): String(u);
                    //console.log("Setting current event");
                    setEvent(eventToAdd, newEvent);
                  }
              }
            }
          }
          //Put events that are in period currently being looked at in currentEvents.
          updateCurrentEvents();
      }, function (error) {
        vm.login();
        $log.error('HTTP request to the Microsoft Graph API failed.');
      }); 
    }
  
    function setEvent(newStart, newEvent){
      console.log("Adding event at: ", newStart);
      var mth=months[parseInt(newStart[1])-1];
        if(newStart[0] in vm.allEvents){
          if(mth in vm.allEvents[newStart[0]]){
            if(newStart[2] in vm.allEvents[newStart[0]][mth]){
              vm.allEvents[newStart[0]][mth][newStart[2]].push(newEvent);
            }else{
              vm.allEvents[newStart[0]][mth][newStart[2]]=[newEvent];
            }
          }else{
            vm.allEvents[newStart[0]][mth]={};
            vm.allEvents[newStart[0]][mth][newStart[2]]=[newEvent];
          }
        }else{
          vm.allEvents[newStart[0]]={};
          vm.allEvents[newStart[0]][mth]={};
          vm.allEvents[newStart[0]][mth][newStart[2]]=[newEvent];
        }
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