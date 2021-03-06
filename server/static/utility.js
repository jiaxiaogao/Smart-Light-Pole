/*
Eclipse Paho MQTT-JS Utility
This utility can be used to test the Eclipse Paho MQTT Javascript client.
*/

// Create a client instance
var client = null;
var connected = false;
logMessage("INFO", "Starting Eclipse Paho JavaScript Utility.");

//启动网页后开启连接
connect();

// called when the client connects
// 这两个在连接成功后都会调用，先调用第一个，再调用第二个
function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  var connectionString = context.invocationContext.host + ":" + context.invocationContext.port + context.invocationContext.path;
  logMessage("INFO", "Connection Success ", "[URI: ", connectionString, ", ID: ", context.invocationContext.clientId, "]");
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Connected to: " + connectionString + " as " + context.invocationContext.clientId;
  connected = true;
		//
		//
		//
  //在这里订阅主题
  subscribe('led0', 0);
  subscribe('t', 0);
  subscribe('h', 0);
  subscribe('button', 0);
  subscribe('oled', 0);

  //发送get_data获取初始的led和oled内容
  //setTimeout(function(){publish('client', 0, 'get_data', false) }, 1000);
  publish('client', 0, 'get_data', false);
}


function onConnected(reconnect, uri) {
  // Once a connection has been made, make a subscription and send a message.
  logMessage("INFO", "Client Has now connected: [Reconnected: ", reconnect, ", URI: ", uri, "]");
  connected = true;
	

}

function onFail(context) {
  logMessage("ERROR", "Failed to connect. [Error Message: ", context.errorMessage, "]");
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Failed to connect: " + context.errorMessage;
  connected = false;
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    logMessage("INFO", "Connection Lost. [Error Message: ", responseObject.errorMessage, "]");
  }
  connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
		logMessage("INFO", "Message Recieved: [Topic: ", message.destinationName, ", Payload: ", message.payloadString, ", QoS: ", message.qos, ", Retained: ", message.retained, ", Duplicate: ", message.duplicate, "]");




  //判断收到的数据，并显示出来
		if(message.destinationName == 'led0'){
				led = document.getElementById("myled0");
				if (message.payloadString == "1")
						led.src="./static/pic_bulbon.gif";
				else
						led.src="./static/pic_bulboff.gif";
		}
		else if(message.destinationName == 't'){
				t = document.getElementById("myt");
				t.innerHTML = message.payloadString;

		}else if(message.destinationName == 'h'){
				h = document.getElementById("myh");
				h.innerHTML = message.payloadString;

		}else if(message.destinationName == 'button'){
				button = document.getElementById("mybutton");
				button.innerHTML = message.payloadString;
				alert("--" + message.payloadString + "--号 灯 杆 发 出 紧 急 求 救 ！！！");
			

		}else if(message.destinationName == 'oled'){
				oled = document.getElementById("myoled");
				oled.value = message.payloadString;

		}

  //数据显示，暂时不管，不影响我的程序运行
  var messageTime = new Date().toISOString();
  // Insert into History Table
  var table = document.getElementById("incomingMessageTable").getElementsByTagName("tbody")[0];
  var row = table.insertRow(0);
  row.insertCell(0).innerHTML = message.destinationName;
  row.insertCell(1).innerHTML = safeTagsRegex(message.payloadString);
  row.insertCell(2).innerHTML = messageTime;
  row.insertCell(3).innerHTML = message.qos;


  if (!document.getElementById(message.destinationName)) {
    var lastMessageTable = document.getElementById("lastMessageTable").getElementsByTagName("tbody")[0];
    var newlastMessageRow = lastMessageTable.insertRow(0);
    newlastMessageRow.id = message.destinationName;
    newlastMessageRow.insertCell(0).innerHTML = message.destinationName;
    newlastMessageRow.insertCell(1).innerHTML = safeTagsRegex(message.payloadString);
    newlastMessageRow.insertCell(2).innerHTML = messageTime;
    newlastMessageRow.insertCell(3).innerHTML = message.qos;

  } else {
    // Update Last Message Table
    var lastMessageRow = document.getElementById(message.destinationName);
    lastMessageRow.id = message.destinationName;
    lastMessageRow.cells[0].innerHTML = message.destinationName;
    lastMessageRow.cells[1].innerHTML = safeTagsRegex(message.payloadString);
    lastMessageRow.cells[2].innerHTML = messageTime;
    lastMessageRow.cells[3].innerHTML = message.qos;
  }


}



