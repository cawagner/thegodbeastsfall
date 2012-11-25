define([
    "underscore",
    "game-state",
    "menu",
    "states/menu-state",
    "chars",
    "states/noop-state",
    "pawns/character-pawn",
    "json!skills.json"
], function(_, gameState, Menu, MenuState, chars, NoopState, CharacterPawn, skills) {
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
                {
                    text: "Magic",
                    childMenu: function() {
                        var partyMembers = _(gameState.party).map(function(member) {
                            var pawn = new CharacterPawn(member);
                            var fieldSkills = _(member.skills["Magic"]).chain().filter(function(skill) {
                                return skills[skill].isFieldUsable;
                            }).map(function(skill) {
                                return { text: skills[skill].name, skill: skills[skill], disabled: !pawn.canUseSkill(skills[skill]) };
                            }).value();

                            if (fieldSkills.length) {
                                return {
                                    text: member.name,
                                    childMenu: new Menu({ items: fieldSkills })
                                };
                            } else {
                                return { text: member.name, disabled: true };
                            }
                        });
                        return new Menu({
                            items: partyMembers,
                            hierarchical: true
                        });
                    }
                },
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

    FieldMenuState.prototype.draw = function(delta) {
        var party = gameState.party;

        this.previousState.draw(delta);
        this.menuState.draw(delta);

        this.gui.drawStatus(260, 180, party[0]);
    };

    FieldMenuState.prototype.suspend = function() {

    };

    FieldMenuState.prototype.reactivate = function() {

    };

    return FieldMenuState;
});