define(["game-state", "battle"], function(gameState, Battle) {
    "use strict";

    var flags = gameState.flags.town = gameState.flags.town || {
        stepsUntilMirvMessage: 750,
        knowAboutMirv: false
    };

    var learnAboutMirv = function() {
        flags.stepsUntilMirvMessage -= 250;
        if (flags.stepsUntilMirvMessage < 5) {
            flags.stepsUntilMirvMessage = 5
        }
    };

    return function setupMap(map) {
        [map.npcs.oldman, map.npcs.littlegirl, map.npcs.earl].forEach(function(npc) {
            npc.addBeforeTalk(learnAboutMirv);
        });

        map.npcs.barrel1.addAfterTalk(function() {
            new Battle(["slime", "rat", "slime"]).start();
        });

        map.subscribe("/hero/step", function() {
            if (flags.knowAboutMirv)
                return;
            flags.stepsUntilMirvMessage--;
            if (flags.stepsUntilMirvMessage <= 0) {
                map.npcs.mirvMessage.runDialogue("say");
                flags.knowAboutMirv = true;
            }
        });
    };

    // map.npcs.earl2.addAfterTalk(function() {
    //     if (gameState.inventory.addItem("potion", 1)) {
    //         this.runDialogue("potion");
    //     } else {
    //         this.runDialogue("wazoo");
    //     }
    // });
});
