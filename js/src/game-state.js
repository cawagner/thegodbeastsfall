define([
    "map-loader",
    "character",
    "json!campaign.json"
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
            var held = Character.create(campaign.hero);
            var mirv = Character.create(campaign.heroine); // TODO: don't be so weird!

            this.party = [held, mirv];

            this.startDate = Date.now();
            this.totalSteps = 0;
            this.mapSteps = 0;

            this.flags = {};

            this.inventory = {
                hasBattleUsableItems: function() {
                    return false;
                }
            };

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