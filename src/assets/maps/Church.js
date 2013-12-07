define(['menu'], function(Menu) {
    "use strict";

    var setupNorodelFan = function(norodelFan) {
        var menu = new Menu({
            items: ["Yes", "No"],
            select: function(e) {
                e.sender.close();
                norodelFan.runDialogue("answer" + e.item);
            },
            cancel: function(e) {
                e.sender.close();
                norodelFan.runDialogue("cancel");
            }
        });

        norodelFan.on('afterTalk', function() {
            menu.open();
        });
    };

    return function(map) {
        setupNorodelFan(map.npcs.norodelFan);
    };
});