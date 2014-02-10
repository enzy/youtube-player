var events = require('events');
var EventEmitter = new events.EventEmitter();

var player = null;
var options = {};
var state;
var states = ['ready', 'end', 'play', 'pause', 'buffer', 'cue'];
var timer = null;

EventEmitter.play = function (videoId) {
  player.loadVideoById(videoId);
};

loadIframePlayer();

//global listener... sorry. this is youtube.
window.onYouTubeIframeAPIReady = function () {
  options.events = {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange,
    'onError': onError
  };

  player = new YT.Player(options.id, options);
};

function onPlayerReady(event) {
  EventEmitter.emit('ready');
}

function onPlayerStateChange(state) {
  state = states[state.data + 1];

  if (state === 'play') {
    emitTime();
  } else {
   clearInterval(timer);
  }
}

function onError(code) {
  var message = ({
    '2': 'invalid parameter',
    '100': 'video not found',
    '101': 'video not embeddable',
    '150': 'video not embeddable'
  })[code];

  EventEmitter.emit('error', new Error(message));
}

function emitTime() {
  timer = setInterval(function () {
    EventEmitter.emit('playing', player.getCurrentTime());
  }, 800);
}

// Loads the IFrame Player API code asynchronously.
// https://developers.google.com/youtube/iframe_api_reference#Getting_Started
function loadIframePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

module.exports = function (opt) {
  options = opt;

  return EventEmitter;
};
