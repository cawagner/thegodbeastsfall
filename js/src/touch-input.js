define(["jquery", "underscore"], function($, _) {
    "use strict";

    return {
        init: function(input) {
            $("[data-keycode]").on("touchstart mousedown", function() {
                document.onkeydown({ keyCode: parseInt($(this).data("keycode"), 10) });
            }).on("touchend mouseout mouseup", function() {
                document.onkeyup({ keyCode: parseInt($(this).data("keycode"), 10) });
            }).on("click", function(){
                return false;
            });

            var keyCodesToKeys = {
                37: 'left',
                39: 'right',
                38: 'up',
                40: 'down',
                90: 'confirm',
                88: 'cancel'
            };

            var movement = function(touches) {
                var pos = dpad.position();
                var x = touches[0].pageX - pos.left;
                var y = touches[0].pageY - pos.top + 60;
                var size = 60;

                var dirs = [
                    { keyCode: 37, fn: "isLeftDown", predicate: function() { return x < size; } },
                    { keyCode: 39, fn: "isRightDown", predicate: function() { return x > 2*size; } },
                    { keyCode: 38, fn: "isUpDown", predicate: function() { return y < size; } },
                    { keyCode: 40, fn: "isDownDown", predicate: function() { return y > 2*size; } }
                ];

                _(dirs).each(function(dir){
                    var isKeyDown = input[dir.fn]();
                    if (dir.predicate()) {
                        if (!isKeyDown) {
                            document.onkeydown(dir);
                        }
                    } else {
                        if (isKeyDown) {
                            document.onkeyup(dir);
                        }
                    }
                });
            };

            var dpad = $(".dpad").on("touchstart mousedown", function(e) {
                movement(e.originalEvent.touches || [e]);
            }).on("touchmove mousemove", function(e) {
                movement(e.originalEvent.touches || [e]);
            }).on("touchend mouseup mouseout", function(e) {
                if (input.isLeftDown()) {
                    document.onkeyup({ keyCode: 37 });
                }
                if (input.isRightDown()) {
                    document.onkeyup({ keyCode: 39 });
                }
                if (input.isUpDown()) {
                    document.onkeyup({ keyCode: 38 });
                }
                if (input.isDownDown()) {
                    document.onkeyup({ keyCode: 40 });
                }
            });

            $("#touchControls").change(function(){
                $("body").toggleClass("touchControls", $(this).is(":checked"));
            });

            document.body.ontouchmove = function(e) {
                e.preventDefault();
            };
        }
    }
});