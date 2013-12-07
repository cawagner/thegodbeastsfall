define(['actors/actor', 'actors/npc-behaviors', 'direction'], function(Actor, npcBehaviors, direction) {
    "use strict";

    function EventArgs() {
        this.defaultPrevented = false;
    }
    EventArgs.prototype.preventDefault = function() {
        this.defaultPrevented = true;
    };

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

        this.addAfterTalk = function(fn) {
            afterTalkHandlers.push(fn);
        };

        this.runDialogue = function(dialogueName) {
            var self = this;
            var text = _(properties).valuesOfPropertiesStartingWith(dialogueName);

            if (text.length) {
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

            var e = new EventArgs({ sender: self });
            this.trigger('beforeTalk', [e]);

            if (!e.defaultPrevented) {
                this.runDialogue("say").then(function() {
                    var e = new EventArgs({ sender: self });
                    this.trigger('afterTalk', [e]);
                });
            }
        }
    };

    Npc.prototype = new Actor();

    return Npc;
});