define([
    "underscore",
    "states/menu-state",
    "states/field-menu-state",
    "states/dialogue-state",
    "states/field-state",
    "states/battle-state",
    "states/status-state",
    "states/transitions/scroll-transition-state",
    "sound"
], function(
    _,
    MenuState,
    FieldMenuState,
    DialogueState,
    FieldState,
    BattleState,
    StatusState,
    ScrollTransitionState,
    sound
) {
    "use strict";

    var oldMusic;
    var fakeNpc = {
        lockMovement: _.noop,
        unlockMovement: _.noop
    };

    return {
        init: function(game) {

            // TODO: move asset loading into common location that isn't here!
            var isMobile = navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry/i);

            sound.loadSound("hit");
            sound.loadSound("miss");
            sound.loadSound("critical");
            sound.loadSound("message");
            sound.loadSound("cursor");
            sound.loadSound("confirm");
            sound.loadSound("cancel");

            var inDungeon = false;

            // TODO: elsewhere?
            $.subscribe("/menu/open", function(menu) {
                game.pushState(new MenuState(menu));
            });

            // TODO: doesn't go here!
            $.subscribe("/npc/talk", function(messages, npc) {
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


            $.subscribe("/music/play", function(name) {
                sound.playMusic(name);
            });

            if (!isMobile) {
                $.subscribe("/sound/play", function(name) {
                    sound.playSound(name);
                });
            }

            $.subscribe("/map/loaded", function(map, entrance) {
                var fieldState = new FieldState(map, entrance);
                game.pushState(fieldState);

                sound.playMusic(map.properties.music);

                // TODO: ugly, ugly!
                GameState.instance.location.currentMap = map.name;

                // HACKY!
                inDungeon = map.properties.isDungeon;
                if (!inDungeon) {
                    $.publish("/party/heal");
                }
            });

            $.subscribe("/battle/start", function(enemies, flags) {
                var battleState = new BattleState(enemies);
                var transition = new ScrollTransitionState(battleState);

                oldMusic = sound.getCurrentMusic();

                $.publish("/sound/play", ["battlestart"]);
                if (flags && flags.isBoss) {
                    sound.playMusic("boss");
                } else {
                    sound.playMusic("battle");
                }

                game.pushState(transition);
            });

            $.subscribe("/battle/end", function() {
                // TODO: transition!
                sound.playMusic(oldMusic);
                game.popState();

                // TODO: ugly, ugly!
                _(GameState.instance.party).each(function(character) {
                    character.hp = Math.max(1, character.hp);
                });

                // HACKY...
                if (!inDungeon) {
                    $.publish("/party/heal");
                }
            });

            $.subscribe("/status/show", function(member) {
                game.pushState(new StatusState(member));
            });

            $.subscribe("/party/heal", function() {
                var anyHealing = false;
                _(GameState.instance.party).each(function(member) {
                    if (member.hp !== member.maxHp || member.mp !== member.maxMp) {
                        anyHealing = true;
                        member.hp = member.maxHp;
                        member.mp = member.maxMp;
                    }
                });
                if (anyHealing) {
                    $.publish("/npc/talk", [{
                        text: ["You have been fully healed."]
                    }]);
                }
            });
        }
    }
});