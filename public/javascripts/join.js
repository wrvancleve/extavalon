document.addEventListener('DOMContentLoaded', function () {
    const code = document.getElementsByName("code")[0];
    const name = document.getElementsByName("name")[0];

    function updateButtons() {
        const codeLength = code.value.trim().length;
        const nameLength = name.value.trim().length;
        const joinGame = document.getElementById("join-game-button");

        if (nameLength < 2 || nameLength > 12 || codeLength != 4) {
            if (!joinGame.classList.contains("future-disabled")) {
                joinGame.classList.add("future-disabled");
            }
            joinGame.disabled = true;
        }
        else {
            if (joinGame.classList.contains("future-disabled")) {
                joinGame.classList.remove("future-disabled");
            }
            joinGame.disabled = false;
        }
    }

    code.oninput = function () {
        let p=this.selectionStart;
        this.value=this.value.toUpperCase();
        this.setSelectionRange(p, p);
        updateButtons();
    };
    name.oninput = updateButtons;
});