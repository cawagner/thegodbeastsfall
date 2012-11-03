define([
    "states/menu-state",
    "states/field-menu-state",
    "states/dialogue-state",
    "states/field-state",
    "states/battle-state",
    "states/transitions/scroll-transition-state",
    "sound"
], function(
    MenuState,
    FieldMenuState,
    DialogueState,
    FieldState,
    BattleState,
    ScrollTransitionState,
    sound
) {
    var oldMusic;

    return {
        init: function(game) {
            // TODO: elsewhere?
            $.subscribe("/menu/open", function(menu) {
                game.pushState(new MenuState(menu));
            });

            // TODO: doesn't go here!
            $.subscribe("/npc/talk", function(messages, npc) {
                var fakeNpc = {
                    lockMovement: _.noop,
                    unlockMovement: _.noop
                };

                npc = npc || fakeNpc;

                npc.lockMovement();

                game.pushState(new DialogueState(messages, function() {
                    npc.unlockMovement();
                }));
            });

            $.subscribe("/hero/menu", function() {
                game.pushState(new FieldMenuState());
            });

            $.subscribe("/map/loading", function() {
                // TODO: really hackish...
                if (game.currentState() instanceof FieldState) {
                    game.popState();
                }
            });

            $.subscribe("/map/loaded", function(map, entrance) {
                var fieldState = new FieldState(map, entrance);
                game.pushState(fieldState);

                sound.playMusic(map.properties.music);
            });

            $.subscribe("/battle/start", function() {
                var battleState = new BattleState();
                var transition = new ScrollTransitionState(battleState);

                oldMusic = sound.getCurrentMusic();

                sound.playMusic("battle");

                game.pushState(transition);
            });

            $.subscribe("/battle/end", function() {
                // TODO: transition!
                sound.playMusic(oldMusic);
                game.popState();
            });
        }
    }
});