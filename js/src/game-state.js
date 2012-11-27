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
            this.party = _(campaign.initialParty).map(function(characterId) {
                return Character.create(campaign[characterId]);
            });

            this.startDate = Date.now();
            this.totalSteps = 0;

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