define([
    "underscore",
    "game-state",
    "pawns/pawns",
    "gui",
    "battle/battle-message-state",
    "battle/battle-menu-state"
], function(
    _,
    gameState,
    pawns,
    GuiRenderer,
    BattleMessageState,
    BattleMenuState
) {
    function FoopState(battleState) {
        this.start = function(commands) {
            console.log(commands);
            battleState.enqueueState(new BattleMessageState([
                "Held will " + commands[0].action + " " + (commands[0].param || "") + "!"
            ]));
            battleState.enqueueState(new BattleMenuState(battleState));
            battleState.enqueueState(new FoopState(battleState));
        }
        this.update = function() {
            return true;
        };
        this.draw = function() {

        };
    };

    function BattleState() {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        var enemyImage = new Image();
        enemyImage.src = "assets/img/enemies.png";

        this.enemyPawns = [
            {
                name: "Slime",
                image: enemyImage,
                rect: { x: 0, y: 100, width: 36, height: 40 }
            },
            {
                name: "Rat",
                image: enemyImage,
                rect: { x: 4, y: 500, width: 70, height: 60 }
            },
            {
                name: "Slime",
                image: enemyImage,
                rect: { x: 0, y: 100, width: 36, height: 40 }
            }
        ];

        this.queuedStates = [];

        this.enqueueState(new BattleMessageState(_(this.enemyPawns).map(_.template("Aggressed by {{name}}!"))));
        this.enqueueState(new BattleMenuState(this));
        this.enqueueState(new FoopState(this));

        this.advanceState();
    };

    BattleState.prototype.enqueueState = function(state) {
        this.queuedStates.push(state);
    };

    BattleState.prototype.advanceState = function(result) {
        if (!this.queuedStates.length) {
            throw "Tried to advance state, but there is no next state!";
        }
        this.currentState = this.queuedStates.shift();
        this.currentState.start(result);
    };

    BattleState.prototype.update = function() {
        var result;
        if (result = this.currentState.update()) {
            this.advanceState(result);
        }
    };

    BattleState.prototype.draw = function() {
        Game.instance.graphics.setFillColorRGB(0, 0, 0);
        Game.instance.graphics.drawFilledRect(0, 0, 320, 240);

        // draw enemies
        this.drawEnemies();
        this.drawAllies();

        this.currentState.draw();
    };

    BattleState.prototype.drawEnemies = function() {
        var MAX_ENEMIES = 3;
        var i, pawn, dest, margin = 160 - (this.enemyPawns.length-1)*50;

        for (i = 0; i < this.enemyPawns.length; ++i) {
            pawn = this.enemyPawns[i];
            dest = {
                x: i * 100 + margin - pawn.rect.width / 2,
                y: 160 - pawn.rect.height,
                width: pawn.rect.width,
                height: pawn.rect.height
            };
            Game.instance.graphics.drawImageRect(pawn.image, pawn.rect, dest);
        }
    };

    BattleState.prototype.drawAllies = function() {
        var i;
        for (i = 0; i < this.playerPawns.length; ++i) {
            this.gui.drawStatus(200 + i * 36, 185, this.playerPawns[i]);
        }
    }

    return BattleState;
});