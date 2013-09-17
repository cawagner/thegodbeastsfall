define(['actors/actor', 'actors/npc-behaviors', 'direction'], function(Actor, npcBehaviors, direction) {
    "use strict";

    function Npc(properties) {
        var beforeTalkHandlers = [];
        var afterTalkHandlers = [];

        _.defaults(properties, {
            "archetype": "bgobj",
            "behavior": "stationary"
        });

        Actor.call(this, properties.archetype);

        this.wander = npcBehaviors[properties.behavior](this);

        this.font = properties.font;

        if ("direction" in properties) {
            this.direction = direction.fromName(properties.direction);
        }

        this.onUpdate = function(timeScale) {
            this.wander();
        };

        this.addBeforeTalk = function(fn) {
            beforeTalkHandlers.push(fn);
        };

        this.addAfterTalk = function(fn) {
            afterTalkHandlers.push(fn);
        };

        this.runDialogue = function(dialogueName) {
            var self = this;
            var text = _(properties).valuesOfPropertiesStartingWith(dialogueName);

            if (text.length) {
                console.log(this.font);
                return this.say(text);
            } else {
                return {
                    then: function(fn) {
                        fn.call(self);
                    }
                };
            }
        };

        this.onTalk = function() {
            var self = this;
            var text = [];
            var cancelled = false;
            var sayProperties;

            beforeTalkHandlers.forEach(function(fn){
                cancelled = cancelled || (fn.call(self) === false);
            });

            if (!cancelled) {
                this.runDialogue("say").then(function() {
                    _(afterTalkHandlers).each(function(fn) {
                        fn.call(self);
                    });
                });
            };
        }
    };

    Npc.prototype = new Actor();

    return Npc;
});