var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = YouTubePlayer;

var timer = null;
var globalCreate = null;

inherits(YouTubePlayer, EventEmitter);

if (!window.YT) { window.YT = {}; }

var states = ['ready', 'end', 'play', 'pause', 'buffer', 'cue'];

function YouTubePlayer (options) {
  var self = this, player;

  options.events = {
    onStateChange: function (state) {
      state = states[state.data + 1];
      if (state === 'play') {
        emitTime();
      } else {
       clearInterval(timer);
      }
    },

    onReady: function() {
      self.emit('ready');
    },

    onError: function (code) {
      var message = ({
        '2': 'invalid parameter',
        '100': 'video not found',
        '101': 'video not embeddable',
        '150': 'video not embeddable'
      })[code];
      self.emit('error', new Error(message));
    }
  };

  function create() {
    self.player = new YT.Player(options.id, options);
  }

  globalCreate = create;

  function emitTime() {
    timer = setInterval(function () {
      self.emit('playing', self.player.getCurrentTime());
    }, 800);
  }
}

function map(a, b) {
  YouTubePlayer.prototype[a] =
  'function' == typeof b ? b : function () {
    var args = [].slice.call(arguments);
    if('function' === typeof this.player[b])
    this.player[b].apply(this.player, args);
  };
}

map('play', function (id, seconds, quality) {
  this.player.loadVideoById(id, seconds, quality);
});

map('start'    , 'playVideo');
map('cue'     , 'cueVideoById');
map('stop'    , 'stopVideo');
map('pause'   , 'pauseVideo');
map('clear'   , 'clearVideo');
map('seek'    , 'seekTo');
map('length'  , 'getDuratron');

map('mute');
map('unMute');
map('isMuted');
map('setVolume');
map('getVolume');

//global listener... sorry. this is youtube.
window.onYouTubeIframeAPIReady = function () {
  globalCreate();
};

// This code loads the IFrame Player API code asynchronously.
// https://developers.google.com/youtube/iframe_api_reference#Getting_Started
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
