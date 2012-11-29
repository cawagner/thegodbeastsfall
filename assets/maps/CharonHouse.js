setupMap(function(map) {
    "use strict";

    var Npc = require('actors/npc');
    var Battle = require('battle');
    var gameState = require('game-state');

    var flags = gameState.flags.charonsHouse = gameState.flags.charonsHouse || {
        haveDrachma: false,
        beatenClurichaun: false
    };

    var clurichaun = map.npcs.clurichaun;

    var moveClurichaunInFrontOfDoor = function() {
        clurichaun.warpTo(1, 13);
    };

    if (flags.haveDrachma && !flags.beatenClurichaun) {
        moveClurichaunInFrontOfDoor();
    }

    clurichaun.addAfterTalk(function() {
        var battle = new Battle(["clurichaun"], { isBoss: true });
        battle.onWon = function() {
            flags.beatenClurichaun = true;
            clurichaun.runDialogue("lost").done(function() {
                map.removeActor(clurichaun);
            });
        };
        battle.onRan = function() {
            clurichaun.runDialogue("ran");
        };
        battle.start();
    });

    map.npcs.drachma.addBeforeTalk(function() {
        return !flags.haveDrachma;
    });
    map.npcs.drachma.addBeforeTalk(function() {
        flags.haveDrachma = true;
        moveClurichaunInFrontOfDoor();
    });

    _(map.npcs.drachma).chain().clone().tap(function(d2) {
        d2.warpTo(map.npcs.drachma.x - 1, map.npcs.drachma.y);
        map.addActor(d2);
    });
});