define([
    "underscore",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    'battle/battle-execute-state',
    'dice',
    "json!skills.json",  // TODO: move handling the skill doing into another place...
    "skill-effects"
], function(
    _,
    BattleMessageState,
    BattleMenuState,
    BattleExecuteState,
    Dice,
    skills,
    skillEffects
) {
    "use strict";

    var d20 = Dice.parse("d20");

    var createUseSkillAction = function(user, skillId, skill, targets) {
        return {
            type: "skill",
            targets: targets,
            skill: skill,
            skillId: skillId,
            user: user,
            skillEffect: skillEffects[skill.effect],
            priority: user.priority() + (skill.priorityBoost||0) + d20.roll()
        }
    };

    return function BattleDecisionState(battleState) {
        var aLivingHuman = function() {
            var livingHumans = _(battleState.playerPawns).filter(function(human) {
                return human.isAlive();
            });
            return _(livingHumans).randomElement();
        };
        this.start = function(commands) {
            var actions = [];
            _(commands).each(function(command) {
                var pawn = battleState.playerPawns[command.partyIndex];
                if (command.action === "skill") {
                    actions.push(createUseSkillAction(pawn, command.param.skillId, command.param.skill, command.param.targets));
                } else if (command.action === "item") {
                    /// guess I've got brain problems!
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
                var skill = _(usableSkills).randomElement();
                var target;
                // still missing some target types...
                if (skills[skill].target === "enemy") {
                    target = [aLivingHuman()];
                }
                if (skills[skill].target === "self") {
                    target = [enemy];
                }
                actions.push(createUseSkillAction(enemy, skill, skills[skill], target));
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