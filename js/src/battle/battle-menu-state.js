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
        var pawns = _(this.battleState[pawnType + "Pawns"]).map(function(pawn) {
            return { text: _(pawn).result("name"), target: pawn };
        });
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
                return { text: skill.name, skill: skill };
            });
            return new Menu({
                items: skillMenuItems
            }).select(function(index, item) {
                if (item.skill.target === "enemy" || item.skill.target === "player") {
                    self.targetPawn(item.skill.target).open();
                } else {
                    console.log("Target is ready!");
                }
                // TODO: check whether skill is usable, then select a target!
                //self.setAction("skill", item);
                //this.close();
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
                { text: "Item", childMenu: new Menu() },
                {
                    text: "Tactic",
                    childMenu: new Menu({
                        items: [
                            { text: "Defend", action: "defend" },
                            { text: "Run Away", action: "run" },
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