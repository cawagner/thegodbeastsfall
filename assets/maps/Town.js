setupMap(function(map, gameState) {
    "use strict";

    var npcLearn = 400;

    var learnAboutMirv = function() {
        gameState.flags.town.stepsUntilMirvMessage -= npcLearn;
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
            $.publish("/npc/talk", [{
                text: [
                    "Held... can you hear me? I am Mirv. It is preordained that we work together.",
                    "But... I was born so long before you, and too impatient to wait for you...",
                    "In my hubris, I became imprisoned in the Tomb World.",
                    "Charon, who maintains the graveyard north of town, can help you.",
                    "Please, if you can hear me..."
                ]
            }]);
            gameState.flags.town.knowAboutMirv = true;
        }
    });
});
