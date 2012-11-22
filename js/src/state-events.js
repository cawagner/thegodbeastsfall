define([
    "underscore",
    "states/menu-state",
    "states/field-menu-state",
    "states/dialogue-state",
    "states/field-state",
    "states/battle-state",
    "states/status-state",
    "states/transitions/scroll-transition-state",
    "sound"
], function(
    _,
    MenuState,
    FieldMenuState,
    DialogueState,
    FieldState,
    BattleState,
    StatusState,
    ScrollTransitionState,
    sound
) {
    var oldMusic;
    var fakeNpc = {
        lockMovement: _.noop,
        unlockMovement: _.noop
    };

    return {
        init: function(game) {

            // TODO: move asset loading into common location that isn't here!
            sound.loadSound("hit");
            sound.loadSound("miss");
            sound.loadSound("critical");
            sound.loadSound("message");
            sound.loadSound("cursor");
            sound.loadSound("confirm");
            sound.loadSound("cancel");

            var inDungeon = false;

            // TODO: elsewhere?
            $.subscribe("/menu/open", function(menu) {
                game.pushState(new MenuState(menu));
            });

            // TODO: doesn't go here!
            $.subscribe("/npc/talk", function(messages, npc) {
                npc = npc || fakeNpc;

                npc.lockMovement();

                game.pushState(new DialogueState(messages, function() {
                    npc.unlockMovement();
                }));
            });

            $.subscribe("/hero/menu", function() {
                game.pushState(new FieldMenuState());
            });

            $.subscribe("/map/loading", function() {
                // TODO: really hackish...
                if (game.currentState() instanceof FieldState) {
                    game.popState();
                }
            });


            $.subscribe("/music/play", function(name) {
                sound.playMusic(name);
            });

            $.subscribe("/sound/play", function(name) {
                sound.playSound(name);
            });

            $.subscribe("/map/loaded", function(map, entrance) {
                var fieldState = new FieldState(map, entrance);
                game.pushState(fieldState);

                sound.playMusic(map.properties.music);

                // HACKY!
                inDungeon = map.properties.inDungeon;
                if (!inDungeon) {
                    $.publish("/party/heal");
                }
            });

            $.subscribe("/battle/start", function(enemies) {
                var battleState = new BattleState(enemies);
                var transition = new ScrollTransitionState(battleState);

                oldMusic = sound.getCurrentMusic();

                sound.playSound("battlestart");
                sound.playMusic("battle");

                game.pushState(transition);
            });

            $.subscribe("/battle/end", function() {
                // TODO: transition!
                sound.playMusic(oldMusic);
                game.popState();

                // HACKY...
                if (!inDungeon) {
                    $.publish("/party/heal");
                }
            });

            $.subscribe("/status/show", function(member) {
                game.pushState(new StatusState(member));
            });

            $.subscribe("/party/heal", function() {
                _(GameState.instance.party).each(function(member) {
                    member.hp = member.maxHp;
                });
            });
        }
    }
});