function GameState() {
    this.party = [];

    this.newGame = function() {
        var held = Character.create({
            name: "Held",
            title: "Walking Sand",
            strength: 15,
            agility: 10,
            intelligence: 10,
            luck: 10
        });

        this.party = [held];

        goToMap('DesertPath');
    };
}

GameState.instance = new GameState();