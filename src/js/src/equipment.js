define([], function() {
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

    Equipment.prototype.calc = function(stat) {
        var sum = 0;
        this.slots.forEach(function(item) {
            sum += item.equipment[stat] || 0;
        });
        return sum;
    };

    return Equipment;
});