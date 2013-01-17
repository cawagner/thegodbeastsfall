setupMap(function(map){
    "use strict";

    var Menu = require('menu');

    var norodelFan = map.npcs.norodelFan;

    norodelFan.menu = new Menu({
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

    norodelFan.addAfterTalk(function() {
        norodelFan.menu.open();
    });
});