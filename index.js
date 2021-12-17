import '@ar-js-org/ar.js';
import 'aframe-look-at-component';
import 'aframe-osm-3d';
import 'leaflet';
import { GoogleProjection } from 'jsfreemaplib';
var startGame=0;

//DATABASE INIT

var clue1={};
var clue2={};
var clue3={};
var treasure={};
var username;
var sessions = [];
var detectionRange;
setTimeout(() => {


let db;
const indexedDB = window.indexedDB;
let request = indexedDB.open("sessiondb", 1);

request.onsuccess = function(e) {
    console.log("Successfully opened the database!");
    db = e.target.result;
}
request.onerror = function(e) {
    // Imagine //console.log() is a function which fills a div with content
    console.log("Error opening database: " + e.target.errorCode);
}

request.onupgradeneeded = e=> {
    const db = e.target.result; // IDBDatabase instance

    // If upgrading to version >=2, delete the old object store
    if(db.version >= 2) {
        db.deleteObjectStore('sessions');
    }

    const objectStore = db.createObjectStore("sessions", {
            keyPath:"username"
    });


    for(let i=0; i<sessions.length; i++) {
        objectStore.add(sessions[i]);
    };
};

function query(username){
    //DATABASE QUERY
    //const username = username;
    const transaction = db.transaction("sessions");
    const objectStore = transaction.objectStore('sessions');
    request = objectStore.get(username);
    request.onsuccess =  e => {
        if(e.target.result) {
            //alert(e.target.result.username+" "+e.target.result.lat1+" "+e.target.result.lon1+" "+e.target.result.lat2+" "+e.target.result.lon2+" "+e.target.result.lat3+" "+e.target.result.lon3);
            //console.log(e.target.result);
            clue1=e.target.result.clue1;
            clue2=e.target.result.clue2;
            clue3=e.target.result.clue3;
            treasure=e.target.result.treasure;

            document.getElementById('clue2Wrapper').style.display="block";
            document.getElementById('clue3Wrapper').style.display="block";
            document.getElementById('TreasureWrapper').style.display="block";


            document.getElementById("clue1Loc").style.display="none";
            document.getElementById("clue2Loc").style.display="none";
            document.getElementById("clue3Loc").style.display="none";
            document.getElementById("trasureLoc").style.display="none";
            document.getElementById('clue1LocLbl').innerHTML="<h3>Clue 1 Location:<span class='success'></br> Lat: "+e.target.result.clue1.lat+"</br> Lon: "+e.target.result.clue1.lon+"</span></h3>";
            document.getElementById('clue2LocLbl').innerHTML="<h3>Clue 2 Location:<span class='success'></br> Lat: "+e.target.result.clue2.lat+"</br> Lon: "+e.target.result.clue2.lon+"</span></h3>";
            document.getElementById('clue3LocLbl').innerHTML="<h3>Clue 3 Location:<span class='success'></br> Lat: "+e.target.result.clue3.lat+"</br> Lon: "+e.target.result.clue3.lon+"</span></h3>";
            document.getElementById('treasureLocLbl').innerHTML="<h3>Treasure Location:<span class='success'></br> Lat: "+e.target.result.treasure.lat+"</br> Lon: "+e.target.result.treasure.lon+"</span></h3>";
            
            document.getElementById('clue1Txt').value=e.target.result.clue1.txt;
            document.getElementById('clue2Txt').value=e.target.result.clue2.txt;
            document.getElementById('clue3Txt').value=e.target.result.clue3.txt;
          
            let tempLatLon;
            let clueMarker;
            tempLatLon={
                lat:e.target.result.clue1.lat,
                lng:e.target.result.clue1.lon
            }
            clueMarker=L.marker(tempLatLon).addTo(map);
            clueMarker.bindPopup("First Clue");


            
            tempLatLon={
                lat:e.target.result.clue2.lat,
                lng:e.target.result.clue2.lon
            }

             clueMarker=L.marker(tempLatLon).addTo(map);
            clueMarker.bindPopup("Second Clue");

            tempLatLon={
                lat:e.target.result.clue3.lat,
                lng:e.target.result.clue3.lon
            }

             clueMarker=L.marker(tempLatLon).addTo(map);
            clueMarker.bindPopup("Third Clue");

            tempLatLon={
                lat:e.target.result.treasure.lat,
                lng:e.target.result.treasure.lon
            }

             clueMarker=L.marker(tempLatLon).addTo(map);
            clueMarker.bindPopup("Treasure");
            map.off("click");
            document.getElementById("load").style.display='none';

        } else {
            alert('No results!');
        } 
    };

    request.onerror = e => {
        alert(`ERROR ${e.target.errorCode}`);
    };
}

//MAP
  
        
    const map = L.map ("map1").locate({setView: true, maxZoom: 16});

    const attrib="Map data copyright OpenStreetMap contributors, Open Database Licence";

    L.tileLayer
            ("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                { attribution: attrib } ).addTo(map);
                
//    map.setView([50.908,-1.4], 14);
document.getElementById('help-popover').addEventListener('click', function(e) {
    if(e.target.id=="closeHelp"){
        document.getElementById('help-popover').style.display="none";
    }
});
    
document.getElementById('form').addEventListener('click', function(e) {
    //console.log(e.target.id);
    if(e.target.id=="load"){
        username=document.getElementById('name').value;
        query(username);
    }
    if(e.target.id=="help"){
        document.getElementById('help-popover').style.display="block";

    }
    if(e.target.id=="clue1Loc"){
        if(document.getElementById('clue1Txt').value){
            document.getElementById('clue1LocLbl').innerHTML+="</br><span class='pending'>Please click on the map to set location</span>";
            document.getElementById("clue1Loc").style.display="none";

            map.on("click", e => {
                clue1={
                    lon:e.latlng.lng,
                    lat:e.latlng.lat,
                    txt:document.getElementById('clue1Txt').value
                }
                 

                var clue1Marker=L.marker(e.latlng).addTo(map);
                clue1Marker.bindPopup("First Clue");

                document.getElementById('clue1LocLbl').innerHTML="<h3>Clue 1 Location:</br><span class='success'></br> Lat: "+e.latlng.lat+"</br> Lon: "+e.latlng.lng+"</span></h3>";
                map.off("click");
                //console.log(clue1);
                document.getElementById('clue2Wrapper').style.display="block";

            });
            //map.off('click');
        }
        else{
            alert("Please enter the first clue");
        }
    }

    else if(e.target.id=="clue2Loc"){
        if(document.getElementById('clue2Txt').value){
            document.getElementById('clue2LocLbl').innerHTML+="</br><span class='pending'>Please click on the map to set location</span>";
            document.getElementById("clue2Loc").style.display="none";

            map.on("click", e => {
                clue2={
                    lon:e.latlng.lng,
                    lat:e.latlng.lat,
                    txt:document.getElementById('clue2Txt').value
                }
                var clue2Marker=L.marker(e.latlng).addTo(map);
                clue2Marker.bindPopup("Second Clue");
                document.getElementById('clue2LocLbl').innerHTML="<h3>Clue 2 Location:</br><span class='success'></br>Lat: "+e.latlng.lat+"</br>Lon: "+e.latlng.lng+"</span></h3>";
                map.off("click");
                document.getElementById('clue3Wrapper').style.display="block";

                //console.log(clue2);
            });

        }
        else{
            alert("Please enter the second clue");
        }
    }

    else if(e.target.id=="clue3Loc"){
        if(document.getElementById('clue3Txt').value){
            document.getElementById('clue3LocLbl').innerHTML+="</br><span class='pending'>Please click on the map to set location</span>";
            document.getElementById("clue3Loc").style.display="none";

            map.on("click", e => {
                clue3={
                    lon:e.latlng.lng,
                    lat:e.latlng.lat,
                    txt:document.getElementById('clue3Txt').value
                }
                var clue3Marker=L.marker(e.latlng).addTo(map);
                clue3Marker.bindPopup("Third Clue");
                document.getElementById('clue3LocLbl').innerHTML="<h3>Clue 3 Location:</br><span class='success'> </br>Lat: "+e.latlng.lat+"</br> Lon: "+e.latlng.lng+"</span></h3>";
                map.off("click");
                document.getElementById('TreasureWrapper').style.display="block";

                //console.log(clue3);
            });

        }
        else{
            alert("Please enter the third clue");
        }
    }
    
    else if(e.target.id=="trasureLoc"){
            document.getElementById('treasureLocLbl').innerHTML+="</br><span class='pending'>Please click on the map to set location</span>";
            document.getElementById("trasureLoc").style.display="none";

            map.on("click", e => {
                treasure={
                    lon:e.latlng.lng,
                    lat:e.latlng.lat,
                }
                var clue1Marker=L.marker(e.latlng).addTo(map);
                clue1Marker.bindPopup("Treasure");
                document.getElementById('treasureLocLbl').innerHTML="<h3>Treasure Location:</br> <span class='success'></br>Lat: "+e.latlng.lat+"</br> Lon: "+e.latlng.lng+"</span></h3>";

              //  //console.log(treasure);
                map.off("click");
            });

    }
    else if(e.target.id=="clear"){
        var transaction = db.transaction(["sessions"], "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function(event) {
            alert("database cleared");
        };

        transaction.onerror = function(event) {
            alert('Transaction not opened due to error: ' + transaction.error );
        };

        // create an object store on the transaction
        var objectStore = transaction.objectStore("sessions");

        // Make a request to clear all the data out of the object store
        var objectStoreRequest = objectStore.clear();

        objectStoreRequest.onsuccess = function(event) {
            // report the success of our request
            //console.log("request to clear database successful");
        };
    }
    else if(e.target.id=="reset"){
        let i=0;
        map.eachLayer(function(layer) {
            if(i>0){
                map.removeLayer(layer);
            }
                i++;

        });
        document.getElementById("clue1Loc").style.display="block";
        document.getElementById('clue1LocLbl').innerHTML="<h3>Clue 1 Location:</h3>";

        document.getElementById("clue2Loc").style.display="block";
        document.getElementById('clue2LocLbl').innerHTML="<h3>Clue 2 Location:</h3>";

        document.getElementById("clue3Loc").style.display="block";
        document.getElementById('clue3LocLbl').innerHTML="<h3>Clue 3 Location:</h3>";

        document.getElementById("trasureLoc").style.display="block";
        document.getElementById('treasureLocLbl').innerHTML="<h3>Treasure Location:</h3>";
        document.getElementById("load").style.display="block";


    }
    else if(e.target.id=="startBtn"){
        if( JSON.stringify(clue1)==='{}'||JSON.stringify(clue3)==='{}'||JSON.stringify(clue2)==='{}'||JSON.stringify(treasure)==='{}'){
            alert("Please input all clues and treasure");
        }
        else{
            
            document.querySelector('a-scene').style.visibility="visible";
            document.querySelector('#menu').style.visibility="hidden";
            document.getElementById("in-game-menu").style.display="block";
            //const username=document.getElementById("name").ariaValueMax;
        // const transaction = db.transaction("");
        username=document.getElementById("name").value;

        var difficulty=document.getElementById("difficulty").value;
        if(difficulty=="easy"){
            detectionRange={
                green:130,
                yellow:100,
                orange:90,
                red:70,
                reveal: 30,
                difficulty:0.25
            }
        }
        else if(difficulty=="beginner"){
            detectionRange={
                green:250,
                yellow:200,
                orange:150,
                red:80,
                reveal: 30,
                difficulty:0.5

            }
        }
        else if(difficulty=="medium"){
            detectionRange={
                green:100,
                yellow:80,
                orange:60,
                red:50,
                reveal: 30,
                difficulty:1
            }
        }
        else if(difficulty=="hard"){
            detectionRange={
                green:80,
                yellow:60,
                orange:45,
                red:40,
                reveal: 30,
                difficulty:3

            }
        }
            let tempObj={

            username: username,

            clue1: clue1,
            clue2: clue2,
            clue3: clue3,
            treasure: treasure
        };
            sessions.push(tempObj);
            const transaction2 = db.transaction("sessions","readwrite");

            const objectStore2 = transaction2.objectStore('sessions');

        //  for(let i=0; i<sessions.length; i++) {
                objectStore2.add(tempObj);
            //};
        startGame=1;
            
            }  
        } 
        }
        
    );
}, 500); 

    var ProgressFlag=0;
   
    var score=0;
    
   var startTime;
    AFRAME.registerComponent('scene', {
      
    tick: function(totalTime){
        if(startGame==1){
           startTime=totalTime;
            startGame++;
        }
       // //console.log(detectionRange);
        if(startGame>0){

        /*const navBox=document.getElementById('navbox');
        navbox.setAttribute('position', {
            x: this.camera.getAttribute('position').x,
            y: 3,
            z: this.camera.getAttribute('position').z-5 // negate the northing!
        });*/
        const startBox = document.getElementById('box');
        const [clue1Lat,clue1Lon] = this.merc.project(clue1.lon, clue1.lat);

        startBox.setAttribute('position', {
            x: clue1Lat,
            y: 0,
            z: -clue1Lon
         });
         const text1= document.getElementById('text1');
        
         text1.setAttribute('position', {
            x: clue1Lat,
            y: 0,
            z: -clue1Lon// negate the northing!
        });
        text1.setAttribute('text',{
            value: clue1.txt,
            align: 'center'
        });
       
    
        
       // //console.log(detectionRange);


        ////console.log(text1.getAttribute('position'));

            if(navigator.geolocation) {
                
                //navigator.geolocation.getCurrentPosition (
                    
                        //gpspos=> {
                            if(ProgressFlag==0) {
                                ////console.log(  startBox.getAttribute('position'));


                                    //ARROW
                                    var hipotenuse=Math.sqrt( Math.pow(document.querySelector('a-camera').getAttribute("position").z-document.querySelector('#box').getAttribute("position").z,2)+Math.pow(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box').getAttribute("position").x,2));
                                    var sinus=(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box').getAttribute("position").x)/hipotenuse;
                                    var sinusDeg= sinus* (180/Math.PI);
                                    //document.getElementById('navbox').setAttribute('visible',true);

                                    document.getElementById('navbox').setAttribute('position',{
                                        x:document.querySelector('a-camera').getAttribute("position").x,
                                        y:0.5 ,
                                        z:document.querySelector('a-camera').getAttribute("position").z
                                    });

                                    if(document.querySelector('#box').getAttribute("position").z<document.querySelector('a-camera').getAttribute("position").z){
                                        document.getElementById('navbox').setAttribute('rotation',{
                                            y:sinusDeg
                                        });
                                    }
                                    else{
                                        document.getElementById('navbox').setAttribute('rotation',{
                                            y:180-sinusDeg
                                        });
                                    }


                                if(Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs(  startBox.getAttribute('position').z-this.camera.getAttribute('position').z)<=detectionRange.reveal){
                                // //console.log(startBox.getAttribute('position').x-this.camera.getAttribute('position').x);

                                   document.getElementById("clue").innerHTML= "<p><b>Last Clue</b>: "+ clue1.txt +"</p>";


                                    const box2= document.getElementById('box2');
                                 
                                    const text2= document.getElementById('text2');

                                    const [clue2Lon,clue2Lat] = this.merc.project(clue2.lon, clue2.lat);
                                    box2.setAttribute('position', {
                                        x: clue2Lon,
                                        y: -3,
                                        z: -clue2Lat // negate the northing!
                                    });
                    
                                 
                                    text2.setAttribute('position', {
                                        x: clue2Lon,
                                        y: 1,
                                        z: -clue2Lat// negate the northing!
                                    });
                                    text2.setAttribute('text',{
                                        value: clue2.txt,
                                        align: 'center'
                                    })
                              
                                

                                    ProgressFlag++;                            
                                    }
                                else if(Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)>detectionRange.reveal&&Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.red){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                            color:'red',
                                        });
                                    });

                                }     
                                else if(Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.red&&Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.orange){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'orange',
                                    });
                                });

                                } 
                                else if(Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.orange&&Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.yellow){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'yellow',
                                    });
                                });

                                }     
                                else if(Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.yellow&&Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.green){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'green',
                                    });
                                });

                                }     
                                else if(Math.abs( startBox.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( startBox.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.green){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'blue',
                                    });
                                });

                                }     
                            }
                                 if(ProgressFlag==1){


                                      //ARROW
                                      var hipotenuse=Math.sqrt( Math.pow(document.querySelector('a-camera').getAttribute("position").z-document.querySelector('#box2').getAttribute("position").z,2)+Math.pow(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box2').getAttribute("position").x,2));
                                      var sinus=(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box2').getAttribute("position").x)/hipotenuse;
                                      var sinusDeg= sinus* (180/Math.PI);
                                      //document.getElementById('navbox').setAttribute('visible',true);
  
                                      document.getElementById('navbox').setAttribute('position',{
                                          x:document.querySelector('a-camera').getAttribute("position").x,
                                          y:0.5 ,
                                          z:document.querySelector('a-camera').getAttribute("position").z
                                      });
                              
                                      if(document.querySelector('#box2').getAttribute("position").z<document.querySelector('a-camera').getAttribute("position").z){
                                          document.getElementById('navbox').setAttribute('rotation',{
                                              y:sinusDeg
                                          });
                                      }
                                      else{
                                          document.getElementById('navbox').setAttribute('rotation',{
                                              y:180-sinusDeg
                                          });
                                      }


                                     // //console.log(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z));

                                    if(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)<=detectionRange.reveal){
                                        
                                        document.getElementById("box2").setAttribute("visible",true);
                                        document.getElementById("text2").setAttribute("visible",true);
                                        document.getElementById("clue").innerHTML= "<p><b>Last Clue</b>: "+ clue2.txt +"</p>";


                                        const [clue3Lon,clue3Lat] = this.merc.project(clue3.lon, clue3.lat);
                                        const text3= document.getElementById('text3');



                                        const box3= document.getElementById('box3');


                                        box3.setAttribute('position', {
                                            x: clue3Lon,
                                            y: -3,
                                            z: -clue3Lat // negate the northing!
                                        });
                                        box3.setAttribute('material', {
                                            color: 'green'
                                        });
                                        box3.setAttribute('geometry', {
                                            depth:"5",
                                            height:"5",
                                            width:"5"
                                        });
                                        box3.setAttribute("visibile",false);

                                        text3.setAttribute('position', {
                                            x: clue3Lon,
                                            y: 1,
                                            z: -clue3Lat// negate the northing!
                                        });
                                        text3.setAttribute("visibile",false);

                                        text3.setAttribute('text',{
                                            value: clue3.txt,
                                            align: 'center'
                                        })
                                        ProgressFlag++;                           

                                }
                                    else if(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)>detectionRange.reveal&&Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.red){
                                        ////console.log("HERE");
                                       
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'red',
                                        });
                                    });


                                    }     
                                    else if(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.red&&Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.orange){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'orange',
                                        });
                                    });

                                    } 
                                    else if(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.orange&&Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.yellow){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'yellow',
                                        });
                                    });

                                    }     
                                    else if(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.yellow&&Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.green){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'green',
                                        });
                                    });

                                    }     
                                    else if(Math.abs( box2.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box2.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.green){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'blue',
                                        });
                                    });

                                    }     
                                }
                                if(ProgressFlag==2){
                                    //alert("progress flag 2");
                                    //ARROW
                                    var hipotenuse=Math.sqrt( Math.pow(document.querySelector('a-camera').getAttribute("position").z-document.querySelector('#box3').getAttribute("position").z,2)+Math.pow(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box3').getAttribute("position").x,2));
                                    var sinus=(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box3').getAttribute("position").x)/hipotenuse;
                                    var sinusDeg= sinus* (180/Math.PI);
                                    //document.getElementById('navbox').setAttribute('visible',true);

                                    document.getElementById('navbox').setAttribute('position',{
                                        x:document.querySelector('a-camera').getAttribute("position").x,
                                        y:0.5 ,
                                        z:document.querySelector('a-camera').getAttribute("position").z
                                    });

                                    if(document.querySelector('#box3').getAttribute("position").z<document.querySelector('a-camera').getAttribute("position").z){
                                        document.getElementById('navbox').setAttribute('rotation',{
                                            y:sinusDeg
                                        });
                                    }
                                    else{
                                        document.getElementById('navbox').setAttribute('rotation',{
                                            y:180-sinusDeg
                                        });
                                    }
                                    


                                    if(Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)<=detectionRange.reveal){
                                        document.getElementById("clue").innerHTML= "<p><b>Last Clue</b>: "+ clue3.txt +"</p>";

                                        document.getElementById("box3").setAttribute("visible",true);
                                        document.getElementById("text3").setAttribute("visible",true);


                                        const box4= document.getElementById('box4');
                                        const [tLong,tLat] = this.merc.project(treasure.lon, treasure.lat);

                                    
                                        box4.setAttribute("visibile",false);

                                        box4.setAttribute('position', {
                                            x: tLong,
                                            y: -3,
                                            z: -tLat // negate the northing!
                                        });

                                        ProgressFlag++;                           


                                }
                                else if(Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)>detectionRange.reveal&&Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.red){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'red',
                                    });
                                });
                                    
                                    box3.setAttribute('visible',true);

                                }     
                                else if(Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.red&&Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.orange){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'orange',
                                    });
                                });
                                } 
                                else if(Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.orange&&Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.yellow){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'yellow',
                                    });
                                });
                                }     
                                else if(Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.yellow&&Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.green){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'green',
                                    });
                                });
                                }     
                                else if(Math.abs( box3.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box3.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.green){
                                    document.querySelectorAll(".arrowPart").forEach(function (el){
                                        el.setAttribute('material',{
                                         color:'blue',
                                    });
                                });
                                }     
                                }
                                if(ProgressFlag==3){
                                    //document.querySelector('#in-game-menu').innerHTML+="HERE";
                                    ////console.log(box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z);
                                     //ARROW
                                     var hipotenuse=Math.sqrt( Math.pow(document.querySelector('a-camera').getAttribute("position").z-document.querySelector('#box4').getAttribute("position").z,2)+Math.pow(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box4').getAttribute("position").x,2));
                                     var sinus=(document.querySelector('a-camera').getAttribute("position").x-document.querySelector('#box4').getAttribute("position").x)/hipotenuse;
                                     var sinusDeg= sinus* (180/Math.PI);
                                     //document.getElementById('navbox').setAttribute('visible',true);
 
                                     document.getElementById('navbox').setAttribute('position',{
                                         x:document.querySelector('a-camera').getAttribute("position").x,
                                         y:0.5 ,
                                         z:document.querySelector('a-camera').getAttribute("position").z
                                     });
                             
                                     if(document.querySelector('#box4').getAttribute("position").z<document.querySelector('a-camera').getAttribute("position").z){
                                         document.getElementById('navbox').setAttribute('rotation',{
                                             y:sinusDeg
                                         });
                                     }
                                     else{
                                         document.getElementById('navbox').setAttribute('rotation',{
                                             y:180-sinusDeg
                                         });
                                     }
                                    if(Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)<=detectionRange.reveal){
                                       // document.querySelector('a-scene').style.visibility="hidden";
                                        document.getElementById("box4").setAttribute("visible",true);
                                        endScreen=document.querySelector('#in-game-menu');
                                        score=totalTime-startTime;
                                        score=Math.round(10000000/score)*detectionRange.difficulty;
					                    //score=100;
                                        endScreen.innerHTML='<h1>Congratulations! You found the treasure! </br> Your score is: '+score+'</h1></br> <button  id="reload" class="button-1" >Restart game</button>';
                                        document.getElementById("reload").addEventListener('click',function(){
                                            location.reload();
                                        });
                                       // //console.log(totalTime-this.startTime);
                                       startGame=0;
                                       this.pause();
                                       // setTimeout(function() { 
                                         //   endScreen.style.display="none";
                                           // document.querySelector('#menu').style.visibility="visible";
                                        //},5000);
                                                                          

                                    }
                                    else if(Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)>detectionRange.reveal&&Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.red){
                                            document.querySelectorAll(".arrowPart").forEach(function (el){
                                                el.setAttribute('material',{
                                                color:'red',
                                            });
                                        });
                                        box4.setAttribute('visible',true);

                                    }     
                                    else if(Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.red&&Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.orange){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'orange',
                                        });
                                    });
                                    } 
                                    else if(Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.orange&&Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.yellow){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'yellow',
                                        });
                                    });
                                    }     
                                    else if(Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.yellow&&Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)<detectionRange.green){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'green',
                                        });
                                    });
                                    }     
                                    else if(Math.abs( box4.getAttribute('position').x-this.camera.getAttribute('position').x)+Math.abs( box4.getAttribute('position').z-this.camera.getAttribute('position').z)>=detectionRange.green){
                                        document.querySelectorAll(".arrowPart").forEach(function (el){
                                            el.setAttribute('material',{
                                             color:'blue',
                                        });
                                    });
                                    } 
                                }
  
                               
                            ////console.log(gpspos.coords.latitude);
                                //2ND CLUE TESTING 

                        //},
            
                        //err=> {
                        //    alert(`An error occurred: ${err.code}`);
                        //}
            
                    //);
            } else {
                alert("Sorry, geolocation not supported in this browser");
            }
        }
    },
    
    init: function() {
       
            
        document.getElementById("in-game-menu").addEventListener('click',function(e){
            if(e.target.id=="cheat1"){
                detectionRange={
                    green:250,
                    yellow:200,
                    orange:150,
                    red:100,
                    reveal: 90,
                    difficulty:0.15

                }
            }
            else if(e.target.id=="cheat2"){
                document.getElementById('navbox').setAttribute('visible',true);
                detectionRange={
                    green:80,
                    yellow:60,
                    orange:20,
                    red:30,
                    reveal: 15,
                    difficulty:3

                }
            }
            else if(e.target.id=='restart'){
                location.reload();
            }
            else if(e.target.id=="help2"){
                document.getElementById("help-popover").style.display="block";
                document.getElementById("helptxt").innerHTML="This is this: Walk around, watch out for items. At the top, you have the Locator. It changes color when you are getting closer and can help you a great lot! </br> At the top, you see the 2 cheats. The first will make the Locator more sensitive, and the second wil give you a navigating arrow. If you use them, your score will decrease. </br> </br>	  ";
            }

        });
     

        this.merc = new GoogleProjection();
        this.camera = document.querySelector('a-camera');
       
       
        //console.log("HERE");



       

        // Handle a GPS update ...
        window.addEventListener('gps-camera-update-position', e => {
            const [camLon,camLat] = this.merc.project(e.detail.position.longitude, e.detail.position.latitude);


            // Set the camera's position to the current world position 
            // [camera] selects the entity with a 'camera' component, i.e.
            // the camera entity
            document.querySelector('a-camera').setAttribute('position', {
                x: camLon,
                y: 0,
                z: -camLat // negate the northing!
            });

        });

        // This event will fire when the elevation of our current location is available from the DEM.
       // this.el.addEventListener('elevation-available', e => {
        //    //console.log(`Got ele: ${e.detail.elevation}`);
        //    this.camera.object3D.position.y = e.detail.elevation + 1.6;
      //  });


        
       
    }
});
