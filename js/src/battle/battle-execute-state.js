define([
    "underscore",
    "jquery",
    "battle/battle-message-state",
    "battle/battle-won-state",
    "battle/battle-composite-state"
], function(_, $, BattleMessageState, BattleWonState, BattleCompositeState) {
    "use strict";

    // TODO: this whole file is a mess... lol 3:00AM

    var executeUseSkillAction = function(action, battleState) {
        var state = new BattleCompositeState();
        var msg = function(m, s) {
            state.enqueueState(new BattleMessageState([m], s));
        };

        // exit the state if the user is dead, otherwise assess costs/cooldown
        state.enqueueFunc(function() {
            if (!action.user.isAlive()) {
                state.done();
            }
        });

        msg(action.user.name + " used " + action.skill.name + "!");

        _(action.effects).each(function(effect) {
            var targetWasAlive = effect.target.isAlive();
            var sound;
            if (effect.target.type === 'enemy') {
                sound = effect.critical ? "critical" : "hit";
            } else {
                sound = "playerhit";
            }

            if (!targetWasAlive) {
                if (!effect.target.isHidden) {
                    msg(effect.target.name + " was already gone!");
                }
                return;
            }

            state.enqueueFunc(function() {
                if (effect.amount > 0 && !isNaN(effect.amount)) {
                    effect.target.takeDamage(effect.amount);
                }
            });

            if (effect.missed) {
                state.enqueueFunc(battleState.displayMiss(effect.target));
                msg("...missed " + effect.target.name + "!", "miss");
            } else {
                if (effect.critical) {
                    msg("A mighty blow!");
                }
                state.enqueueFunc(function() {
                    $.publish("/sound/play", [sound]);
                })
                state.enqueueState(battleState.displayDamage(effect.target, effect.amount, effect.critical));
            }

            state.enqueueFunc(function() {
                if (targetWasAlive && !effect.target.isAlive()) {
                    msg(effect.target.name + " falls!", 'endie');
                    effect.target.isHidden = true;
                }
            });
        });

        state.enqueueFunc(function() {
            action.user.useSkill(action.skill);
        });

        return state;
    };

    var executeFleeAction = function(action) {
        var state = new BattleCompositeState();
        state.enqueueState(new BattleMessageState(["Run away!!!"]));
        state.enqueueFunc(function() {
            $.publish("/battle/end");
        });
        return state;
    };

    var formatCondition = function(pawn) {
        var condition = "on death's door";
        var pct = pawn.hp() / pawn.maxHp();
        if (pct > 0.3)
            condition = "wounded";
        if (pct > 0.5)
            condition = "okay";
        if (pct > 0.9)
            condition = "unhurt";

        if (pawn.hpClass) {
            if (pawn.hpClass > 0.8) {
                condition += " and is strong";
            } else if (pawn.hpClass > 0.5) {
                condition += " and is average";
            } else {
                condition += " and is frail";
            }
        }
        return condition + ".";
    };

    var executeInspectAction = function(action, battleState) {
        var state = new BattleCompositeState();
        var messages = [action.user.name + " is sizing up the situation..."];

        _(battleState.enemyPawns).each(function(enemy) {
            if (enemy.isAlive()) {
                // TODO: shouldn't know about entity...
                messages.push(enemy.entity.family + "/" + enemy.name);
                _(enemy.entity.desc.split('|')).each(function(splat) {
                    messages.push(splat);
                });
                messages.push("It looks " + formatCondition(enemy));
            }
        });

        state.enqueueState(new BattleMessageState(messages));

        return state;
    };

    return function BattleExecuteState(battleState, actions, nextRound) {
        var wonBattle = function() {
            return _(battleState.enemyPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

        var lostBattle = function() {
            return _(battleState.playerPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

        var xpPerPerson = function() {
            var totalXp = 0;
            _(battleState.enemyPawns).each(function(pawn) {
                totalXp += pawn.xp();
            });
            return Math.ceil(totalXp / battleState.playerPawns.length);
        };

        var playMusic = function(name) {
            battleState.enqueueFunc(function() { $.publish("/music/play", [name]); });
        };

        var winBattle = function() {
            var xp = xpPerPerson();

            playMusic("victory");

            battleState.enqueueState(new BattleMessageState([
                "All monsters perished!",
                "Got " + xp + "XP each!"
            ]));
            battleState.enqueueState(new BattleWonState(xp));
        };

        var loseBattle = function() {
            playMusic("defeat");

            battleState.enqueueState(new BattleMessageState([
                "It looks like you got your head handed to you.",
                "How regrettable."
            ]));

            battleState.enqueueFunc(function() {
                // TODO: do something besides just reviving players and ending the battle...
                _(battleState.playerPawns).each(function(player) {
                    player.restoreHp(1);
                });
                $.publish("/battle/end");
            });
        }

        this.start = function() {
            var xp;

            console.log(actions);
            _(actions).each(function(action) {
                if (action.type === "skill") {
                    battleState.enqueueState(executeUseSkillAction(action, battleState));
                }
                if (action.type === "flee") {
                    battleState.enqueueState(executeFleeAction(action, battleState));
                }
                if (action.type === "inspect") {
                    battleState.enqueueState(executeInspectAction(action, battleState));
                }
            });

            battleState.enqueueFunc(function refresh() {
                _(battleState.playerPawns).each(function(player) {
                    player.refresh();
                });
                _(battleState.enemyPawns).each(function(enemy) {
                    enemy.refresh();
                });
            });

            battleState.enqueueFunc(function() {
                if (wonBattle()) {
                    winBattle();
                } else if (lostBattle()) {
                    loseBattle();
                } else {
                    nextRound();
                }
            });
        };
        this.update = function() { return true; };
        this.draw = _.noop;
    };
});