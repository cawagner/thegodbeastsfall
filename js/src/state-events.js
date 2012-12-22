define([
    "underscore",
    "pubsub",
    "states/menu-state",
    "states/field-menu-state",
    "states/dialogue-state",
    "states/field-state",
    "states/battle-state",
    "states/status-state",
    "states/transitions/scroll-transition-state",
    "states/transitions/fade-transition-state",
    "game-state",
    "sound",
    "game"
], function(
    _,
    pubsub,
    MenuState,
    FieldMenuState,
    DialogueState,
    FieldState,
    BattleState,
    StatusState,
    ScrollTransitionState,
    FadeTransitionState,
    gameState,
    sound,
    game
) {
    "use strict";

    var oldMusic;
    var fakeNpc = {
        lockMovement: _.noop,
        unlockMovement: _.noop
    };

    var firstMap = true;

    return {
        init: function() {

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
            pubsub.subscribe("/menu/open", function(menu) {
                game.pushState(new MenuState(menu));
            });

            // TODO: doesn't go here!
            pubsub.subscribe("/npc/talk", function(messages, npc) {
                npc = npc || fakeNpc;

                npc.lockMovement();

                game.pushState(new DialogueState(messages, function() {
                    npc.unlockMovement();
                }));
            });

            pubsub.subscribe("/hero/menu", function() {
                game.pushState(new FieldMenuState());
            });

            pubsub.subscribe("/map/loading", function() {
                // TODO: really hackish...

                if (game.currentState() instanceof FieldState) {
                    game.popState();
                }
            });


            pubsub.subscribe("/music/play", function(name) {
                sound.playMusic(name);
            });

            if (!isMobile) {
                pubsub.subscribe("/sound/play", function(name) {
                    sound.playSound(name);
                });
            }

            pubsub.subscribe("/map/loaded", function(map, entrance) {
                var fieldState = new FieldState(map, entrance);

                if (firstMap) {
                    firstMap = false;
                    game.pushState(fieldState);
                } else {
                    game.pushState(new FadeTransitionState(fieldState));
                }

                sound.playMusic(map.properties.music);

                // TODO: ugly, ugly!
                gameState.location.currentMap = map.name;

                // HACKY!
                inDungeon = map.properties.isDungeon;
                if (!inDungeon) {
                    pubsub.publish("/party/heal");
                }
            });

            pubsub.subscribe("/battle/start", function(enemies, flags) {
                var battleState = new BattleState(enemies);
                var transition = new ScrollTransitionState(battleState);

                oldMusic = sound.getCurrentMusic();

                pubsub.publish("/sound/play", ["battlestart"]);
                if (flags && flags.isBoss) {
                    sound.playMusic("boss");
                } else {
                    sound.playMusic("battle");
                }

                game.pushState(transition);
            });

            pubsub.subscribe("/battle/end", function() {
                // TODO: transition!
                sound.playMusic(oldMusic);
                game.popState();

                // TODO: ugly, ugly!
                _(gameState.party).each(function(character) {
                    character.hp = Math.max(1, character.hp);
                });

                // HACKY...
                if (!inDungeon) {
                    pubsub.publish("/party/heal");
                }
            });

            pubsub.subscribe("/status/show", function(member) {
                game.pushState(new StatusState(member));
            });

            pubsub.subscribe("/party/heal", function() {
                var anyHealing = false;
                _(gameState.party).each(function(member) {
                    if (member.hp !== member.maxHp || member.mp !== member.maxMp) {
                        anyHealing = true;
                        member.hp = member.maxHp;
                        member.mp = member.maxMp;
                    }
                });
                if (anyHealing) {
                    // TODO: notify user that they've been healed in some way...
                }
            });

            pubsub.subscribe("/game/new", function() {
                gameState.newGame();
            });
        }
    }
});