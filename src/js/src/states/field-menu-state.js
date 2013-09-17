define([
    "game-state",
    "gui",
    "menu",
    "states/menu-state",
    "states/noop-state",
    "pawns/character-pawn",
    "menus/field/skills",
    "menus/field/items",
    "menus/field/system",
    "menus/field/status"
], function(gameState, gui, Menu, MenuState, NoopState, CharacterPawn, skills, skillsMenu, itemsMenu, systemMenu, statusMenu) {
    "use strict";

    function FieldMenuState() {
        var self = this;

        this.menu = new Menu({
            rows: 2,
            cols: 2,
            hierarchical: true,
            items: [
                statusMenu,
                skillsMenu,
                itemsMenu,
                systemMenu
            ]
        });

        this.menuState = new MenuState(this.menu);
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
        var party = gameState.party,
            x = 260 - 60 * (party.length - 1),
            i;

        this.previousState.draw(delta);
        this.menuState.draw(delta);

        for (i = 0; i < party.length; ++i) {
            gui.drawStatus(x, 180, party[i]);
            x += 60;
        }
    };

    FieldMenuState.prototype.suspend = function() {

    };

    FieldMenuState.prototype.reactivate = function() {

    };

    return FieldMenuState;
});