var fs = require('fs')
  , connect = require('connect')
  , app = connect()
  , arDrone = require('ar-drone')
  , drone = arDrone.createClient()
  , io = require('socket.io').listen(4000)
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({server: app})
  , recordState = []
  , timeline = require('./timeline')
  

drone.disableEmergency();

var t = timeline(drone).record();

app.use(connect.static(__dirname+'/public'));  
  
drone.disableEmergency();

var j=0;

drone.on('navdata', function(data) {
	  var target;
	  if (data.demo) {
	    altitude = data.demo.altitudeMeters * 100;
	    if(j%5==0){
	    	io.sockets.emit('stats',data.demo);
	    }
	    j++;
	  }
	});

var t = timeline(drone).record();

app.use(connect.static(__dirname));

app.listen(3000);

var throttleValue = 0.5
io.set('log level', 1)

io.sockets.on('connection', function (socket) {
  socket.on('keydown', function (command) {
    var tv = throttleValue;

    if (['up', 'down', 'clockwise', 'counterClockwise'].indexOf(command) !== -1) {
      tv = 1;
    }

    console.log('down', command);
    if(command == 'flip')
    {
      drone.animate('flipAhead', 15)
    }
    else
    {
      drone[command](tv);
    }
  })
  socket.on('keyup', function (command) {
    if(command == 'takeoff' || command == 'land' || command == 'flip')
    {
      return
    }
    recordState.push({ command: command, deg: 0, timestamp: Date.now() })
    drone[command](0);
    console.log('up', command);
  })

  socket.on('dump', function () {
    socket.emit('dump', t.toString());
  }).on('playback', function (script) {
    console.log('playing back.', script)
    t.playback();
  })
});

wss.on('connection', function (wsocket) {
	///*
    var tcpVideoStream = new arDrone.Client.PngStream.TcpVideoStream({timeout: 4000}),
        Parser = require('./lib/PaVEParser'),
        p = new Parser();

    // TODO: handle client disconnect
    p.on('data', function (data) {
    	wsocket.send(data, {binary: true});
    });

    tcpVideoStream.connect(function () {
        tcpVideoStream.pipe(p);
    });
    //*/
});

process.on('exit', function () {
  console.log('killing drone - BANG!!!');
  drone.land();
});








