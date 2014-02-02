define([
    "underscore",
    "map-loader",
    "character",
    "inventory",
    "json!campaign.json"
], function(_, mapLoader, Character, Inventory, campaign) {
    "use strict";

    return {
        party: [],
        newGame: function() {
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
        },

        toJSON: function() {
            var json = {
                party: _(this.party).map(function(member) { return member.toJSON(); }),
                startDate: this.startDate,
                totalSteps: this.totalSteps,
                flags: this.flags,
                inventory: this.inventory.serialize(),
                location: this.location,
                description: this.totalSteps + " steps taken"
            };
            return json;
        },

        loadJSON: function(src) {
            var json = JSON.parse(src);
            // get characters from JSON...
            this.party = _(json.party).map(function(member) {
                return new Character(_(member).defaults(campaign[member.id]));
            });
            this.startDate = json.startDate;
            this.totalSteps = json.totalSteps;
            this.flags = json.flags;
            this.inventory = Inventory.deserialize(json.inventory);
            this.location = json.location;

            mapLoader.goToMap(this.location.currentMap, this.location);
        },

        save: function(slot) {
            localStorage.setItem("saveGame" + slot, JSON.stringify(this.toJSON()));
        },

        load: function(slot) {
            this.loadJSON(localStorage.getItem("saveGame" + slot));
        }
    };
});