define(['actors/npc', 'battle', 'game-state'], function(Npc, Battle, gameState) {
    "use strict";

    var flags = gameState.flags.charonsHouse = gameState.flags.charonsHouse || {
        haveDrachma: false,
        beatenClurichaun: false
    };

    return function(map) {
        var clurichaun = map.npcs.clurichaun;

        var moveClurichaunInFrontOfDoor = function() {
            clurichaun.warpTo(1, 13);
        };

        if (flags.haveDrachma && !flags.beatenClurichaun) {
            moveClurichaunInFrontOfDoor();
        }

        clurichaun.on('afterTalk', function() {
            var battle = new Battle(["clurichaun"], { isBoss: true });
            battle.onWon = function() {
                flags.beatenClurichaun = true;
                clurichaun.runDialogue("lost").then(function() {
                    map.removeActor(clurichaun);
                });
            };
            battle.onRan = function() {
                clurichaun.runDialogue("ran");
            };
            battle.start();
        });

        map.npcs.drachma.on('beforeTalk', function(e) {
            if (flags.haveDrachma) {
                e.preventDefault();
            }
        });
        map.npcs.drachma.on('beforeTalk', function() {
            flags.haveDrachma = true;
            moveClurichaunInFrontOfDoor();
        });

        _(map.npcs.drachma).chain().clone().tap(function(d2) {
            d2.warpTo(map.npcs.drachma.x - 1, map.npcs.drachma.y);
            map.addActor(d2);
        });
    };
});