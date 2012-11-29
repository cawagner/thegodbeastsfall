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
            map.npcs.mirvMessage.runDialogue("say");
        }
    });

    map.onUnload = function() {
        $.unsubscribe(stepSubscription);
    };

    map.npcs.oldman.addBeforeTalk(learnAboutMirv);
    map.npcs.littlegirl.addBeforeTalk(learnAboutMirv);
    map.npcs.earl.addBeforeTalk(learnAboutMirv);

    map.npcs.earl2.addAfterTalk(function() {
        if (gameState.inventory.addItem("potion", 1)) {
            this.runDialogue("potion");
        } else {
            this.runDialogue("wazoo");
        }
    });

    map.npcs.barrel1.addAfterTalk(function() {
        new Battle(["slime", "rat", "slime"]).start();
    });
});
