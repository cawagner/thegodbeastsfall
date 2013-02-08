define([
    "underscore",
    "menu",
    "gui",
    "graphics",
    "game-state",
    "data/skills"
], function(
    _,
    Menu,
    gui,
    graphics,
    gameState,
    skills
) {
    "use strict";

    // TODO: this knows way too much about battleState!

    function BattleMenuState(battleState) {
        this.partyIndex = 0;
        this.actions = [];

        this.battleState = battleState;
    };

    BattleMenuState.prototype.start = function() {
        this.menu = this.getMenu().open();
    };

    BattleMenuState.prototype.update = function() {
        if (this.areActionsReady()) {
            this.menu.close();
            return this.actions;
        }
    };

    BattleMenuState.prototype.draw = function() {
    };

    BattleMenuState.prototype.getMenu = function() {
        var self = this;
        return new Menu({
            hierarchical: true,
            rows: 2,
            cols: 2,
            x: 15,
            y: 190,
            items: [
                { text: "Fight", childMenu: self.getSkillsMenuForType("Fight") },
                { text: "Magic", childMenu: self.getSkillsMenuForType("Magic") },
                { text: "Item", childMenu: self.getItemsMenu(), disabled: !gameState.inventory.getItems("battleUsable").length },
                {
                    text: "Tactic",
                    childMenu: new Menu({
                        items: [
                            { text: "Defend", action: "skill", skill: skills["defend"], priorityBoost: 60 },
                            { text: "Run Away", action: "flee", priorityBoost: -5 },
                            { text: "Inspect", action: "inspect", priorityBoost: 10 }
                        ],
                        rows: 1,
                        cols: 3,
                        x: 10,
                        y: 200,
                        select: function(index, item) {
                            this.close();
                            self.setAction(item.action, {
                                skill: item.skill,
                                targets: [self.currentPawn()],
                                priorityBoost: item.priorityBoost
                            });
                        }
                    })
                }
            ],
            cancel: function() {
                if (self.partyIndex > 0) {
                    self.partyIndex--;
                    self.actions.pop();
                    setTimeout(function() {
                        self.menu = self.getMenu().open();
                    }, 1);
                    return true;
                }
                return false;
            }
        });
    };

    BattleMenuState.prototype.areActionsReady = function() {
        return this.actions.length === this.battleState.playerPawns.length;
    };

    BattleMenuState.prototype.setAction = function(action, param) {
        var self = this;

        // TODO: handle multiple allies!
        this.actions.push({
            action: action,
            param: param,
            partyIndex: this.partyIndex
        });

        this.partyIndex++;

        this.menu.close();
        this.menu = this.getMenu().open();
    };

    BattleMenuState.prototype.drawSkillInfo = function(menuItem) {
        gui.drawTextWindow(280, 30, 25, 16, [menuItem.cost]);
        graphics.drawText(20, 0, menuItem.skill.desc || "");
    };

    BattleMenuState.prototype.currentPawn = function() {
        return this.battleState.playerPawns[this.partyIndex];
    };

    BattleMenuState.prototype.targetPawn = function(pawnType) {
        var pawns = _(this.battleState[pawnType + "Pawns"]).chain().filter(function(pawn) { return pawn.isAlive(); }).map(function(pawn) {
            return { text: _(pawn).result("name"), target: pawn };
        }).value();
        return new Menu({
            items: pawns
        });
    };

    BattleMenuState.prototype.getItemsMenu = function() {
        var self = this;

        return function() {
            var member = this.currentPawn();
            var items = _(gameState.inventory.getItems("battleUsable")).map(function(item) {
                return {
                    text: "x" + item.quantity + " " + item.item.name,
                    item: item.item,
                    quantity: item.quantity
                };
            });
            return new Menu({
                rows: 2,
                cols: 3,
                items: items,
                select: function(index, item) {
                    var itemsMenu = this;
                    self.getTargetMenu(member, item.item.target, function(targets) {
                        itemsMenu.close();
                    }).open();
                }
            });
        };
    };

    BattleMenuState.prototype.getTargetMenu = function(member, targetType, setTarget) {
        var confirmMultiTargetMenu = function(targetText, pawns) {
            return new Menu({
                items: [targetText],
                select: function() {
                    this.close();
                    setTarget(pawns);
                }
            });
        };
        if (targetType === "enemy" || targetType === "player") {
            return this.targetPawn(targetType).select(function(index, item) {
                this.close();
                setTarget([item.target]);
            });
        } else if (targetType === "enemies") {
            return confirmMultiTargetMenu("All Enemies", this.battleState.enemyPawns);
        } else if (targetType === "players") {
            return confirmMultiTargetMenu("All Allies", this.battleState.playerPawns);
        } else if (targetType === "self") {
            return confirmMultiTargetMenu("Self", [member]);
        } else {
            throw "Unsupported target type " + targetType;
        }
    };

    // Sweet baby Jesus :(
    BattleMenuState.prototype.getSkillsMenuForType = function(type) {
        var self = this;

        return function() {
            var member = self.currentPawn();
            var skillMenuItems = _(member.character.skills[type]).map(function(skillName) {
                var skill = skills[skillName];
                return {
                    text: skill.name,
                    cost: member.formatCost(skill),
                    skill: skill,
                    disabled: !member.canUseSkill(skill)
                };
            });

            return new Menu({
                items: skillMenuItems,
                rows: 2,
                cols: 3,
                draw: _(self.drawSkillInfo).bind(self),
                select: function(index, item) {
                    var skillMenu = this;
                    self.getTargetMenu(member, item.skill.target, function(targets) {
                        skillMenu.close();
                        self.setAction("skill", {
                            skill: item.skill,
                            targets: targets
                        });
                    }).open();
                }
            });
        };
    };

    return BattleMenuState;
});