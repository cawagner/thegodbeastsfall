define([
    "underscore",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    'battle/battle-execute-state',
    'dice',
    "data/skills"
], function(
    _,
    BattleMessageState,
    BattleMenuState,
    BattleExecuteState,
    Dice,
    skills
) {
    "use strict";

    var d20 = Dice.parse("d20");

    var createUseSkillAction = function(user, skill, targets) {
        return {
            type: "skill",
            targets: targets,
            skill: skill,
            user: user,
            priority: user.priority() + (skill.priorityBoost||0) + d20.roll()
        };
    };

    return function BattleDecisionState(battleState) {
        var aLivingHuman = function() {
            var livingHumans = _(battleState.playerPawns).filter(function(human) {
                return human.isAlive();
            });
            return _(livingHumans).sample();
        };
        this.start = function(commands) {
            var actions = [];
            _(commands).each(function(command) {
                var pawn = battleState.playerPawns[command.partyIndex];
                if (command.action === "skill") {
                    actions.push(createUseSkillAction(pawn, command.param.skill, command.param.targets));
                } else if (command.action === "item") {
                    actions.push({
                        type: "item",
                        user: pawn,
                        item: command.param.item,
                        targets: command.param.targets,
                        priority: pawn.priority()
                    });
                } else {
                    actions.push({
                        type: command.action,
                        user: pawn,
                        priority: pawn.priority() + (command.param.priorityBoost||0)
                    });
                }
            });

            _(battleState.enemyPawns).each(function(enemy) {
                var usableSkills = enemy.usableSkills();
                var skill = _(usableSkills).sample();
                var target;
                // still missing some target types...
                if (skills[skill].target === "enemy") {
                    target = [aLivingHuman()];
                }
                if (skills[skill].target === "self") {
                    target = [enemy];
                }
                actions.push(createUseSkillAction(enemy, skills[skill], target));
            });

            actions.sort(function(a, b) {
                return b.priority - a.priority;
            });

            battleState.enqueueState(new BattleExecuteState(battleState, actions, function() {
                battleState.enqueueState(new BattleMenuState(battleState));
                battleState.enqueueState(new BattleDecisionState(battleState));
            }));
        }
        this.update = function() {
            return true;
        };
        this.draw = function() {

        };
    };
});