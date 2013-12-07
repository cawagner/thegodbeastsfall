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
        items: ["Get Potions", "Get Mierv"],
        select: function(index, item) {
            if (item === "Get Mierv") {
                if (gameState.party.length < 2) {
                    gameState.party.push(Character.create(campaign["heroine"]));
                } else {
                    setTimeout(function() {
                        debugMenu.owner.say(["Don't get greedy. You've already got a Mierv!"]);
                    }, 0);
                }
            } else if (item === "Get Potions") {
                gameState.inventory.addItem("potion");
                gameState.inventory.addItem("soma");
                gameState.inventory.addItem("antidote");
            }
            this.close();
        },
        cancel: function() {
            this.close();
        }
    });

    return function setupMap(map) {
        debugMenu.owner = map.npcs.barrel1;

        [map.npcs.oldman, map.npcs.littlegirl, map.npcs.earl].forEach(function(npc) {
            npc.on('beforeTalk', learnAboutMirv);
        });

        map.npcs.barrel1.on('afterTalk', function() {
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
});
