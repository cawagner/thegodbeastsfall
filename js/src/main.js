var requirements = [
    '../lib/underscore',
    'util',
    'sound',
    'graphics',
    'tilemap',
    'keyboard-input',
    'maploader',
    'actor',
    'hero',
    'states/field-state',
    'states/dialogue-state',
    'game'
];

function includeAll(scripts, done) {
    var index = 0;
    var getScript = function() {
        if (index >= scripts.length) {
            return done();
        }
        $.getScript("js/src/" + scripts[index] + ".js").done(getScript);
        ++index;
    };
    getScript();
}

includeAll(requirements, function() {
    "use strict";

    installMixins();

    var graphics = new Graphics(320, 240, 2),
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
            var fieldState = new FieldState(game, map);
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
