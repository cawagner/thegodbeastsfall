define([
    "underscore",
    "json!enemies.json",
    "json!enemy-families.json"
], function(_, enemies, enemyFamilies) {
    "use strict";

    _(enemies).each(function(enemy) {
        var family = enemyFamilies[enemy.family];
        if (family) {
            enemy.weak = enemy.weak || family.weak || [];
        }
    });

    return enemies;
});