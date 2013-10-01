define(["game-state", "battle", "menu", "character", "json!campaign.json"], function(gameState, Battle, Menu, Character, campaign) {
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

    var debugMenu = new Menu({
        items: ["Get Mierv", "Get Potion"],
        select: function(index, item) {
            if (item === "Get Mierv") {
                gameState.party.push(Character.create(campaign["heroine"]));
            }
            this.close();
        },
        cancel: function() {
            this.close();
        }
    });

    return function setupMap(map) {
        [map.npcs.oldman, map.npcs.littlegirl, map.npcs.earl].forEach(function(npc) {
            npc.addBeforeTalk(learnAboutMirv);
        });

        map.npcs.barrel1.addAfterTalk(function() {
            debugMenu.open();
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
