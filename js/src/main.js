var requirements = [
    'util',
    'sound',
    'graphics',
    'gui',
    'tilemap',
    'keyboard-input',
    'map-loader',
    'actors/actor',
    'actors/hero',
    'actors/npc',
    'character',
    'states/field-state',
    'states/dialogue-state',
    'states/field-menu-state',
    'states/main-menu-state',
    'game',
    'dice'
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
        delta,
        collected = 0,
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

    addOnRequestAnimationFrame(function mainLoop() {
        startFrame = endFrame;

        while (collected >= 8) {
            game.update(timeScale);
            collected -= 8;
        }
        game.draw(timeScale);
        endFrame = Date.now();
        delta = endFrame - startFrame;
        collected += Math.min(16 * 3, delta);

        addOnRequestAnimationFrame(mainLoop);
    }, document.getElementById("gameCanvas"));

    $("[data-scale]").on("click", function() {
        var scale = parseInt($(this).data("scale"), 10);
        graphics.setScale(scale);
        $("#container").width(320 * scale).height(240 * scale);
    });

    // todo: move elsewhere
    $("[data-keycode]").on("touchstart", function() {
        document.onkeydown({ keyCode: parseInt($(this).data("keycode"), 10) });
    }).on("touchend", function() {
        document.onkeyup({ keyCode: parseInt($(this).data("keycode"), 10) });
    }).on("click", function(){
        return false;
    });

    $("#touchControls").change(function(){
        $("body").toggleClass("touchControls", $(this).is(":checked"));
    });

    document.body.ontouchmove = function(e) {
        e.preventDefault();
    };
});
