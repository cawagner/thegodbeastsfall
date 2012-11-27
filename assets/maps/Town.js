setupMap(function(map, gameState) {
    "use strict";

    var stepsUntilMirvMessage = 750;
    var learnAboutMirv = function() {
        stepsUntilMirvMessage -= 250;
        if (stepsUntilMirvMessage < 5) {
            stepsUntilMirvMessage = 5;
        }
    };

    var flags = gameState.flags.town = gameState.flags.town || {
        knowAboutMirv: false
    };

    var stepSubscription = $.subscribe("/hero/step", function() {
        if (flags.knowAboutMirv)
            return;

        stepsUntilMirvMessage--;
        if (stepsUntilMirvMessage < 0) {
            $.publish("/npc/talk", [{
                text: [
                    "Helt... can you hear me? I am Miav. It is preordained that we work together...",
                    "But I came long before you, and was born beyond the boundary of the Fake World...",
                    "I sealed myself in the Tomb World so that I would still be able to help when you appeared.",
                    "Charon, who maintains the graveyard north of town, can help you release me.",
                    "Please, if you can hear me..."
                ]
            }]);
            flags.knowAboutMirv = true;
        }
    });

    map.npcs.oldman.addBeforeTalk(learnAboutMirv);
    map.npcs.littlegirl.addBeforeTalk(learnAboutMirv);
    map.npcs.earl.addBeforeTalk(learnAboutMirv);

    map.npcs.earl2.onTalk = function() {
        var self = this;
        this.say([
            "No need to thank me. Just take this."
        ]).done(function() {
            if (GameState.instance.inventory.addItem("potion", 1)) {
                setTimeout(function() {
                    self.say(["I gave you a potion."]);
                }, 500);
            } else {
                self.say(["You've already got potions like Jagger."]);
            }
        });
    };

    map.npcs.barrel1.onTalk = function() {
        // we'll flesh this out over time...
        $.publish("/battle/start", [["slime", "rat", "slime"]]);
    };

    map.onUnload = function() {
        $.unsubscribe(stepSubscription);
    };
});
