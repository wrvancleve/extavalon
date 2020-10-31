$(document).ready(function () {
    $("input[name=name]").on('input',function() {
        const createGame = $('#create-game-button');
        const length = $(this).val().trim().length;
        if (length < 2 || length > 12) {
            if (!createGame.hasClass("future-disabled")) {
                createGame.addClass("future-disabled");
            }
            createGame.attr('disabled', true);
        }
        else {
            if (createGame.hasClass("future-disabled")) {
                createGame.removeClass("future-disabled");
            }
            createGame.attr('disabled',false);
        }
    });
});