var dependencies = [
    'jquery',
    'underscore',
    // Classes
    'graphics',
    'display/actor-renderer',
    'display/tilemap-view',
    'menu',
    'game-state',
    'gui',
    'states/field-menu-state',
    'states/menu-state',
    // Just return objects
    'map-loader',
    'pawns/pawns',
    'keyboard-input',
    'touch-input',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, _, Graphics, ActorRenderer, TilemapView, Menu, GameState, GuiRenderer, FieldMenuState, MenuState, mapLoader, pawns, input, touchInput) {
    "use strict";

    // TODO: we'll fix this madness ASAP...
    window.ActorRenderer = ActorRenderer;
    window.CharacterPawn = pawns.CharacterPawn;
    window.TilemapView = TilemapView;
    window.Menu = Menu;
    window.GameState = GameState;
    window.GuiRenderer = GuiRenderer;
    window.FieldMenuState = FieldMenuState;

    window.goToMap = mapLoader.goToMap;

    var requirements = [
        'util',
        'actors/actor',
        'actors/hero',
        'actors/npc',
        'pawns/character-pawn',
        'states/transitions/scroll-transition-state',
        'states/field-state',
        'states/dialogue-state',
        'states/main-menu-state',
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