function piggyback(method, obj, fn) {
  var _old = obj[method];
  obj[method] = function () {
    fn.apply(this, arguments);
    _old.apply(obj, arguments);
  }
}

module.exports = function (drone) {
  var commands = [],
      droneCommands = ['up', 'down', 'left', 'right', 'front', 'back', 'clockwise', 'counterClockwise', 'takeoff', 'land', 'stop', 'animate'],
      startTime = null,
      playing = false;

  var timeline = {
    toString: function () {
      return JSON.stringify(commands);
    },
    record: function (client) {
      startTime = Date.now();
      droneCommands.forEach(function (method) {
        piggyback(method, drone, function () {
          console.log(method, [].slice.apply(arguments));
          if (!playing) {
            commands.push({ method: method, args: [].slice.apply(arguments), when: Date.now() - startTime });
          }
        });
      });
      return timeline;
    },
    reset: function () {
      commands = [];
    },
    playback: function (cmds) {
      console.log('playing back');
      cmds || (cmds = commands);
      playing = true;
      cmds.forEach(function (command) {
        setTimeout(function () {
          drone[command.method].apply(drone, command.args);
        }, command.when);
      });

      if (cmds.length) {
        setTimeout(function () {
          console.log('stop playback');
          playback = false;
        }, cmds[cmds.length - 1].when+1);
      }

      return timeline;
    }
  };

  return timeline;
};