document.addEventListener('DOMContentLoaded', function () {
    document.getElementsByName("name")[0].oninput = function(){
        const createGame = document.getElementById("create-game-button");
        const length = this.value.trim().length;
        if (length < 2 || length > 12) {
            if (!createGame.classList.contains("future-disabled")) {
                createGame.classList.add("future-disabled");
            }
            createGame.disabled = true;
        }
        else {
            if (createGame.classList.contains("future-disabled")) {
                createGame.classList.remove("future-disabled");
            }
            createGame.disabled = false;
        }
    };
});