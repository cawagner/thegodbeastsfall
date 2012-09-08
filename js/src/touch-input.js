function initTouchInput() {
    $("[data-keycode]").on("touchstart", function() {
        document.onkeydown({ keyCode: parseInt($(this).data("keycode"), 10) });
    }).on("touchend", function() {
        document.onkeyup({ keyCode: parseInt($(this).data("keycode"), 10) });
    }).on("click", function(){
        return false;
    });

    $("#touchControls").change(function(){
        $("body").toggleClass("touchControls", $(this).is(":checked"));
    });
}