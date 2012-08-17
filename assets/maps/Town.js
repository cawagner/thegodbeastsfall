setupMap(function(map) {
    map.npcs["oldman"].onTalk = function() {
        var message = {
            speaker: "oldman",
            text: [
                "Mirv is appealing to me"
            ]
        };
        haveConversation([message]);
    };
});
