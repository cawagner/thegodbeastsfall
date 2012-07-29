require.config({

});

require(['graphics', 'battle', 'keyboard-input', 'game'], function() {
    "use strict";
    var game = new Game(new Graphics(640, 480)),
        startFrame,
        endFrame = Date.now(),
        timeScale = 1;

    var addOnRequestAnimationFrame = function(callback) {
        var fun = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame;
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
