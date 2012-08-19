setupMap(function(map) {
    map.npcs.oldman.onTalk = function(hero) {
        var messages = [
            {
                speaker: "oldman",
                text: [
                    "Only those who've been~touched by the spark of~the divine are able to enter",
                    "or exit this town.~You must be here for a~special reason."
                ]
            }
        ];
        this.say(messages, hero);
    };

    map.npcs.littlegirl.onTalk = function(hero) {
        var messages = [
            {
                speaker: "littlegirl",
                text: [
                    "Mirv is really pretty.~And really strong.~And smart.",
                    "I hope she's okay."
                ]
            }
        ];
        this.say(messages, hero);
    };

    map.npcs.earl.onTalk = function(hero) {
        var messages = [
            {
                speaker: "earl",
                text: [
                    "You're the first person~like you to come here~in over twenty years.",
                    "Mirv was the last, but she~went into the tomb world~and never came back."
                ]
            }
        ];
        this.say(messages, hero);
    };
});
