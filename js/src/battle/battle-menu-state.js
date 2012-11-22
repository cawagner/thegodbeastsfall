define([
    "underscore",
    "menu",
    "json!skills.json"
], function(
    _,
    Menu,
    skills
) {
    "use strict";

    // TODO: this knows way too much about battleState!

    function BattleMenuState(battleState) {
        this.partyIndex = 0;
        this.actions = [];

        this.battleState = battleState;

        this.start = function() {
            this.menu = this.getMenu().open();
        };

        this.update = function() {
            if (this.areActionsReady()) {
                this.menu.close();
                return this.actions;
            }
        };

        this.draw = _.noop;
    };

    BattleMenuState.prototype.targetPawn = function(pawnType) {
        var pawns = _(this.battleState[pawnType + "Pawns"]).chain().filter(function(pawn) { return pawn.isAlive(); }).map(function(pawn) {
            return { text: _(pawn).result("name"), target: pawn };
        }).value();
        return new Menu({
            items: pawns
        });
    };

    BattleMenuState.prototype.skillsOfType = function(type) {
        var self = this;
        return function() {
            var member = self.battleState.playerPawns[self.partyIndex];
            var skillMenuItems = _(member.character.skills[type]).map(function(skillName) {
                var skill = skills[skillName] || { name: "<NULL>" + skillName };
                return { text: skill.name, skill: skill, disabled: !member.canUseSkill(skill) };
            });
            return new Menu({
                items: skillMenuItems,
                rows: 2,
                cols: 3
            }).select(function(index, item) {
                var skillMenu = this;
                var skill = item.skill;
                // Sweet baby Jesus :(
                if (skill.target === "enemy" || skill.target === "player") {
                    self.targetPawn(skill.target).open().select(function(index, item) {
                        this.close();
                        skillMenu.close();
                        self.setAction("skill", {
                            skill: skill,
                            targets: [item.target]
                        });
                    });
                }
                if (skill.target === "enemies") {
                    new Menu({
                        items: ["All Enemies"]
                    }).select(function() {
                        this.close();
                        skillMenu.close();
                        self.setAction("skill", {
                            skill: skill,
                            targets: self.battleState.enemyPawns
                        });
                    }).open();
                }
                // TODO: handle party multi-targeting/self-targeting!
            });
        };
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
                            { text: "Defend", action: "defend" },
                            { text: "Run Away", action: "flee" },
                            { text: "Inspect", action: "inspect" }
                        ],
                        rows: 1,
                        cols: 3,
                        x: 10,
                        y: 200
                    }).select(function(index, item) {
                        self.setAction(item.action)
                        this.close();
                    })
                }
            ],
            cancel: _.give(false)
        });
    };

    BattleMenuState.prototype.areActionsReady = function() {
        // TODO: handle multiple allies!
        return this.actions.length;
    };

    BattleMenuState.prototype.setAction = function(action, param) {
        var self = this;

        // TODO: handle multiple allies!
        this.actions = [{
            action: action,
            param: param,
            partyIndex: this.partyIndex
        }];
    };

    return BattleMenuState;
});