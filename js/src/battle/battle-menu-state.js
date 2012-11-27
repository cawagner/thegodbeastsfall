define([
    "underscore",
    "menu",
    "gui",
    "json!skills.json"
], function(
    _,
    Menu,
    GuiRenderer,
    skills
) {
    "use strict";

    // TODO: this knows way too much about battleState!

    function BattleMenuState(battleState) {
        this.partyIndex = 0;
        this.actions = [];

        this.battleState = battleState;

        this.skillMenu = null;

        this.gui = new GuiRenderer(Game.instance.graphics);
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
                { text: "Fight", childMenu: self.skillsOfType("Fight") },
                { text: "Magic", childMenu: self.skillsOfType("Magic") },
                { text: "Item", childMenu: new Menu(), disabled: !GameState.instance.inventory.hasBattleUsableItems() },
                {
                    text: "Tactic",
                    childMenu: new Menu({
                        items: [
                            { text: "Defend", action: "defend", priorityBoost: 20 },
                            { text: "Run Away", action: "flee", priorityBoost: -10 },
                            { text: "Inspect", action: "inspect", priorityBoost: 0 }
                        ],
                        rows: 1,
                        cols: 3,
                        x: 10,
                        y: 200
                    }).select(function(index, item) {
                        this.close();
                        self.setAction(item.action, { priorityBoost: item.priorityBoost })
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
        this.gui.drawTextWindow(280, 30, 25, 16, [menuItem.cost]);
    };

    BattleMenuState.prototype.targetPawn = function(pawnType) {
        var pawns = _(this.battleState[pawnType + "Pawns"]).chain().filter(function(pawn) { return pawn.isAlive(); }).map(function(pawn) {
            return { text: _(pawn).result("name"), target: pawn };
        }).value();
        return new Menu({
            items: pawns
        });
    };

    // Sweet baby Jesus :(
    BattleMenuState.prototype.skillsOfType = function(type) {
        var self = this;
        var drawSkillInfo = function(skill) {
            self.drawSkillInfo(skill);
        };

        return function() {
            var member = self.battleState.playerPawns[self.partyIndex];
            var skillMenuItems = _(member.character.skills[type]).map(function(skillName) {
                var skill = skills[skillName] || { name: "<NULL>" + skillName };
                return {
                    text: skill.name,
                    cost: member.formatCost(skill),
                    skill: skill,
                    skillId: skillName,
                    disabled: !member.canUseSkill(skill)
                };
            });
            var skillMenu = new Menu({
                items: skillMenuItems,
                rows: 2,
                cols: 3,
                draw: drawSkillInfo
            }).select(function(index, item) {
                var skillMenu = this;
                var skill = item.skill;
                var skillId = item.skillId;
                var confirmMultiTargetMenu = function(skill, skillId, targetText, pawns) {
                    new Menu({
                        items: [targetText]
                    }).select(function() {
                        this.close();
                        skillMenu.close();
                        self.setAction("skill", {
                            skill: skill,
                            skillId: skillId,
                            targets: pawns
                        });
                    }).open();
                };
                if (skill.target === "enemy" || skill.target === "player") {
                    self.targetPawn(skill.target).open().select(function(index, item) {
                        this.close();
                        skillMenu.close();
                        self.setAction("skill", {
                            skill: skill,
                            skillId: skillId,
                            targets: [item.target]
                        });
                    });
                }
                if (skill.target === "enemies") {
                    confirmMultiTargetMenu(skill, skillId, "All Enemies", self.battleState.enemyPawns);
                }
                if (skill.target === "players") {
                    confirmMultiTargetMenu(skill, skillId, "All Allies", self.battleState.playerPawns);
                }
                if (skill.target === "self") {
                    confirmMultiTargetMenu(skill, skillId, "Self", [member]);
                }
                // TODO: handle party multi-targeting/self-targeting!
            }).cancel(function() {
                self.skillMenu = null;
            });
            return skillMenu;
        };
    };

    return BattleMenuState;
});