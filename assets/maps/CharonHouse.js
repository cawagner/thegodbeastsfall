setupMap(function(map) {
    var Npc = require('actors/npc');
    var Battle = require('battle');
    var gameState = require('game-state');

    var flags = gameState.flags.charonsHouse = gameState.flags.charonsHouse || {
        haveDrachma: false,
        beatenClurichaun: false
    };

    var clurichaun = map.npcs.clurichaun;

    map.onLoad = function() {
        if (flags.haveDrachma && !flags.beatenClurichaun) {
            // put the clurichaun in front of the door
            clurichaun.warpTo(1, 13);
        }
    };

    clurichaun.addAfterTalk(function() {
        var battle = new Battle(["clurichaun"], { isBoss: true });
        battle.onWon = function() {
            flags.beatenClurichaun = true;
            clurichaun.say([
                "Fine... beat up a helpless faerie.",
                "Look at you with your big, strong human muscles.",
                "I hope you're really proud of yourself."
            ]).done(function() {
                map.removeActor(clurichaun);
            });
        };
        battle.onRan = function() {
            clurichaun.say([
                "Look at you, running from a little leprechaun!",
                "Hows them pots o' gold?"
            ]);
        };
        battle.start();
    });

    map.npcs.drachma.addBeforeTalk(function() {
        return !flags.haveDrachma;
    });
    map.npcs.drachma.addBeforeTalk(function() {
        flags.haveDrachma = true;
        map.onLoad();
    });
});