// sreeniv@sreeniv-thinkstation-s20:~$ sudo systemctl start emqx
// sreeniv@sreeniv-thinkstation-s20:~$ sudo systemctl status emqx




/*
{
    "type": "data",
    "value": {
        "IMU_mx": -0.06279172292408176,
        "IMU_my": 0.9980266527163617,
        "IMU_mz": -0.06266781304821456,
        "IMU_gx": -0.06279172292408176,
        "IMU_gy": 0.9980266527163617,
        "IMU_gz": -0.06266781304821456,
        "KX_IMU_ax": -0.06279172292408176,
        "KX_IMU_ay": 0.9980266527163617,
        "KX_IMU_az": -0.06266781304821456,
        "gps_lat": 51.774210208277076,
        "gps_long": -86.57143697334729,
        "gps_alt": 102600,
        "STE_ALT": -0.06279172292408176,
        "STE_VEL": 0.9980266527163617,
        "STE_ACC": -0.06266781304821456,
        "STE_APO": -0.12533562609642912,
        "BNO_YAW": 0,
        "BNO_PITCH": 0,
        "BNO_ROLL": 0,
        "RSSI": -0.06279172292408176,
        "sign": "qxqxlol",
        "FSM_state": 14.200000000000001,
        "Voltage": -0.06279172292408176,
        "TEMP": -0.06279172292408176,
        "frequency": -0.06279172292408176,
        "flap_extension": -15.894239021328087,
        "pressure": 918
        "time": "771230"
    }
}
*/

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

const trajectoryPoints = [
];


const czmlWithTrajectory = [
  {
    id: "document",
    name: "CZML Geometries: Polyline",
    version: "1.0",
  },
  {
    id: "trajectoryLine",
    name: "Rocket Trajectory",
    polyline: {
      positions: {
        cartographicDegrees: trajectoryPoints.flat(),
      },
      material: {
        solidColor: {
          color: {
            rgba: [0, 255, 0, 255], // Green color for the trajectory
          },
        },
      },
      width: 5,
      clampToGround: false,
    },
  },
  // ... (other CZML entries)
];

var viewer = new Cesium.Viewer("cesiumContainer");
// Create a gauge for altitude

const mqttClient = new Paho.Client('10.192.221.149', 8083, macAddress);
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
    //updateTrajectoryWithDynamicData(flightData);
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

var lastThreeTimestamps = [];
var lastThreealtitudes = [];

// Function to update position based on MQTT data
function updatePositionWithMqttData(flightData) {
  try {
    // Extract relevant GPS data from MQTT data
    var currentTimeInMilliseconds = new Date().getTime();
    console.log(currentTimeInMilliseconds);
    lastThreeTimestamps.push(currentTimeInMilliseconds);

    const { gps_lat, gps_long, gps_alt, BNO_YAW,BNO_PITCH,BNO_ROLL } = flightData.value;
    console.log("gps_lat: " + gps_lat);
    console.log("gps_long: " + gps_long);
    console.log("gps_alt: " + gps_alt);
    lastThreealtitudes.push(gps_alt);
  
    if (lastThreeTimestamps.length > 3 || lastThreealtitudes.length > 3) {
        lastThreeTimestamps.shift(); // Remove the oldest timestamp
        lastThreealtitudes.shift(); // Remove the oldest altitude
    }
    if (lastThreeTimestamps.length === 3 && lastThreealtitudes.length === 3) {
        const timeDifference = (lastThreeTimestamps[2] - lastThreeTimestamps[1]) / 1000; // Convert to seconds
        const altitudeDifference = lastThreealtitudes[2] - lastThreealtitudes[1];
        const velocity = (altitudeDifference / timeDifference) * 0.681818; //convert to mph
        console.log("Velocity:", velocity);
    }
    console.log("Last three altitudes:", lastThreealtitudes);
    console.log("Last three timestamps:", lastThreeTimestamps);
    
    

    // Create a new position property based on the MQTT GPS data
    const currentTime = viewer.clock.currentTime;
    const position = Cesium.Cartesian3.fromDegrees(gps_long, gps_lat, gps_alt);
    viewer.entities.getById('dynamicEntity').position.addSample(currentTime, position);
    


    const heading = Cesium.Math.toRadians(BNO_YAW * (180/Math.PI));
    const pitch = Cesium.Math.toRadians(BNO_PITCH * (180/Math.PI));
    const roll = Cesium.Math.toRadians(BNO_ROLL * (180/Math.PI));

    
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    viewer.entities.getById('dynamicEntity').orientation = orientation;
    //viewer.zoomTo(viewer.entities.getById('dynamicEntity'));
    //updateTrajectoryWithDynamicData(gps_lat, gps_long, gps_alt);

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
        //orientation:orientation,
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

    } catch (error) {
      console.log(error);
    }
  })();
  