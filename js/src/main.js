require.config({
    //urlArgs: "bust=" + Date.now()
});

require(['../../js/lib/jquery-1.8.0.min', '../../js/lib/underscore', 'util', 'sound', 'graphics', 'tilemap', 'keyboard-input', 'maploader', 'hero', 'game'], function() {
    "use strict";

    installMixins();

    var graphics = new Graphics(640, 480),
        game = new Game(graphics),
        startFrame,
        endFrame = Date.now(),
        timeScale = 1;

    var addOnRequestAnimationFrame = function(callback) {
        var fun = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 16);
            };
        fun(callback);
    };

    (function(){
        var mapLoader = new MapLoader();
        mapLoader.load('DesertPath').done(function(map) {
            var fieldState = new FieldState(graphics, map);
            game.pushState(fieldState);

            // TODO: send message, don't directly play music...
            SoundManager.playMusic('tombworld' /*map.properties.music*/);
        });
    })();

    addOnRequestAnimationFrame(function mainLoop() {
        startFrame = endFrame;
        game.update(timeScale);
        game.draw(timeScale);
        endFrame = Date.now();
        timeScale = Math.min(3, (timeScale + (endFrame - startFrame) / 30) * 0.5);
        addOnRequestAnimationFrame(mainLoop);
    });

    if ($.browser.msie) {
        alert("Pro tip: Internet Explorer hates this thing, and the feeling is reciprocated.");
    }
});
