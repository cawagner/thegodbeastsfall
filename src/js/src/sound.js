define([], function() {
    "use strict";

    var musicAudio, currentMusic, cachedSounds = {};

    // Sometimes Chrome doesn't even expose the Audio type if audio is
    // unavailable
    var FakeAudio = function() { };
    FakeAudio.prototype.canPlayType = function() {
        return false;
    };
    FakeAudio.prototype.pause =
    FakeAudio.prototype.play =
    FakeAudio.prototype.addEventListener = function() { };

    var Sound = Audio || FakeAudio;

    var soundManager = {
        playMusic: function(music) {
            if (currentMusic === music) {
                return;
            }
            currentMusic = music;
            if (musicAudio !== undefined) {
                musicAudio.pause();
            }
            musicAudio = new Sound();
            if (musicAudio.canPlayType('audio/ogg') !== "") {
                musicAudio.type = "audio/ogg";
                musicAudio.src = 'assets/mus/' + music + '.ogg';
            } else {
                musicAudio.type = "audio/mpeg";
                musicAudio.src = 'assets/mus/' + music + '.mp3';
            }
            musicAudio.volume = 0.5;
            if (typeof musicAudio.loop === "boolean") {
                musicAudio.loop = true;
            } else {
                musicAudio.addEventListener('ended', function() {
                    this.currentTime = this.startTime;
                    this.play();
                }, false);
            }
            musicAudio.play();
        },
        loadSound: function(name) {
            var audio = new Sound('assets/snd/' + name + ".wav");
            audio.autoplay = false;
            audio.preload = true;
            cachedSounds[name] = audio;
        },
        playSound: function(name) {
            new Sound('assets/snd/' + name + ".wav").play();
        },
        getCurrentMusic: function() {
            return currentMusic;
        }
    };

    return soundManager;
});