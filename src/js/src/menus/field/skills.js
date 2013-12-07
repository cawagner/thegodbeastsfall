define([
    "underscore",
    "game-state",
    "radio",
    "data/skills",
    "menu",
    "pawns/character-pawn",
    "states/composite-state",
    "battle/effect-executor",
    "battle/skill-user"
], function(
    _,
    gameState,
    radio,
    skills,
    Menu,
    CharacterPawn,
    CompositeState,
    EffectExecutor,
    skillUser
) {
    "use strict";

    var createEffectExecutor = function(action, messages) {
        return new EffectExecutor({
            state: new CompositeState(),
            action: action,
            displayMessage: function(msg) {
                // HACK: ugh, gross
                return {
                    start: function() { messages.push(msg); },
                    update: _.give(true),
                    draw: _.noop
                };
            },
            displayDamage: function(target, amount) {
                // HACK: ugh, gross AND don't hardcode text
                return {
                    start: function() {
                        if (amount === 0) {
                            return;
                        } else if (amount > 0) {
                            messages.push(target.name + " recovered " + amount + " hit points!");
                        } else if (amount < 0) {
                            messages.push(target.name + " took " + amount + " damage!");
                        }
                    },
                    update: _.give(true),
                    draw: _.noop
                };
            }
        });
    };

    var createSkillMenuForMember = function(member) {
        var pawn = new CharacterPawn(member);
        var fieldSkills = _(member.skills["Magic"]).chain().filter(function(skill) {
            return skills[skill].isFieldUsable;
        }).map(function(skill) {
            return {
                text: skills[skill].name,
                skill: skills[skill],
                disabled: function() { return !pawn.canUseSkill(skills[skill]); }
            };
        }).value();

        var userPartyMemberSelected = function(e) {
            var skillMenu = e.sender;
            var fieldSkill = fieldSkills[e.index];
            var skillIsUsable = function() {
                return !pawn.canUseSkill(fieldSkill.skill);
            };
            var targetMenu = new Menu({
                items: _(gameState.party).map(function(member) {
                    return {
                        text: member.name,
                        disabled: skillIsUsable
                    };
                })
            });
            targetMenu.on('select', function(e) {
                var targetPawn = gameState.party[e.index] === member
                    ? pawn
                    : new CharacterPawn(gameState.party[e.index]);
                var messages = [];
                var executor = createEffectExecutor({
                    user: pawn,
                    skill: fieldSkill.skill,
                    targets: [targetPawn]
                }, messages);
                skillUser.useSkill(executor);
                executor.state.runAll();
                radio("/npc/talk").broadcast({ text: messages });
            });
            targetMenu.open();
        };

        return {
            text: member.name,
            childMenu: new Menu({
                items: fieldSkills,
                hierarchical: true,
                select: userPartyMemberSelected
            }),
            disabled: !fieldSkills.length,
            hierarchical: true
        };
    };

    return {
        text: "Magic",
        childMenu: function() {
            var partyMembers = _(gameState.party).map(createSkillMenuForMember);
            return new Menu({
                items: partyMembers,
                hierarchical: true
            });
        }
    };
});