// TODO: move elsewhere...
SoundManager = (function() {
    var musicAudio;

    return {
        playMusic: function(music) {
            if (musicAudio !== undefined) {
                musicAudio.stop();
            }
            musicAudio = new Audio('assets/mus/' + music + '.ogg');
            musicAudio.volume = 0.5;
            musicAudio.loop = true;
            musicAudio.play();
        }
    };
})();