//This interface will work under the assumption it is possible to store all a years events
//Only keep one year worth of events stored at a time. (Can change this in changeTime(ch) function)
console.log("calendar");
function calendar(graphH){
    this.storedImages={};
    this.storedEvents={};
    this.currentEvents={};

    this.descriptions={"2017": 
                    {"year": "This year may be gone, but the events and the projects your undertook will last a lifetime."
                }};

    var eventFilters=[];
    this.eventTypes={};
    this.daysMonth=[];
    var colors=["#333333","#F17BD6", "#CCAD14", "#00CCA4", "#A46496", "#5CA4A3", "#7F6E19"];
    
    var janfirst2000=5;//fell on a saturday
    
    var monthsLength=[31,28,31,30,31,30,31,31,30,31,30,31];
    var months=["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November","December"];    

    this.currentTime="2017";
    this.currentTheme="The theme during this period was VR and AR. Exploring the latest tech and applications available and what the future holds for this rapidly evolving space.";

    var graph= graphH;

    var cal=this;
    console.log("Creating Calendar");
    //User jumps backward to less specific time
    //Unless at year level
    this.timeBackward= function(){
        cal.currentEvents={};
        console.log(cal.currentTime);
        cal.currentTime=cal.currentTime.split(" ");
        console.log(cal.currentTime);
        cal.currentTime.pop();
        cal.currentTime=cal.currentTime.join(" ");
        updateCurrentEvents();
    }
    
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    //Download attachments belonging to clicked event
    this.downloadAttachment=function(id){
        console.log("id:", id);
        graph.getAttachment(id)
        .then(function (response) {
            var attach= response.data.value;
            console.log("The attachments are", attach);
            //Store all existing image attachments
            for(var u=0; u< attach.length;u++){
                var element = document.createElement('a');

                var blob;

                switch(attach[u].contentType){
                    case "image/jpeg":
                    case "image/jpg":
                    case "image/png":
                    case "image/gif":
                        console.log("Downloading image")
                        
                        //blob = new Blob([JSON.stringify(attach[u].contentBytes)], {
                        //    type: "octet/stream"
                        //});
                        element.setAttribute("href", 'data:'+attach[u].contentType+';charset=utf-8;base64,'+  attach[u].contentBytes);
                        element.setAttribute('download', attach[u].name);
                        break;
                    case "text/plain":
                        console.log("Downloading text")
                        //blob = new Blob([JSON.stringify(attach[u].contentBytes)], {
                        //    type: attach[u].contentType
                        //});
                        element.setAttribute("href", 'data:'+attach[u].contentType+';charset=utf-8,'+  atob(attach[u].contentBytes));
                        element.setAttribute('download', attach[u].name);
                        break;
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        //console.log("Downloading default")
                        //blob = new Blob([JSON.stringify(attach[u].contentBytes)], {
                        //    type: attach[u].contentType
                        //});
                        console.log("Downloading excel .xslx", attach[u].contentType);
                        //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                        element.setAttribute("href", 'data:'+'application/vnd.ms-excel'+';charset=utf-8;base64,'+  attach[u].contentBytes);
                        element.setAttribute('download', attach[u].name.replace('.xlsx', '.xls'));
                        break;
                    default:
                        console.log("Downloading default", attach[u].contentType);
                        //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                        element.setAttribute("href", 'data:'+attach[u].contentType+';charset=utf-8;base64,'+  attach[u].contentBytes);
                        element.setAttribute('download', attach[u].name);

                }

                //element.setAttribute("href", URL.createObjectURL(blob));
                //href = URL.createObjectURL(blob);

                
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
            //var src="data:"+attach[u].contentType+";base64," + attach[u].contentBytes;
        }, function (error) {
            graph.login();
            $log.error('HTTP request to the Microsoft Graph API failed.');
        });         
    } 

    //User jumps forward to more specific time
    //Only if not already at day level specifity
    this.timeForward=function(newTime){
        newTime=String(newTime);
        console.log("Forwarding new time from: ", newTime);
        if(cal.currentTime.split(" ").length!=3){
            cal.currentEvents={};    
            //Make all dates "--" format
            if(cal.currentTime.split(" ").length==2){
                newTime=String(newTime).replace(/\s+/g, '');
                newTime= newTime.length< 2? "0"+newTime : newTime;
            }

            cal.currentTime+=" "+newTime;
            console.log("Forwarding curent time to: ", cal.currentTime);
            updateCurrentEvents();
        }else{
            if(newTime.indexOf("-")==-1){
                cal.currentTime=cal.currentTime.split(" ");
                newTime=String(newTime).replace(/\s+/g, '');
                newTime= newTime.length< 2? "0"+newTime : newTime;
                cal.currentTime[2]=newTime;
                cal.currentTime=cal.currentTime.join(" ");
                console.log("Forwarding curent time to: ", cal.currentTime);
                updateCurrentEvents();
            }
        }
    }

    //Get description of current time period
    this.currentDescription=function(){
        var tim=cal.currentTime.split(" ");
        //day, no description required
        if(tim.length==3){
            return "";
        //month   
        }else if(tim.length==2){
            if(tim[0] in cal.descriptions && tim[1]in cal.descriptions[tim[0]]){
                return cal.descriptions[tim[0]][tim[1]]==undefined? "": cal.descriptions[tim[0]][tim[1]];
            }
        //year
        }else{
            if(tim[0] in cal.descriptions && "year" in cal.descriptions[tim[0]]){
                return cal.descriptions[tim[0]]["year"]==undefined? "": cal.descriptions[tim[0]]["year"];
            }
        }
        return "";
    }

    //Allow to progressively step through time
    this.changeTime= function(ch){
        
        cal.currentEvents={};
        var temp= cal.currentTime.split(" ");

        //Year changes,  need to re-fetch calendar events
        if(temp.length==1){
            cal.currentTime=String(parseInt(temp[0])+ch);//increae/decrease year
            console.log("Change current time to: ", cal.currentTime);
            cal.getCalendar();
        //Month changes
        }else if(temp.length==2){
            var idx=months.indexOf(temp[1])+ch;
            temp[1]=idx>-1 ? months[idx%12] : "December";
            cal.currentTime=temp.join(" ");

            console.log("Change current time to: ", cal.currentTime);
            updateCurrentEvents();

        //Day changes
        }else{
            var day= parseInt(temp[2])+ch;
            var monthEnd=monthsLength[months.indexOf(temp[1])];
            monthEnd= monthEnd!=28 ? monthEnd : isLeapYear(monthEnd) ? 29 : 28;
            
            if(day<1){
                day=monthEnd;
            } else if(day>monthEnd){
                day=1;
            }
            temp[2]= day>9 ? String(day): "0"+String(day);
            cal.currentTime=temp.join(" ");

            console.log("Change current time to: ", cal.currentTime);
            updateCurrentEvents();
        }
      
    }

    //Regular expression checks file extension, checks end of contentType
    function checkImage(url) {
        var arr = [ "jpeg", "jpg", "gif", "png" ];
        for(var i=0; i<arr.length;i++){
          if( url.indexOf(arr[i]) !=-1){
            return 1;
          }
        }
        return 0;
    }

    //Store attachment of currentEvent at key, event no. i
    function storeAttachment(key, i){
        console.log("Current event id adding to",cal.currentEvents[key][i].id);
        if(!(cal.currentEvents[key][i].id in cal.storedImages)){
            //Get the attachment from microsoft calendar
            var idCall=cal.currentEvents[key][i].id;
            graph.getAttachment(idCall)
            .then(function (response) {
                var attach= response.data.value;
                
                //Store all existing image attachments
                for(var u=0; u< attach.length;u++){
                    if(checkImage(attach[u].contentType)){
                        console.log("adding image for event:"," key", key, "i", i );
                        console.log(idCall);
                        var src="data:"+attach[u].contentType+";base64," + attach[u].contentBytes;
                        if(idCall in cal.storedImages){
                            cal.storedImages[idCall].push(src); 
                        }else{
                            cal.storedImages[idCall]=[src]; 
                        }                            
                    }
                }  
            }, function (error) {
                graph.login();
                $log.error('HTTP request to the Microsoft Graph API failed.');

            }); 
        }
    }

    //For all events in currentEvents, make sure attachments are loaded
    function loadAttachments(){
        for(key in cal.currentEvents){
            for(var i=0; i<cal.currentEvents[key].length;i++){
                if(cal.currentEvents[key][i]["hasAttachments"]){
                    console.log("Fetching Attachments from",key, i);
                    storeAttachment( key,i);
                }  
            }      
        }
    }

    //shorthand, adds event to currentEvents
    //If is allowed by currently selected filters
    function addCurrentEvent(event, key){
        if(eventFilters.indexOf(event.type)!=-1 || eventFilters.length==0){  
            if(key in cal.currentEvents){
                cal.currentEvents[key].push(event);
            }else{
                cal.currentEvents[key]=[event];
            } 
        }        
    }

    //According to currentTime specified, load current events into all events
    function loadCurrentEvents(){
        var cTime= cal.currentTime.split(" ");
        var temp=JSON.parse(JSON.stringify(cal.storedEvents));
        cal.currentEvents={};

        //Only need events belonging to current time period
        for(var i=0; i<cTime.length;i++){
          if(cTime[i] in temp){
            temp=temp[cTime[i]]
          }else{
            temp=[];
            break;
          }
        }
  
        //if a day, just an array of events
        if(cTime.length==3){
          //key by time
          for(var i=0; i<temp.length;i++){
            addCurrentEvent(temp[i], temp[i].time);
          }
        //year and month specified
        }else if(cTime.length==2){
          cal.currentEvents={};
          for(var day in temp){
            for(var i=0; i< temp[day].length; i++){
              addCurrentEvent(temp[day][i], day);
            }
          }
        //only year specified
        //temp is collection months->days-> event array
        }else{
          //for month (ordered)
          var ks=Object.keys(temp).sort(function(a,b){return months.indexOf(a)>months.indexOf(b)? 1 : -1});
          for (var i=0;i<ks.length;i++){
            var key=ks[i];
            //for day in month
            var ks2=Object.keys(temp[key]).sort();
            for (var u=0; u<ks2.length;u++){
              var key2=ks2[u];
              for( var j=0; j< temp[key][key2].length; j++){
                  addCurrentEvent(temp[key][key2][j], key);
              }
            }
          }       
        }

    }
    //Returns whether year is a leap year
    function isLeapYear(num){
        return (parseInt(num)%4==0 && !( !(parseInt(num)%100) && parseInt(num)%400));
    }

    //Returns the day of the week the month starts
    function dayMonthStarts(){
        
        var curr=cal.currentTime.split(" ");
        var yr= ((parseInt(curr[0])-2000)*365);
        
        var mth=0;
        for(var i=0; i<months.indexOf(curr[1]); i++){
          if(i!=1){
            mth+=monthsLength[i];
          }else{
            mth+= isLeapYear(curr[0]) ? 29 : 28;
          }
        }
        
        for(var i=2000; i<parseInt(curr[0]); i++){
          if(isLeapYear(i)){
            mth+=1;
          }
        }
        
        var tim=(yr+mth+janfirst2000);
        tim=tim%7;//tim is the day the month starts
        return tim;
    }

    //Update mini calendar display 
    function updateMiniCalendar(){
        var curr=cal.currentTime.split(" ");
        cal.daysMonth=[];
        //Calculate day the month starts
        var startDay=dayMonthStarts();

        for(var i=0; i<startDay; i++){
          cal.daysMonth.push("");
        }
        var currMonthLength=monthsLength[months.indexOf(curr[1])];
        var upto= currMonthLength!=28 ? currMonthLength : isLeapYear(curr[0])? 29 : 28;
        for(var i=1; i< upto+1; i++){
          cal.daysMonth.push(i);
        }
        for(var i=0; i< 7- (cal.daysMonth.length % 7);i++){
          cal.daysMonth.push("");
        }
      
    }

    //Based on currentTime interested in, 
    //Load events from storedEvents into currentEvents
    //Load image attachments
    //Update mini calendar display
    function updateCurrentEvents(){
      console.log("Beginning to update events, loading items from storedEvents into currentEvents");
      
      //Load events wanted from storedEvents into currentEvents
      loadCurrentEvents();

      //Loading image attachments that have not been previously downloaded into storedImages
      console.log("Now loading attachments into currentEvents");
      loadAttachments();

      //Update mini calendar if on month view
      console.log("Now updating Calendar side display");
      if(cal.currentTime.split(" ").length==2){
        updateMiniCalendar();
      }else if(cal.currentTime.split(" ").length==1){
        cal.daysMonth=[];
      }
      console.log("Finished updating current events: Updating calendar side display, events & their attachments")
    }

    //change events filterfilter
    this.changeEventsFilter= function(eventType){
        //update selected event types
        var removedFilter=false;
        if(eventFilters.indexOf(eventType)==-1){
          eventFilters.push(eventType);
        }else{
          eventFilters= eventFilters.filter(e => e !== eventType);
          removedFilter=true;
        }
        console.log("Showable event types:", eventFilters);
        //restore this.currentevent to prev value
        //no filters to be applied, need reset
        //filter added, and not first filter
        //more events than previously. need to reload
        if((!removedFilter && eventFilters.length!=1 )|| eventFilters.length==0){
          console.log("The number of visible events has increased");
          updateCurrentEvents();
        }
        //Less events, more efficient to just remove directly
        else{
            console.log("The number of events with new filters has reduced")
            loadEventsShown();   
        }
    }

    //Reduce current events, by removing those that have been filtered out
    var loadEventsShown=function(){
      var events={};
      for(var key in cal.currentEvents){
        for(var i=0;i<cal.currentEvents[key].length;i++){
          if( eventFilters.indexOf(cal.currentEvents[key][i].type)!=-1 ){
            if(key in events){
              events[key].push(cal.currentEvents[key][i]);
            }else{
              events[key]=[cal.currentEvents[key][i]];
            }
          }
        }
      }
      cal.currentEvents=events;
    }

    //Colour for days in calendar based on events
    //input is day int
    //background: -webkit-linear-gradient(left, grey, grey 30%, white 30%, blue);
    this.colourDay=function(day){

        //if it is a day of the month
        if(day!=""){
          day= day<10 ? "0"+String(day) : String(day);
          var curr=cal.currentTime.split(" ");
          var dayColors=[];

          //if the day is in storedEvents, so has events
          if( curr[0] in cal.storedEvents && curr[1] in cal.storedEvents[curr[0]] && day in cal.storedEvents[curr[0]][curr[1]]){
            var events=cal.storedEvents[curr[0]][curr[1]][day];
            for(var i=0; i<events.length; i++){
              dayColors.push(cal.eventTypes[events[i].type]);
            }
  
            //Create background color or linear gradient 
            //based on number of events and their respective colors
            if(dayColors.length>1){
              var gradient="-webkit-radial-gradient(";
              for(var u=0; u< dayColors.length;u++){
                gradient+=" "+dayColors[u]+' '+String(100/dayColors.length)+"%  ,";
              }
              gradient=gradient.slice(0,gradient.length-2);
              gradient+=")";
              return {'background': gradient};
            }else if(dayColors.length==1){
              return {'background-color': dayColors[0]};
            }
          }
        }
        return {'background-color' :'#222222'};
    } 

    this.getBackground=function(val){
        return {'background-color': val};
    }

    function getEventTime(newStart, newEnd){
            //2017-12-07T00:00:00.0000000

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
            return cal.displayTime(newStart, newEnd);        
    }

    this.getDay=function(st){
        
        return st[2];
    }

    //Creates human friendly way to view time, removes unnecc info
    //Input is ["2017", "02", "11", "00:00"] *2
    //Output "1st 5.00am - 2nd 9.00pm"
    this.displayTime=function(st,en){
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

    //Returns keys of events in sorted arrangement
    //Different process required depending on whether year,month,day
    this.keys=function(objIn){
        if(cal.currentTime.split(" ").length==1){
          return Object.keys(objIn).sort( function(a,b){
            if(months.indexOf(a)< months.indexOf(b)){
              return -1;
            }else{
              return 1;
            }
          });
        }
        if(cal.currentTime.split(" ").length==2){
          return Object.keys(objIn).sort();
        }
        return Object.keys(objIn);
    }
  
    //Change format of time to more humanan friendly form
    //Input is ["2017", "02", "11", "00:00"] 
    //Output ["2017", "February", "November", "00.00am"]
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
        }else if(st[2][1]=="1"){
            stNew.push(parseInt(st[2])+"st");
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

    //Fetch all calendar dates, then place current in currentEvents
    //May lead to huge memory overflow
    this.getCalendar=function(){
        cal.storedEvents={};
        graph.getCalendar(cal.currentTime)
        .then(function (response) {
          cal.currentEvents={};
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
            console.log("Add new event, type:", newEvent.type);
            //Add new event type to colors
            if( !(newEvent.type in cal.eventTypes)){

                cal.eventTypes[newEvent.type] = colors[ Object.keys(cal.eventTypes).length];
                console.log(cal.eventTypes, colors);
            }

            var newEnd= newEvents[i].end.dateTime.split("-");
            var newStart= newEvents[i].start.dateTime.split("-");
            newEnd=[newEnd[0], newEnd[1], newEnd[2].slice(0,2), newEnd[2].slice(3,8)];//year month day need to get time conversion as well
            newStart=[newStart[0], newStart[1], newStart[2].slice(0,2),newStart[2].slice(3,8)];
            newEvent.time= getEventTime(newStart, newEnd);
            newEvent.day=cal.getDay(newStart);
            //Add events to event list, 
            //If event spans multiple days, months, years, an event is added every day it occurs
            
              var eventToAdd= {};
              var startYear=parseInt(newStart[0]);
              var endYear=parseInt(newEnd[0]);

              for(var y=startYear; y<endYear+1; y++){
                var cMonth= parseInt(newStart[1]);
                var eMonth= parseInt(newEnd[1]);
                if(y==startYear && endYear>startYear){
                  eMonth=12;
                }else if(y==endYear && endYear> startYear){
                  cMonth=1;
                }
                eventToAdd[0]=String (y);
                for(var m=cMonth; m<eMonth+1; m++){
  
                    eventToAdd[1]=m<10 ? "0"+String(m): String(m);
  
                    var startDay=1;
                    var endDay= monthsLength[m];
                    //February
                    if(m==1){
                      endDay= isLeapYear(y) ? 29 : 28;
                    }
  
                    //if in start month, start year, make start day
                    if(m==cMonth && y==startYear){
                      startDay=parseInt(newStart[2]);
                    }
  
                    //If in final month and year, make end day
                    if(m==eMonth && y==endYear){
                      endDay=parseInt(newEnd[2]);
                    }
                    for(u= startDay; u< endDay+1; u++){
                      eventToAdd[2]=u<10 ? "0"+String(u): String(u);
                      setEvent(eventToAdd, newEvent);
                    }
                }
              }
            }
            //Put events that are in period currently being looked at in currentEvents.
            updateCurrentEvents();
        }, function (error) {
          graph.login();
        }); 
      }

      function setEvent(newStart, newEvent){
        console.log("Adding event at: ", newStart);
        var mth=months[parseInt(newStart[1])-1];
          if(newStart[0] in cal.storedEvents){
            if(mth in cal.storedEvents[newStart[0]]){
              if(newStart[2] in cal.storedEvents[newStart[0]][mth]){
                cal.storedEvents[newStart[0]][mth][newStart[2]].push(newEvent);
              }else{
                cal.storedEvents[newStart[0]][mth][newStart[2]]=[newEvent];
              }
            }else{
              cal.storedEvents[newStart[0]][mth]={};
              cal.storedEvents[newStart[0]][mth][newStart[2]]=[newEvent];
            }
          }else{
            cal.storedEvents[newStart[0]]={};
            cal.storedEvents[newStart[0]][mth]={};
            cal.storedEvents[newStart[0]][mth][newStart[2]]=[newEvent];
          }
      }
}

