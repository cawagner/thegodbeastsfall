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


function goToMap(game, mapName, entrance) {
    var mapLoader = new MapLoader();
    // TODO: really hackish...
    if (game.currentState() instanceof FieldState) {
        game.popState();
    }
    mapLoader.load(mapName).done(function(map) {
        var fieldState = new FieldState(game, map);
        game.pushState(fieldState);

        // TODO: send message, don't directly play music...
        SoundManager.playMusic(map.properties.music);
    });
}

includeAll(requirements, function() {
    "use strict";

    installMixins();

    var graphics = new Graphics(320, 240, 2),
        game = new Game(graphics),
        startFrame,
        endFrame = Date.now(),
        timeScale = 1;

    var addOnRequestAnimationFrame = function(callback, canvas) {
        var fun = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 16);
            };
        fun(callback, canvas);
    };

    goToMap(game, 'DesertPath');

    addOnRequestAnimationFrame(function mainLoop() {
        startFrame = endFrame;
        game.update(timeScale);
        game.draw(timeScale);
        endFrame = Date.now();
        timeScale = Math.min(3, (timeScale + (endFrame - startFrame) / 30) * 0.5);
        addOnRequestAnimationFrame(mainLoop);
    }, document.getElementById("gameCanvas"));

    $("[data-scale]").on("click", function() {
        var scale = parseInt($(this).data("scale"), 10);
        graphics.setScale(scale);
        $("#container").width(320 * scale).height(240 * scale);
    });

    // todo: move elsewhere
    var mouseDown = 0;
    document.body.onmousedown = function() {
      mouseDown = 1;
    }
    document.body.onmouseup = function() {
      --mouseDown;
    }
    $("[data-keycode]").on("mousedown", function() {
        document.onkeydown({ keyCode: parseInt($(this).data("keycode"), 10) });
    }).on("mouseup mouseout", function() {
        document.onkeyup({ keyCode: parseInt($(this).data("keycode"), 10) });
    });

    $("#touchControls").change(function(){
        $("body").toggleClass("touchControls", $(this).is(":checked"));
    });
});
