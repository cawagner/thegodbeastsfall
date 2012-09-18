function GameState() {
    this.party = [];

    this.newGame = function() {
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

        goToMap('DesertPath');
    };
}

GameState.instance = new GameState();