function connect() {
  var hostname = "192.168.1.100"; //document.getElementById("hostInput").value;
  var port = '8083';   //document.getElementById("portInput").value;
  var clientId = 'Browser192.168.1.102';// document.getElementById("clientIdInput").value;

  var path = '';//document.getElementById("pathInput").value;
  var user = '';//document.getElementById("userInput").value;
  var pass = '';// document.getElementById("passInput").value;
  var keepAlive = 60;//Number(document.getElementById("keepAliveInput").value);
  var timeout = 3;//Number(document.getElementById("timeoutInput").value);
  var tls = false;//document.getElementById("tlsInput").checked;
  var automaticReconnect = true; //document.getElementById("automaticReconnectInput").checked;
  var cleanSession = true;//document.getElementById("cleanSessionInput").checked;


  if (path.length > 0) {
    client = new Paho.Client(hostname, Number(port), path, clientId);
  } else {
    client = new Paho.Client(hostname, Number(port), clientId);
  }
  logMessage("INFO", "Connecting to Server: [Host: ", hostname, ", Port: ", port, ", Path: ", client.path, ", ID: ", clientId, "]");

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.onConnected = onConnected;


  var options = {
    invocationContext: { host: hostname, port: port, path: client.path, clientId: clientId },
    timeout: timeout,
    keepAliveInterval: keepAlive,
    cleanSession: cleanSession,
    useSSL: tls,
    reconnect: automaticReconnect,
    onSuccess: onConnect,
    onFailure: onFail
  };

  // connect the client
  client.connect(options);
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Connecting...";
}

function disconnect() {
  logMessage("INFO", "Disconnecting from Server.");
  client.disconnect();
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Connection - Disconnected.";
  connected = false;

}

function publish(Topic, Qos, Message, Retain) {
  var topic = Topic;//document.getElementById("publishTopicInput").value;
  var qos = Qos;//document.getElementById("publishQosInput").value;
  var message = Message;//document.getElementById("publishMessageInput").value;
  var retain = Retain;//document.getElementById("publishRetainInput").checked;
  logMessage("INFO", "Publishing Message: [Topic: ", topic, ", Payload: ", message, ", QoS: ", qos, ", Retain: ", retain, "]");
  message = new Paho.Message(message);
  message.destinationName = topic;
  message.qos = Number(qos);
  message.retained = retain;
  client.send(message);
}


function subscribe(Topic, Qos) {
  var topic = Topic;//document.getElementById("subscribeTopicInput").value;
  var qos = Qos;//document.getElementById("subscribeQosInput").value;
  logMessage("INFO", "Subscribing to: [Topic: ", topic, ", QoS: ", qos, "]");
  client.subscribe(topic, { qos: Number(qos) });
}

function unsubscribe(Topic, Qos) {
  var topic = Topic;//document.getElementById("subscribeTopicInput").value;
  logMessage("INFO", "Unsubscribing: [Topic: ", topic, "]");
  client.unsubscribe(topic, {
    onSuccess: unsubscribeSuccess,
    onFailure: unsubscribeFailure,
    invocationContext: { topic: topic }
  });
}


function unsubscribeSuccess(context) {
  logMessage("INFO", "Unsubscribed. [Topic: ", context.invocationContext.topic, "]");
}

function unsubscribeFailure(context) {
  logMessage("ERROR", "Failed to unsubscribe. [Topic: ", context.invocationContext.topic, ", Error: ", context.errorMessage, "]");
}

function clearHistory() {
  var table = document.getElementById("incomingMessageTable");
  //or use :  var table = document.all.tableid;
  for (var i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }

}


// Just in case someone sends html
function safeTagsRegex(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").
    replace(/>/g, "&gt;");
}

function logMessage(type, ...content) {
  var consolePre = document.getElementById("consolePre");
  var date = new Date();
  var timeString = date.toUTCString();
  var logMessage = timeString + " - " + type + " - " + content.join("");
  consolePre.innerHTML += logMessage + "\n";
  if (type === "INFO") {
    console.info(logMessage);
  } else if (type === "ERROR") {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
}

function changeLed()
{
	publish("client", 0, "led0", false);
}

function changeImage1()
{
		element=document.getElementById('myimage1')
		if (element.src.match("bulbon"))
		{
				element.src="./static/pic_bulboff.gif";
		}
		else
		{
				element.src="./static/pic_bulbon.gif";
		}
}

function changeImage2()
{
		element=document.getElementById('myimage2')
		if (element.src.match("bulbon"))
		{
				element.src="./static/pic_bulboff.gif";
		}
		else
		{
				element.src="./static/pic_bulbon.gif";
		}
}
function oledPublish()
{
	oled=document.getElementById('myoled')
	oledMessage = "oled: " + oled.value;
	publish("client", 0, oledMessage, false);

}
