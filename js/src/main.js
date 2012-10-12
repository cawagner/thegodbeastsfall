var dependencies = [
    'jquery',
    'underscore',
    // Classes
    'graphics',
    'dice',
    'character',
    'display/actor-renderer',
    'display/tilemap-view',
    'menu',
    'map-loader',
    // Just return objects
    'tilemap',
    'pawns/pawns',
    'keyboard-input',
    'touch-input',
    'sound',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, _, Graphics, Dice, Character, ActorRenderer, TilemapView, Menu, MapLoader, tilemap, pawns, input, touchInput, sound) {
    "use strict";

    // TODO: we'll fix this madness ASAP...
    window.Dice = Dice;
    window.ActorRenderer = ActorRenderer;
    window.Character = Character;
    window.CharacterPawn = pawns.CharacterPawn;
    window.Menu = Menu;
    window.TilemapView = TilemapView;
    window.Tilemap = tilemap.Tilemap;
    window.Map = tilemap.Map;
    window.MapLoader = MapLoader;

    var requirements = [
        'util',
        'gui',
        'actors/actor',
        'actors/hero',
        'actors/npc',
        'pawns/character-pawn',
        'game-state',
        'states/transitions/scroll-transition-state',
        'states/field-state',
        'states/dialogue-state',
        'states/menu-state',
        'states/field-menu-state',
        'states/main-menu-state',
        'states/status-state',
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

        sound.init();

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