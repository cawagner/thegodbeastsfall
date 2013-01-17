define([
    "underscore",
    "pubsub",
    "game-state",
    "gui",
    "menu",
    "states/menu-state",
    "states/noop-state",
    "pawns/character-pawn",
    "data/skills",
    "menus/field/items",
    "menus/field/system"
], function(_, pubsub, gameState, gui, Menu, MenuState, NoopState, CharacterPawn, skills, itemsMenu, systemMenu) {
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
                            pubsub.publish("/status/show", [menuItem.member]);
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

                            return {
                                text: member.name,
                                childMenu: new Menu({
                                    items: fieldSkills,
                                    hierarchical: true,
                                    select: function(index) {
                                        var skillMenu = this;
                                        var fieldSkill = fieldSkills[index];
                                        var targetMenu = new Menu({
                                            items: _(gameState.party).pluck("name"),
                                            select: function(index) {
                                                pubsub.publish("/npc/talk", [{
                                                    text: ["Du hast " + gameState.party[index].name + " gewaehlt!"]
                                                }]);
                                            }
                                        }).open();
                                    }
                                }),
                                disabled: !fieldSkills.length,
                                hierarchical: true
                            };
                        });
                        return new Menu({
                            items: partyMembers,
                            hierarchical: true
                        });
                    }
                },
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