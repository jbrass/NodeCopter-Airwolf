var sio = io.connect('http://localhost:4000');

sio.on('dump', function(data){
  $('textarea#commands').val(data)
})

sio.on('altitude', function(data){
  $('input#altitude').val(data)
})


sio.on('stats', function(data){
  //$('input#altitude').val(data)
  console.log(data);
  $altitudeMeters.val((data.altitudeMeters * 100));
  $batteryPercentage.val(data.batteryPercentage);
  $clockwiseDegrees.val(data.clockwiseDegrees);
  $controlState.val(data.controlState);
  $flyState.val(data.flyState);

  $frontBackDegrees.val(data.frontBackDegrees);
  $leftRightDegrees.val(data.leftRightDegrees);
  compass_draw(data.clockwiseDegrees);
})

jQuery(function(){
  $('form#controls').on('submit', function (e) {
    script = $('textarea#commands').val()
    console.log('playing back', script)
    e.preventDefault();

    sio.emit('playback', script)
  });
  
  $altitudeMeters = $('#altitudeMeters');
  $batteryPercentage= $('#batteryPercentage')
  $clockwiseDegrees= $('#clockwiseDegrees')
  $controlState= $('#controlState')
  $flyState= $('#flyState')

  $frontBackDegrees= $('#frontBackDegrees')
  $leftRightDegrees= $('#leftRightDegrees')
  
  init_compass();
})
