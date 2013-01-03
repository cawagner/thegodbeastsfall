define([
    "underscore"
], function(
    _
) {
    "use strict";

    function Equipment() {
        this.slots = {};
    };

    Equipment.prototype.get = function(slot) {
        return this.slots[slot];
    };

    Equipment.prototype.wear = function(item) {
        var oldItem = this.slots[item.equipment.slot];
        this.slots[item.equipment.slot] = item;
        return oldItem;
    };

    Equipment.prototype.attack = function() {
        var attack = 0;
        _(this.slots).each(function(item) {
            attack += item.equipment.attack || 0;
        });
        return attack;
    };

    return Equipment;
});