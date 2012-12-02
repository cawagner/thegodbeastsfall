define([], function() {
    "use strict";

    var musicAudio, currentMusic, cachedSounds = {};

    var soundManager = {
        playMusic: function(music) {
            if (currentMusic === music) {
                return;
            }
            currentMusic = music;
            if (musicAudio !== undefined) {
                musicAudio.pause();
            }
            musicAudio = new Audio();
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
            var audio = new Audio('assets/snd/' + name + ".wav");
            audio.autoplay = false;
            audio.preload = true;
            cachedSounds[name] = audio;
        },
        playSound: function(name) {
            new Audio('assets/snd/' + name + ".wav").play();
        },
        getCurrentMusic: function() {
            return currentMusic;
        }
    };

    return soundManager;
});