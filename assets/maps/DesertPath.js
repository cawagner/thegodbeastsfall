setupMap(function(map) {
    map.onLoad = function(hero, entrance) {
        if (entrance === "default") {
            var messages = [
                {
                    text: [
                        "Seo ii si Ropo nani ma seln au ansiefta sen Held bnani.",
                    ]
                }
            ];
            new Actor().say(messages);
        }
    };
});