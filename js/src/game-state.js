define([
    "underscore",
    "map-loader",
    "character",
    "inventory",
    "json!campaign.json"
], function(_, mapLoader, Character, Inventory, campaign) {
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
                campaign[characterId].id = characterId;
                return Character.create(campaign[characterId]);
            });

            this.startDate = Date.now();
            this.totalSteps = 0;
            this.flags = {};
            this.inventory = new Inventory();
            this.location = {
                currentMap: campaign.startMap,
                x: undefined,
                y: undefined,
                direction: undefined
            };

            mapLoader.goToMap(campaign.startMap);
        };

        this.toJSON = function() {
            var json = {
                party: _(this.party).map(function(member) { return member.toJSON(); }),
                startDate: this.startDate,
                totalSteps: this.totalSteps,
                flags: this.flags,
                inventory: this.inventory.items,
                location: this.location
            };
            return JSON.stringify(json);
        };

        this.loadJSON = function(src) {
            var json = JSON.parse(src);
            // get characters from JSON...
            this.party = _(json.party).map(function(member) {
                return Character.create(_(member).defaults(campaign[member.id]));
            });
            this.startDate = json.startDate;
            this.totalSteps = json.totalSteps;
            this.flags = json.flags;
            this.inventory.items = json.inventory;
            this.location = json.location;

            mapLoader.goToMap(this.location.currentMap, this.location);
        };
    }

    // HACK: no!
    window.GameState = GameState;

    GameState.instance = new GameState();

    return GameState.instance;
});