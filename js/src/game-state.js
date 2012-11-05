define([
    "map-loader",
    "character",
    "json!../../assets/data/campaign.json"
], function(mapLoader, Character, campaign) {
    "use strict";

    if (GameState.instance) {
        return GameState.instance
    }

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
                    "Magic": [ "heal1" ]
                }
            });

            this.party = [held];

            this.startDate = Date.now();
            this.totalSteps = 0;
            this.mapSteps = 0;

            this.flags = {};

            mapLoader.goToMap(campaign.startMap);
        };

        this.toJSON = function() {

        };

        this.fromJSON = function() {

        };
    }

    // HACK: no!
    window.GameState = GameState;

    GameState.instance = new GameState();

    return GameState.instance;
});