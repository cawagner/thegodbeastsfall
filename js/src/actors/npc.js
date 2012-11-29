define(['actors/actor', 'actors/npc-behaviors', 'direction'], function(Actor, npcBehaviors, direction) {
    "use strict";

    function Npc(properties) {
        var beforeTalkHandlers = [];
        var afterTalkHandlers = [];

        _.defaults(properties, {
            "archetype": "oldman",
            "behavior": "wanderlust"
        });

        // bgobjs can only be stationary.
        if (properties.archetype === "bgobj") {
            properties.behavior = "stationary";
        }

        Actor.call(this, properties.archetype);

        this.wander = npcBehaviors[properties.behavior](this);

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
            var text = [];
            var sayProperty = new RegExp('^' + dialogueName);
            var sayProperties = _(Object.keys(properties)).filter(function(key) {
                return sayProperty.test(key);
            });

            sayProperties.sort();

            _(sayProperties).each(function(key) {
                text.push(properties[key]);
            });

            if (text.length) {
                return this.say(text);
            } else {
                return {
                    done: function(fn) {
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

            _(beforeTalkHandlers).each(function(fn){
                cancelled = cancelled || (fn.call(self) === false);
            });

            if (!cancelled) {
                this.runDialogue("say").done(function() {
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