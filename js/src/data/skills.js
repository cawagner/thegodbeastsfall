define(["json!skills.json"], function(skills) {
    "use strict";

    for (var key in skills) {
        if (skills.hasOwnProperty(key)) {
            skills[key].id = key;
        }
    }

    return skills;
});