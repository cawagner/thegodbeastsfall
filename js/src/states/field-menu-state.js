define([
    "underscore",
    "pubsub",
    "game-state",
    "gui",
    "menu",
    "states/menu-state",
    "states/noop-state",
    "pawns/character-pawn",
    "data/skills"
], function(_, pubsub, gameState, gui, Menu, MenuState, NoopState, CharacterPawn, skills) {
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
                {
                    text: "Items",
                    childMenu: function() {
                        var items = _(gameState.inventory.getItems()).map(function(item) {
                            return { text: "x" + item.quantity + " " + item.item.name, itemId: item.id, item: item.item, quantity: item.quantity };
                        });
                        var itemsMenu = new Menu({
                            items: items,
                            select: function(index, item) {
                                new Menu({
                                    items: [
                                        { text: "Use " + item.item.name, disabled: !(item.item.isFieldUsable || item.item.equipment) },
                                        "Look"
                                    ],
                                    select: function(index) {
                                        var oldItem, text, member = gameState.party[0];
                                        if (index === 0) {
                                            // TODO: don't just try to equip it to Held...
                                            if (item.item.equipment) {
                                                oldItem = member.equipment.wear(item.item);
                                                // TODO: remove new item from inventory, add old item to inventory

                                                text = oldItem
                                                    ? member.name + " took off " + oldItem.name + " and wore " + item.item.name + "."
                                                    : member.name + " wore " + item.item.name + ".";

                                                this.close();
                                                itemsMenu.close();

                                                pubsub.publish("/npc/talk", [{ text: [text] }]);
                                            }
                                        }
                                        if (index === 1) {
                                            pubsub.publish("/npc/talk", [{ text: [item.item.desc] }]);
                                        }
                                    }
                                }).open();
                            }
                        });
                        return itemsMenu;
                    },
                    disabled: function() {
                        return gameState.inventory.getItems().length === 0;
                    }
                },
                {
                    text: "System",
                    childMenu: new Menu({
                        items: [
                            "Save",
                            { text: "Load", disabled: !localStorage.getItem("saveGame0") }
                        ],
                        select: function(index) {
                            if (index === 0) {
                                gameState.save(0);
                                pubsub.publish("/npc/talk", [
                                    { text: ["Game saved!"] }
                                ]);
                            } else if (index === 1) {
                                gameState.load(0);
                                this.close();
                                self.menu.close();
                            }
                        }
                    }),
                }
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