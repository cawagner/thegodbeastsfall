setupMap(function(map) {
    map.onLoad = function(hero) {
        var messages = [
            {
                text: [
                    "Ma seln au ansiapta sen~Held bnani.",
                    "(You, whom I have made~from sand, I name~Held.)"/*,
                    "Tai seln si Held...~aris ses unuan mu gisu.",
                    "(Held, the walking sand...~pour your love upon all.)"*/
                ]
            }
        ];
        new Actor().say(messages);
    };
});