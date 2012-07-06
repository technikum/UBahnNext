var request;
var map;
var pinColor="FF0000";    //standort rot
var add;    //ob die linie hinzugefuegt wird (nur ubahn, oder alle)


 function onLoad() {
    alert("onLoad");
    document.addEventListener("deviceready", onDeviceReady, false);
 }

 function onDeviceReady() {
alert("onDeviceReady");
    document.addEventListener("menubutton", onMenuKeyDown, false);
 }


 function run() {

     var win = function(position) {       // Grab coordinates object from the Position object passed into success callback.
             var coords = position.coords;

             showMap(coords);

             showUBahn(coords);
     };


     var fail = function(e) {
              alert("Can\'t retrieve position.\nError: " + e+"\nCode:"+e.code+"\nMessage:"+e.message);
     };


     if (localStorage.getItem('gps') == "on") {
         navigator.geolocation.getCurrentPosition(win, fail, {enableHighAccuracy: true});
     }
     else {
        alert("Kein GPS eingeschaltet.");
     }
 }




 function showMap(coords) {
     var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);
     
     var myOptions = {
       zoom: 15,
       center: latlng,
       mapTypeId: google.maps.MapTypeId.ROADMAP
     };
     map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

     pinColor="FF0000";    //standort rot
     setGoogleMapsMarker(latlng, "Your position");
 }


 function setGoogleMapsMarker(latlng, title) {
     var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));          

     var marker = new google.maps.Marker({
                      position: latlng,
                      map: map,
                      icon: pinImage
                  });
     marker.setTitle(title);

     pinColor = "69FF75";    //standort rot, die ziele gruen
 }



 function showUBahn(coords) {
    var xml = createXMLRequest(coords);
    sendXMLRequest(xml);
 }


 function createXMLRequest(coords) {
   var xml = ""
      + "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
      + "<ft>"
      + "<request clientId=\"123\" apiName=\"api_search_location_stops_nearby\" apiVersion=\"2.0\">"
      + "<client clientId=\"123\"/>"
      + "<requestType>api_search_location_stops_nearby</requestType>" 
      + "<outputCoords>WGS84</outputCoords>"
      + "<fromCoordName>WGS84</fromCoordName>"
      + "<fromType>coords</fromType>"
      + "<fromWgs84Lat>"+coords.latitude+"</fromWgs84Lat>"
      + "<fromWgs84Lon>"+coords.longitude+"</fromWgs84Lon>"
      + "</request>"
      + "</ft>";

    return xml;
 }


 function sendXMLRequest(xml) {

     if (window.XMLHttpRequest) {
	request = new XMLHttpRequest();   //for IE7+, Firefox, Chrome, Opera, Safari
     } else if (window.ActiveXObject) {
	try {
		request = new ActiveXObject("Msxml2.XMLHTTP"); // IE 5
	} catch (e) {
		try {
			request = new ActiveXObject("Microsoft.XMLHTTP"); // IE 6
		} catch (e) {}
	  }
       }


     if (!request) {        // überprüfen, ob Request erzeugt wurde
	alert("Kann keine XMLHTTP-Instanz erzeugen");
	return false;
     }


     request.onreadystatechange = interpretRequest;   //Request auswerten        
     var url = "http://webservice.qando.at/2.0/webservice.ft";
     request.open("POST", url, true);     
     //1.parameter:Requestmethode - 2.parameter:zieladresse - 3.parameter:asynchron
     request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");  // Requestheader senden          
     request.send(xml);
 }


 // Request auswerten
 function interpretRequest() {

       if(request.readyState == 4) {
           // wenn der readyState 4 und der request.status 200 ist, dann ist alles korrekt gelaufen
           if(request.status != 200) {
	      alert("Der Request wurde abgeschlossen, ist aber nicht OK\nFehler:"+request.status);
           }

           else {
               // Antwort des Servers als XML-Dokument
               var xmlDoc = request.responseXML;
               // Namen aus dem XML-Dokument herauslesen
               var locations = xmlDoc.getElementsByTagName("locations")[0].childNodes;

               var bool = document.Form.Linien[1].checked;    //nur ubahnen?
               for(var i=0; i<locations.length; i++) {
                   var locationRelatedLines = locations[i].getAttribute("relatedLines");
                   add = true;
                   if(bool == true) {
                      locationRelatedLines=aufUbahnEingrenzen(locationRelatedLines);
                   }
                   if(add == true) {
                      var locationTitle = locations[i].getAttribute("title");
                      var locationLat = locations[i].getAttribute("wgs84Lat");
                      var locationLon = locations[i].getAttribute("wgs84Lon");
                      var latlng = new google.maps.LatLng(locationLat, locationLon);
                      setGoogleMapsMarker(latlng, locationTitle+" - Linien: "+locationRelatedLines);
                   }
               }
           }
       }
 }



 function aufUbahnEingrenzen(locationRelatedLines) {
      var help="";
      add = false;    //wird auf true gesetzt wenn es eine ubahn ist      
      
      if(locationRelatedLines.indexOf("U1") >= 0) {
          help = help + "U1 | ";
          add = true;
      }
      if(locationRelatedLines.indexOf("U2") >= 0) {
          help = help + "U2 | ";
          add = true;
      }
      if(locationRelatedLines.indexOf("U3") >= 0) {
          help = help + "U3 | ";          
          add = true;
      }
      if(locationRelatedLines.indexOf("U4") >= 0) {
          help = help + "U4 | ";          
          add = true;
      }
      if(locationRelatedLines.indexOf("U6") >= 0) {
          help = help + "U6 | ";          
          add = true;
      }


      if(add == true) {
         return help;
      }
      else {
         return locationRelatedLines;
      }
 }



 function alle() {
    alert("alle");
 }

 function ubahn() {
    alert("ubahn");
 }


 function onMenuKeyDown() {
     alert("Menubutton!");
 }

 function quit() {
     app.exitApp();
 }



