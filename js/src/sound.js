define([], function() {
    "use strict";

    var musicAudio;

    var soundManager = {
        playMusic: function(music) {
            if (musicAudio !== undefined) {
                musicAudio.pause();
            }
            musicAudio = new Audio('assets/mus/' + music + '.ogg');
            musicAudio.volume = 0.5;
            musicAudio.addEventListener('ended', function() {
                this.currentTime = this.startTime;
                this.play();
            }, false);
            musicAudio.play();
        }
    };

    return soundManager;
});