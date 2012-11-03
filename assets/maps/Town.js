setupMap(function(map, gameState) {
    "use strict";

    var npcLearn = 400;

    var learnAboutMirv = function() {
        gameState.flags.town.stepsUntilMirvMessage = Math.max(
            5,
            gameState.flags.town.stepsUntilMirvMessage - npcLearn
        );
        npcLearn /= 2;
    };

    gameState.flags.town = gameState.flags.town || {
        knowAboutMirv: false,
        stepsUntilMirvMessage: 750
    };

    map.npcs.oldman.onTalk = function() {
        var message = {
            speaker: "oldman",
            text: [
                "Only those who've been touched by the spark of the divine are able to enter or exit this town.",
                "You must be here for a special reason."
            ]
        };
        this.say([message]);
        learnAboutMirv();
    };

    map.npcs.littlegirl.onTalk = function() {
        var message =  {
            speaker: "littlegirl",
            text: [
                "Mirv is really pretty. And really strong. And smart.",
                "I hope she's okay."
            ]
        };
        this.say([message]);
        learnAboutMirv();
    };

    map.npcs.earl.onTalk = function() {
        var message = {
            speaker: "earl",
            text: [
                "You're the first person like you to come here in over twenty years.",
                "Mirv was the last, but she went into the tomb world and never came back."
            ]
        };
        this.say([message]);
        learnAboutMirv();
    };

    map.npcs.barrel1.onTalk = function() {
        var message = {
            text: [
                "This barrel is full of nothing but hatred and lies."
            ]
        };
        this.say([message]);
    };

    $.subscribe("/hero/step", function() {
        if (gameState.flags.town.knowAboutMirv)
            return;

        gameState.flags.town.stepsUntilMirvMessage--;
        if (gameState.flags.town.stepsUntilMirvMessage < 0) {
            $.publish("/npc/talk", [[{
                text: [
                    "Held... can you hear me? I am Mirv. It is preordained that we work together...",
                    "But I came long before you, and was born beyond the boundary of the Fake World...",
                    "I sealed myself in the Tomb World so that I would still be able to help when you appeared.",
                    "Charon, who maintains the graveyard north of town, can help you release me.",
                    "Please, if you can hear me..."
                ]
            }]]);
            gameState.flags.town.knowAboutMirv = true;
        }
    });
});
