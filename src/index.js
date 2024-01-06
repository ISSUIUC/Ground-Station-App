// // // Replace the previous 'const { client: MqttClient } = require('paho-mqtt');'
// // const MqttClient = require('paho-mqtt');
// // import Paho from 'paho-mqtt';

// // Import the Paho library
// import * as Paho from 'paho-mqtt';

// // Your other code
// const mqttClient = new Paho.Client('localhost', 8083, 'clientId');


// const mqttTopic = 'Flightdata';


// mqttClient.onConnectionLost = (responseObject) => {
//   if (responseObject.errorCode !== 0) {
//     console.error(`Connection lost: ${responseObject.errorMessage}`);
//   }
// };

// mqttClient.onMessageArrived = (message) => {
//   try {
//     const flightData = JSON.parse(message.payloadString);
//     console.log('Received MQTT Packet:', flightData);
//     // Alternatively, you can display it on the screen if you are working in a browser environment
//     // document.getElementById('mqttDataDisplay').innerText = JSON.stringify(flightData, null, 2);
//   } catch (error) {
//     console.error('Error parsing MQTT message:', error);
//   }
// };

// mqttClient.connect({
//   onSuccess: onConnect,
//   useSSL: false, 
//   mqttVersion: 4,// Set to true if using SSL
// });

// function onConnect() {
//   console.log('Connected to MQTT broker');
//   mqttClient.subscribe(mqttTopic);
// }



// var Cesium = require('cesium/Cesium');
// require('./css/main.css');
// require('cesium/Widgets/widgets.css');
// // webpack/src/index.js


// // Grant CesiumJS access to your ion assets
// Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzJhMjc3ZC01ZTc0LTRlYjktOTU2ZC1jNDRlNGYwNjJkNTkiLCJpZCI6MTg2MDY3LCJpYXQiOjE3MDQxNjkzNTN9.jupWOPMUgaaezRWuxLNCN6S9mdUyzJgzN66jLPrp0LY";

// // Initialize the Cesium Viewer
// var viewer = new Cesium.Viewer('cesiumContainer');

// // Additional code for loading an Ion asset
// (async () => {
//   try {
//     const resource = await Cesium.IonResource.fromAssetId(2406061);

//     const startTime = Cesium.JulianDate.now();
//     const endTime = Cesium.JulianDate.addSeconds(startTime, 300, new Cesium.JulianDate());

//     const positionProperty = new Cesium.SampledPositionProperty();
//     positionProperty.addSample(startTime, Cesium.Cartesian3.fromDegrees(-88.2434, 40.1164, 0));
//     positionProperty.addSample(endTime, Cesium.Cartesian3.fromDegrees(-88.2434, 40.1164, 300000));

//     const entity = viewer.entities.add({
//       position: positionProperty,
//       model: {
//         uri: resource,
//         scale: 0.01,
//       },
//     });

//     viewer.trackedEntity = entity;

//     // Update the viewer clock range and multiplier for animation
//     viewer.clock.startTime = startTime.clone();
//     viewer.clock.stopTime = endTime.clone();
//     viewer.clock.currentTime = startTime.clone();
//     viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop at the end
//     viewer.clock.multiplier = 1; // Play at real-time speed

//     // Set up timeline to show animation controls
//     viewer.timeline.zoomTo(startTime, endTime);
//   } catch (error) {
//     console.log(error);
//   }
// })();




// sreeniv@sreeniv-thinkstation-s20:~$ sudo systemctl start emqx
// sreeniv@sreeniv-thinkstation-s20:~$ sudo systemctl status emqx



var Cesium = require('cesium/Cesium');
require('./css/main.css');
require('cesium/Widgets/widgets.css');
// webpack/src/index.js

import * as Paho from 'paho-mqtt';


const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
const macAddress = randomNumber.toString();
console.log('macAddress:', macAddress);
// Your other Cesium and animation code...


// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzJhMjc3ZC01ZTc0LTRlYjktOTU2ZC1jNDRlNGYwNjJkNTkiLCJpZCI6MTg2MDY3LCJpYXQiOjE3MDQxNjkzNTN9.jupWOPMUgaaezRWuxLNCN6S9mdUyzJgzN66jLPrp0LY";

// Initialize the Cesium Viewer
var viewer = new Cesium.Viewer('cesiumContainer');


const mqttClient = new Paho.Client('192.168.68.113', 8083, macAddress);
const mqttTopic = 'Flightdata';

mqttClient.onConnectionLost = (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.error(`Connection lost: ${responseObject.errorMessage}`);
  }
};

mqttClient.onMessageArrived = (message) => {
  try {
    const flightData = JSON.parse(message.payloadString);
    console.log('Received MQTT Packet:', flightData);
    updatePositionWithMqttData(flightData);
  } catch (error) {
    console.error('Error parsing MQTT message:', error);
  }
};

mqttClient.connect({
  onSuccess: onConnect,
  useSSL: false, 
  mqttVersion: 4,
});

function onConnect() {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe(mqttTopic);
}

// Function to update position based on MQTT data
async function updatePositionWithMqttData(flightData) {
  try {
    // Extract relevant GPS data from MQTT data
    const { gps_lat, gps_long, gps_alt, BNO_YAW,BNO_PITCH,BNO_ROLL } = flightData.value;
    console.log("gps_lat: " + gps_lat);
    console.log("gps_long: " + gps_long);
    console.log("gps_alt: " + gps_alt);

    // Create a new position property based on the MQTT GPS data
    const currentTime = viewer.clock.currentTime;
    const position = Cesium.Cartesian3.fromDegrees(gps_long, gps_lat, gps_alt);
    viewer.entities.getById('dynamicEntity').position.addSample(currentTime, position);
    viewer.entities.getById('dynamicEntity').orientation = new Cesium.VelocityOrientationProperty(
        new Cesium.ConstantPositionProperty(position),
        Cesium.Ellipsoid.WGS84,
        Cesium.Cartesian3.fromDegrees(BNO_YAW, BNO_PITCH, BNO_ROLL)
      );
  } catch (error) {
    console.log('Error updating position with MQTT data:', error);
  }
}



  (async () => {
    try {
      const resource = await Cesium.IonResource.fromAssetId(2406061);
  
      const startTime = Cesium.JulianDate.now();
      const endTime = Cesium.JulianDate.addSeconds(startTime, 300, new Cesium.JulianDate());
  
      const positionProperty = new Cesium.SampledPositionProperty();
      positionProperty.addSample(startTime, Cesium.Cartesian3.fromDegrees(-88.2434, 40.1164, 0));
      positionProperty.addSample(endTime, Cesium.Cartesian3.fromDegrees(-88.2434, 40.1164, 300000));
  
      const entity = viewer.entities.add({
        id: 'dynamicEntity', // Add an ID to easily identify and update the entity
        position: positionProperty,
        model: {
          uri: resource,
          scale: 0.01,
        },
      });
  
      viewer.trackedEntity = entity;
  
      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = endTime.clone();
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      viewer.clock.multiplier = 1;
  
      viewer.timeline.zoomTo(startTime, endTime);
  
      // Set up interval to update position with dynamic data every 5 seconds
      setInterval(updatePositionWithDynamicData(flightData), 5000);
    } catch (error) {
      console.log(error);
    }
  })();
  