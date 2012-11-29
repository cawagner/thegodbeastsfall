setupMap(function(map) {
    "use strict";

    var Npc = require('actors/npc');
    var gameState = require('game-state');
    var Battle = require('battle');

    var flags = gameState.flags.town = gameState.flags.town || {
        stepsUntilMirvMessage: 750
    };

    var learnAboutMirv = function() {
        flags.stepsUntilMirvMessage -= 250;
        if (flags.stepsUntilMirvMessage < 5) {
            flags.stepsUntilMirvMessage = 5
        }
    };

    var stepSubscription = $.subscribe("/hero/step", function() {
        flags.stepsUntilMirvMessage--;
        if (flags.stepsUntilMirvMessage === 0) {
            new Npc({ archetype: "heroine" }).say([
                "Helt... can you hear me? I am Miav. It is preordained that we work together...",
                "But I came long before you, and was born beyond the boundary of the Fake World...",
                "I sealed myself in the Tomb World so that I would still be able to help when you appeared.",
                "Charon, who maintains the graveyard north of town, can help you release me.",
                "Please, if you can hear me..."
            ]);
        }
    });

    map.npcs.earl2.onTalk = function() {
        var earl = this;
        this.say([
            "No need to thank me. Just take this."
        ]).done(function() {
            if (gameState.inventory.addItem("potion", 1)) {
                earl.say(["I gave you a potion."]);
            } else {
                earl.say(["Nevermind. You've already got potions out the wazoo."]);
            }
        });
    };

    map.npcs.barrel1.onTalk = function() {
        new Battle(["slime", "rat", "slime"]).start();
    };

    map.onUnload = function() {
        $.unsubscribe(stepSubscription);
    };

    map.npcs.oldman.addBeforeTalk(learnAboutMirv);
    map.npcs.littlegirl.addBeforeTalk(learnAboutMirv);
    map.npcs.earl.addBeforeTalk(learnAboutMirv);
});
