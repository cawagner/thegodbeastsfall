define(["map-loader"], function(mapLoader) {
    function GameState() {
        this.party = [];

        this.newGame = function() {
            // when skills are learned should be determined based on:
            // "fight" skills -> max hp
            // "magic" skills -> max mp (not necessarily cost of spell)
            var held = Character.create({
                name: "Held",
                face: "held",
                title: "Mysterious Hero",
                strength: 15,
                agility: 10,
                intelligence: 10,
                luck: 10,
                skills: {
                    "Fight": [ "slash", "hard" ],
                    "Saint": [ "heal1" ]
                }
            });

            this.party = [held];

            mapLoader.goToMap('DesertPath');
        };
    }

    GameState.instance = new GameState();

    return GameState;
});