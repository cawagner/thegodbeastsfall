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
        // HACK: handle >2 party members.
        if (!this.currentPawn().isAlive()) {
            this.partyIndex = 1;
        };

        this.menu = this.getMenu().open();
    };

    BattleMenuState.prototype.update = function() {
        if (this.areActionsReady()) {
            this.menu.close();
            this.battleState.playerPawns.forEach(function(p) {
                p.isActive = false;
            });
            return this.actions;
        }
    };

    BattleMenuState.prototype.draw = function() {
    };

    BattleMenuState.prototype.getMenu = function() {
        var self = this;
        self.battleState.playerPawns.forEach(function(p) {
            p.isActive = false;
        });
        if (self.currentPawn()) {
            self.currentPawn().isActive = true;
        }

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
                        select: function(e) {
                            e.sender.close();
                            self.setAction(e.item.action, {
                                skill: e.item.skill,
                                targets: [self.currentPawn()],
                                priorityBoost: e.item.priorityBoost
                            });
                        }
                    })
                }
            ],
            cancel: function() {
                if (self.partyIndex > 0) {
                    // TODO: handle >2 party members
                    if (!self.battleState.playerPawns[self.partyIndex - 1].isAlive()) {
                        return false;
                    }
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
        return this.actions.length === this.battleState.playerPawns.filter(function(pp) {
            return pp.isAlive();
        }).length;
    };

    BattleMenuState.prototype.setAction = function(action, param) {
        var self = this;

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
            var member = self.currentPawn();
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
                select: function(e) {
                    self.getTargetMenu(member, e.item.item.target, function(targets) {
                        e.sender.close();
                        self.setAction("item", {
                            item: e.item.item,
                            targets: targets
                        });
                    }).open();
                }
            });
        };
    };

    BattleMenuState.prototype.getTargetMenu = function(member, targetType, setTarget) {
        var confirmMultiTargetMenu = function(targetText, pawns) {
            return new Menu({
                items: [targetText],
                select: function(e) {
                    e.sender.close();
                    setTarget(pawns);
                }
            });
        };
        if (targetType === "enemy" || targetType === "player") {
            return this.targetPawn(targetType).on('select', function(e) {
                e.sender.close();
                setTarget([e.item.target]);
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
                select: function(e) {
                    self.getTargetMenu(member, e.item.skill.target, function(targets) {
                        e.sender.close();
                        self.setAction("skill", {
                            skill: e.item.skill,
                            targets: targets
                        });
                    }).open();
                }
            });
        };
    };

    return BattleMenuState;
});