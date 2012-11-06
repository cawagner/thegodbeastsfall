define([
    "underscore",
    "game-state",
    "menu",
    "states/menu-state",
    "chars",
    "states/noop-state"
], function(_, gameState, Menu, MenuState, chars, NoopState) {
    "use strict";

    function FieldMenuState() {
        var self = this;

        this.menu = new Menu({
            rows: 2,
            cols: 2,
            hierarchical: true,
            items: [
                {
                    text: "Status",
                    childMenu: new Menu({
                        items: _(gameState.party).map(function(member) {
                            return { text: member.name, member: member };
                        }),
                        select: function(index, menuItem) {
                            $.publish("/status/show", [menuItem.member]);
                        }
                    })
                },
                "Magic",
                "Items",
                {
                    text: "System",
                    childMenu: new Menu({
                        items: [ "Save", "Load", "Options" ]
                    })
                }
            ]
        });

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

    FieldMenuState.prototype.drawStatus = function(x, y, ally) {
        this.gui.drawTextWindow(x, y, 36, 44, [
            ally.name.toUpperCase(),
            chars.HEART + (""+ally.hp).rset(3),
            chars.STAR + (""+ally.mp).rset(3)]
        );
    }

    FieldMenuState.prototype.draw = function(delta) {
        var party = gameState.party;

        this.previousState.draw(delta);
        this.menuState.draw(delta);

        this.drawStatus(260, 180, party[0]);
    };

    FieldMenuState.prototype.suspend = function() {

    };

    FieldMenuState.prototype.reactivate = function() {

    };

    return FieldMenuState;
});