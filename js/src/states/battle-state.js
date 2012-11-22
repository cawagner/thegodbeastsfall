define([
    "underscore",
    "game-state",
    "pawns/pawns",
    "gui",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    "battle/battle-decision-state",
    "battle/battle-composite-state"
], function(
    _,
    gameState,
    pawns,
    GuiRenderer,
    BattleMessageState,
    BattleMenuState,
    BattleDecisionState,
    BattleCompositeState
) {
    function BattleState(enemies) {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.enemyPawns = [];
        _(enemies).each(function(enemy) {
            var pawn = new pawns.EnemyPawn(enemy);
            pawn.wander = { x: 0, y: 0 };
            self.enemyPawns.push(pawn);
        });

        this.rootState = new BattleCompositeState();

        this.enqueueState(new BattleMessageState(_(this.enemyPawns).map(_.template("Aggressed by {{name}}!"))));
        this.enqueueState(new BattleMenuState(this));
        this.enqueueState(new BattleDecisionState(this));

        this.rootState.start();
    };

    BattleState.prototype.enqueueFunc = function(fn) {
        this.rootState.enqueueFunc(fn);
    };

    BattleState.prototype.enqueueState = function(state) {
        this.rootState.enqueueState(state);
    };

    BattleState.prototype.update = function() {
        this.rootState.update();
    };

    BattleState.prototype.draw = function() {
        Game.instance.graphics.setFillColorRGB(0, 0, 0);
        Game.instance.graphics.drawFilledRect(0, 0, 320, 240);

        // draw enemies
        this.drawEnemies();
        this.drawAllies();

        this.rootState.draw();
    };

    BattleState.prototype.drawEnemies = function() {
        var MAX_ENEMIES = 3;
        var i, pawn, dest, margin = 160 - (this.enemyPawns.length-1)*50;

        for (i = 0; i < this.enemyPawns.length; ++i) {
            pawn = this.enemyPawns[i];
            if (pawn.isHidden) {
                continue;
            }
            dest = {
                x: i * 100 + margin - pawn.rect.width / 2 + pawn.wander.x,
                y: 160 - pawn.rect.height + pawn.wander.y,
                width: pawn.rect.width,
                height: pawn.rect.height
            };
            pawn.x = dest.x;
            pawn.y = dest.y;

            if (Math.random() < 0.05) {
                pawn.wander.x = Math.random() * 2 - 2;
                pawn.wander.y = Math.random() * 2 - 2;
            }

            Game.instance.graphics.drawImageRect(pawn.image, pawn.rect, dest);
        }
    };

    BattleState.prototype.drawAllies = function() {
        var i;
        for (i = 0; i < this.playerPawns.length; ++i) {
            this.playerPawns[i].x = 200 + i * 36 + 18;
            this.playerPawns[i].y = 190;
            this.gui.drawStatus(200 + i * 36, 185, this.playerPawns[i]);
        }
    }

    return BattleState;
});