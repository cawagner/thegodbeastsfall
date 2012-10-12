var dependencies = [
    'jquery',
    'underscore',
    // Classes
    'graphics',
    'menu',
    'states/field-menu-state',
    'states/menu-state',
    'states/main-menu-state',
    'states/field-state',
    // Just return objects
    'pawns/pawns',
    'keyboard-input',
    'touch-input',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, _, Graphics, Menu, FieldMenuState, MenuState, MainMenuState, FieldState, pawns, input, touchInput) {
    "use strict";

    // TODO: we'll fix this madness ASAP...
    window.FieldMenuState = FieldMenuState;
    window.MainMenuState = MainMenuState;
    window.FieldState = FieldState;

    var requirements = [
        'util',
        'actors/actor',
        'actors/hero',
        'actors/npc',
        'pawns/character-pawn',
        'states/transitions/scroll-transition-state',
        'states/field-state',
        'states/dialogue-state',
        'game'
    ];

    var includeAll = function(scripts, done) {
        var index = 0;
        var getScript = function() {
            if (index >= scripts.length) {
                return done();
            }
            $.getScript("js/src/" + scripts[index] + ".js").done(getScript);
            ++index;
        };
        getScript();
    };

    var allIncluded = function() {
        var graphics = new Graphics("gameCanvas", 320, 240, 2),
            game = new Game(graphics, input),
            startFrame,
            endFrame = Date.now(),
            collected = 0,
            timeScale = 1;

        var requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    setTimeout(callback, 16);
                };

        requestAnimationFrame(function mainLoop() {
            startFrame = endFrame;

            while (collected >= 8) {
                game.update(timeScale);
                collected -= 8;
            }
            game.draw(timeScale);
            endFrame = Date.now();
            collected += Math.min(16 * 3, endFrame - startFrame);

            requestAnimationFrame(mainLoop);
        }, document.getElementById("gameCanvas"));

        $("[data-scale]").on("click", function() {
            var scale = parseInt($(this).data("scale"), 10);
            graphics.setScale(scale);
            $("#container").width(320 * scale).height(240 * scale);
        });

        input.init();
        touchInput.init(input);

        // TODO: elsewhere?
        $.subscribe("/menu/open", function(menu) {
            game.pushState(new MenuState(menu));
        });
    };

    return {
        init: function() {
            includeAll(requirements, allIncluded);
        }
    };
});