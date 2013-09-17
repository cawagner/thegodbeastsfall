define(['menu'], function(Menu) {
    "use strict";

    var setupNorodelFan = function(norodelFan) {
        var menu = new Menu({
            items: ["Yes", "No"],
            select: function(index, item) {
                this.close();
                norodelFan.runDialogue("answer" + item);
            },
            cancel: function() {
                this.close();
                norodelFan.runDialogue("cancel");
            }
        });

        norodelFan.menu = menu;
        norodelFan.addAfterTalk(function() {
            norodelFan.menu.open();
        });
    };

    return function(map) {
        setupNorodelFan(map.npcs.norodelFan);
    };
});