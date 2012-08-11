require.config({
    //urlArgs: "bust=" + Date.now()
});

require(['../../js/lib/jquery-1.8.0.min', '../../js/lib/underscore', 'util', 'graphics', 'tilemap', 'keyboard-input', 'maploader', 'hero', 'game'], function() {
    "use strict";
    
    installMixins();

    var game = new Game(new Graphics(640, 480)),
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

    addOnRequestAnimationFrame(function mainLoop() {
        startFrame = endFrame;
        game.update(timeScale);
        game.draw(timeScale);
        endFrame = Date.now();
        timeScale = Math.min(3, (timeScale + (endFrame - startFrame) / 30) * 0.5);
        addOnRequestAnimationFrame(mainLoop);
    });
});
