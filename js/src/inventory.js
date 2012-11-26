define(["underscore", "json!items.json"], function(_, items) {
    "use strict";

    function Inventory() {
        this.items = {};
    };

    Inventory.prototype.tryAddItem = function(itemId, quantity) {
        throw "not implemented";
    };

    Inventory.prototype.tryRemoveItem = function(itemId) {
        throw "not implemented";
    };

    Inventory.prototype.hasItem = function(itemId) {
        throw "not implemented";
    };

    Inventory.prototype.getItems = function(flag) {

    };

    return Inventory;
});