define([
    "underscore",
    "game-state",
    "menu",
    "states/menu-state",
    "states/status-state",
    "chars",
    "states/noop-state"
], function(_, gameState, Menu, MenuState, StatusState, chars, NoopState) {
    "use strict";

    function FieldMenuState() {
        var self = this;

        var getPartyMenu = function() {
             var options = _(gameState.party).map(function(member){
                return { text: member.name, member: member };
            });
            return new Menu(options);
        };

        this.menu = new Menu([
            {
                text: "Status",
                childMenu: function() {
                    return getPartyMenu().select(function(index, menuItem) {
                        Game.instance.pushState(new StatusState(menuItem.member));
                    });
                }
            },
            "Zauber",
            "Items",
            {
                text: "System",
                childMenu: new Menu([ "Save", "Load", "Options" ])
            }
        ]).select(function(index, item) {
            if (item.childMenu) {
                _(item).result("childMenu").open();
            } else {
                this.close();
            }
        }).size(2, 2);

        this.menuState = new MenuState(this.menu);
        this.gui = this.menuState.gui;
        this.previousState = new NoopState();
    }

    FieldMenuState.prototype.start = function(previousState) {
        this.previousState = previousState;
    };

    FieldMenuState.prototype.update = function(delta) {
        this.previousState.update(delta);
        this.menuState.update(delta);
    };

    FieldMenuState.prototype.draw = function(delta) {
        var party = gameState.party;

        this.previousState.draw(delta);
        this.menuState.draw(delta);

        this.gui.drawTextWindow(260, 180, 36, 44, ["HELD", chars.HEART + (""+party[0].hp).rset(3), chars.STAR + (""+party[0].mp).rset(3)]);
    };

    FieldMenuState.prototype.suspend = function() {

    };

    FieldMenuState.prototype.reactivate = function() {

    };

    return FieldMenuState;
});