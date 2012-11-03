define([], function() {
    "use strict";

    var musicAudio, currentMusic;

    var soundManager = {
        playMusic: function(music) {
            currentMusic = music;
            if (musicAudio !== undefined) {
                musicAudio.pause();
            }
            musicAudio = new Audio('assets/mus/' + music + '.ogg');
            musicAudio.volume = 0.5;
            //if (typeof musicAudio.loop === "boolean") {
            //    musicAudio.loop = true;
            //} else {
                musicAudio.addEventListener('ended', function() {
                    this.currentTime = this.startTime;
                    this.play();
                }, false);
            //}
            musicAudio.play();
        },
        getCurrentMusic: function() {
            return currentMusic;
        }
    };

    return soundManager;
});