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
            new Battle(["clurichaun"], { isBoss: true })
                .on('won', function() {
                    flags.beatenClurichaun = true;
                    clurichaun.runDialogue("lost").then(function() {
                        map.removeActor(clurichaun);
                    });
                })
                .on('ran', function() {
                    clurichaun.runDialogue("ran");
                })
                .start();
        });

        map.npcs.drachma.on('beforeTalk', function(e) {
            if (flags.haveDrachma) {
                e.preventDefault();
            } else {
                flags.haveDrachma = true;
                moveClurichaunInFrontOfDoor();
            }
        });
    };
});