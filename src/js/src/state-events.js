define([
    "radio",
    "states/menu-state",
    "states/dialogue-state",
    "states/field-state",
    "states/battle-state",
    "states/status-state",
    "states/transitions/scroll-transition-state",
    "states/transitions/fade-transition-state",
    "menus/field/root",
    "game-state",
    "sound",
    "game"
], function(
    radio,
    MenuState,
    DialogueState,
    FieldState,
    BattleState,
    StatusState,
    ScrollTransitionState,
    FadeTransitionState,
    fieldMenu,
    gameState,
    sound,
    game
) {
    "use strict";

    var oldMusic;
    var fakeNpc = {
        lockMovement: function() {},
        unlockMovement: function() {}
    };

    var firstMap = true;
    var inDungeon = false;
    var inBattle = false;

    return {
        init: function() {
            // TODO: move asset loading into common location that isn't here!
            sound.loadSound("hit");
            sound.loadSound("playerhit");
            sound.loadSound("soft");
            sound.loadSound("miss");
            sound.loadSound("critical");
            sound.loadSound("message");
            sound.loadSound("cursor");
            sound.loadSound("confirm");
            sound.loadSound("cancel");
            sound.loadSound("heal");
            sound.loadSound("goofy");
            sound.loadSound("feu");

            // TODO: elsewhere?
            radio("/menu/open").subscribe(function(menu) {
                game.pushState(new MenuState(menu));
            });

            // TODO: doesn't go here!
            radio("/npc/talk").subscribe(function(messages, npc) {
                npc = npc || fakeNpc;

                npc.lockMovement();

                game.pushState(new DialogueState(messages, function() {
                    npc.unlockMovement();
                }));
            });

            radio("/hero/menu").subscribe(function() {
                fieldMenu().open();
            });

            radio("/map/loading").subscribe(function() {
                // TODO: really hackish...
                if (game.currentState() instanceof FieldState) {
                    game.popState();
                }
            });

            radio("/map/loaded").subscribe(function(map, entrance) {
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
                    radio("/party/heal").broadcast();
                }
            });

            radio("/battle/start").subscribe(function(enemies, flags) {
                var battleState, transition;

                if (inBattle)
                    return;

                inBattle = true;

                battleState = new BattleState(enemies);
                transition = new ScrollTransitionState(battleState);

                oldMusic = sound.getCurrentMusic();

                sound.playSound("battlestart");
                if (flags && flags.isBoss) {
                    sound.playMusic("boss");
                } else {
                    sound.playMusic("battle");
                }

                game.pushState(transition);
            });

            radio("/battle/end").subscribe(function() {
                inBattle = false;
                // TODO: transition!
                sound.playMusic(oldMusic);
                game.popState();

                // TODO: ugly, ugly!
                gameState.party.forEach(function(character) {
                    character.hp = Math.max(1, character.hp);
                });

                // HACKY...
                if (!inDungeon) {
                    radio("/party/heal").broadcast();
                }
            });

            radio("/status/show").subscribe(function(member) {
                game.pushState(new StatusState(member));
            });

            radio("/party/heal").subscribe(function() {
                var anyHealing = false;
                gameState.party.forEach(function(member) {
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

            radio("/game/new").subscribe(function() {
                gameState.newGame();
            });
        }
    }
});