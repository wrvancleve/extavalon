$(document).ready(function () {
    const joinGame = $("#join-game-button");
    const codeInput = $("input[name=code]");
    const nameInput = $("input[name=name]");

    codeInput.on('input',function() {
        const nameLength = nameInput.val().trim().length;
        const codeLength = codeInput.val().trim().length;

        if (nameLength < 2 || nameLength > 12 || codeLength != 4) {
            if (!joinGame.hasClass("future-disabled")) {
                joinGame.addClass("future-disabled");
            }
            joinGame.attr('disabled', true);
        }
        else {
            if (joinGame.hasClass("future-disabled")) {
                joinGame.removeClass("future-disabled");
            }
            joinGame.attr('disabled',false);
        }
    });

    nameInput.on('input',function() {
        const nameLength = nameInput.val().trim().length;
        const codeLength = codeInput.val().trim().length;

        if (nameLength < 2 || nameLength > 12 || codeLength != 4) {
            if (!joinGame.hasClass("future-disabled")) {
                joinGame.addClass("future-disabled");
            }
            joinGame.attr('disabled', true);
        }
        else {
            if (joinGame.hasClass("future-disabled")) {
                joinGame.removeClass("future-disabled");
            }
            joinGame.attr('disabled',false);
        }
    });
});