setupMap(function(map) {
    map.npcs["oldman"].onTalk = function(hero) {
        var messages = [
            {
                speaker: "oldman",
                text: [
                    "Only those who've been~touched by the spark of~the divine are able to enter",
                    "or exit this town.~You must be here for a~special reason."
                ]
            }
        ];
        haveConversation(messages, hero, this);
    };
});
