//ENGO 551 Final Project 

Mapbox v3.3.0 won't display on Safari. 

This folder contains the following files: 

Styles.css file to style the map 

Realtime.html file to perform realtime incident analysis 

JSONStructure to show how to structure live json file 

Historical.html to perform historical incident analysis 

backend.js for saving data to the database 

app.js for simulating response times with randomly generated data

app_Json.js for getting response times using live json data file
 
app_IoT.js for getting response times   

websocket_server.js for setting up a web socket server

client.js for connecting an IoT device to the web socket server via terminal 

client_browser for connecting an IoT device to the web socket server through a web browser 

HowToConnectIoTDevice explains how to connect your device to the server

WebSocketsStructure which shows example of how to structure message being sent through web socket server 

JSONStructure which shows example of how to structure JSON live data file 

There are two versions of the application, historical and Realtime.
Historical application is for analyzing response times and costs.
Realtime application is for analyzing closest assets to an incident and estimated response time.  

Historical analysis of incident response times and costs can be performed by loading data of coordinates of incidents and assets into Historical.html and open Historical.html file or using randomly generated data created in Historical.html file.

Realtime analysis of closest assets to an incident and estimated response times can be performed by opening Realtime.html and set the script source to either app.js, app_Json.js, or app_IoT.js. app.js uses simulated randomly generated data, app_Json.js uses a live Json data file, and app_IoT uses internet of things devices to find closest assets to an incident and estimate response times.  

During development of the project issues with webpage display and CORS were frequently experienced. Check console for errors by clicking view - > developer - > inspect elements - > console with display. The application needs to be deployed onto a server in order to resolve CORS issues. Mapbox suggests the following solution https://docs.mapbox.com/help/troubleshooting/cors-errors/ . 