define(["pawns/pawn-base"], function(PawnBase) {
    "use strict";

    function CharacterPawn(character) {
        PawnBase.call(this, character);
        this.character = character;
    };

    CharacterPawn.prototype = new PawnBase();

    CharacterPawn.prototype.takeDamage = function(amount) {
        this.character.hp -= amount;
    };

    CharacterPawn.prototype.consumeMp = function(amount) {
        this.character.mp -= amount;
    }

    return CharacterPawn;
});