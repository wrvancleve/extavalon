class Game {
    constructor(players, settings) {
        this.playerCount = players.length;
        if (this.playerCount < 7) {
            this.spyCount = 2;
        }
        else if (this.playerCount < 10) {
            this.spyCount = 3;
        }
        else {
            this.spyCount = 4;
        }
        this.resistanceCount = this.playerCount - this.spyCount;
        this.players = players;
        this.settings = settings;
        if (settings.assassin === "Enabled" || (settings.assassin === "Random" && Math.random() >= 0.5)) {
            this.assassin = true;
        } else {
            this.assassin = false;
        }
        this.assassinIndex = -1;
        this.utherInformationIndex = -1;
        this.leonInformationIndexes = [];
        this.luciusInformation = {};
        this.spyList = [];
        this.roles = [];

        this.setupGame();
    }

    setupGame() {
        const spyRoles = this.getSpyRoles();
        const resistanceRoles = this.getResistanceRoles(spyRoles.includes("Morgana"), spyRoles.includes("Lucius"));
        const spyIndexes = this.getSpyIndexes();
        if (this.assassin) {
            this.assassinIndex = this.shuffle(spyIndexes)[0];
        }

        for (var i = 0; i < this.playerCount; i++) {
            const isSpy = spyIndexes.includes(i);
            const roleList = isSpy ? spyRoles : resistanceRoles;
            this.roles.push(roleList.pop());
        }

        const maelagantIndex = this.roles.findIndex(role => role === "Maelagant");
        if (maelagantIndex !== -1) {
            this.spyList.push(maelagantIndex);
            for (var i = 0; i < spyIndexes.length; i++) {
                const spyIndex = spyIndexes[i];
                if (!this.spyList.includes(spyIndex)) {
                    this.spyList.push(spyIndex);
                }
            }
        } else {
            this.spyList = spyIndexes;
        }

        this.getUtherInformationIndex();
        this.getLeonInformationIndexes();
        this.getLuciusInformation();
    }

    getLeonInformationIndexes() {
        const leonIndex = this.roles.findIndex(role => role === "Leon");
        if (leonIndex !== -1) {
            const indexes = this.shuffle(this.getArrayTo(this.playerCount));
            for (var i = 0; i < this.playerCount; i++) {
                const currentIndex = indexes[i];
                if (currentIndex !== leonIndex && this.leonInformationIndexes.length < 2) {
                    this.leonInformationIndexes.push(currentIndex);
                }
            }
        }
    }

    getUtherInformationIndex() {
        const resistanceIndexes = [];
        const utherIndex = this.roles.findIndex(role => role === "Uther");
        if (utherIndex != -1) {
            for (var i = 0 ; i < this.playerCount; i++) {
                if (!this.spyList.includes(i) && i != utherIndex) {
                    resistanceIndexes.push(i);
                }
            }
            this.utherInformationIndex = this.shuffle(resistanceIndexes)[0];
        }
    }

    getLuciusInformation() {
        if (this.roles.findIndex(role => role === "Lucius") != -1) {
            const resistanceSeeIndexes = [];
            const seeRoles = ["Merlin", "Percival", "Tristan", "Iseult", "Uther", "Leon", "Guinevere", "Galahad"];
            const guinevereSees = [];
            for (var i = 0 ; i < this.playerCount; i++) {
                if (!this.spyList.includes(i) && seeRoles.includes(this.roles[i])) {
                    if (this.roles[i] === "Guinevere") {
                        for (var j = 0 ; j < this.playerCount; j++) {
                            if (this.roles[j] === "Lancelot" || this.roles[j] === "Maelagant") {
                                guinevereSees.push(j);
                            }
                        }

                        if (guinevereSees.length == 0) {
                            continue;
                        }
                    }
                    resistanceSeeIndexes.push(i);
                }
            }
            const sourceIndex = this.shuffle(resistanceSeeIndexes)[0];
            this.luciusInformation.source = sourceIndex;

            switch (this.roles[sourceIndex]) {
                case "Merlin":
                    var possibleDestinationIndexes = [];
                    for (var i = 0 ; i < this.playerCount; i++) {
                        if ((this.spyList.includes(i) && this.roles[i] !== "Mordred") ||
                            this.roles[i] === "Puck") {
                            possibleDestinationIndexes.push(i);
                        }
                    }
                    this.luciusInformation.destination = this.shuffle(possibleDestinationIndexes)[0];
                    break;
                case "Percival":
                    var possibleDestinationIndexes = [];
                    for (var i = 0 ; i < this.playerCount; i++) {
                        if (this.roles[i] === "Merlin" || this.roles[i] === "Morgana") {
                            possibleDestinationIndexes.push(i);
                        }
                    }
                    this.luciusInformation.destination = this.shuffle(possibleDestinationIndexes)[0];
                    break;
                case "Tristan":
                    this.luciusInformation.destination = this.roles.findIndex(role => role === "Iseult");
                    break;
                case "Iseult":
                    this.luciusInformation.destination = this.roles.findIndex(role => role === "Tristan");
                    break;
                case "Uther":
                    this.luciusInformation.destination = this.utherInformationIndex;
                    break;
                case "Leon":
                    this.luciusInformation.destination = this.shuffle(this.leonInformationIndexes)[0];
                    break;
                case "Guinevere":
                    this.luciusInformation.destination = this.shuffle(guinevereSees)[0];
                    break;
                case "Galahad":
                    this.luciusInformation.destination = this.roles.findIndex(role => role === "Arthur");
                    break;
            }
        }
    }

    getSpyRoles() {
        var spyRoles = ["Mordred", "Morgana", "Maelagant", "Colgrevance"];
        if (this.settings.lucius) {
            spyRoles.push("Lucius");
        }

        return this.shuffle(spyRoles).slice(0, this.spyCount);
    }

    getEnabledResistanceRoles() {
        var resistanceRoles = ["Merlin", "Percival", "Lancelot", "Tristan", "Iseult", "Arthur"];
        if (this.settings.guinevere) {
            resistanceRoles.push("Guinevere");
        }
        if (this.settings.puck) {
            resistanceRoles.push("Puck");
        }
        if (this.settings.robin) {
            resistanceRoles.push("Sir Robin");
        }
        if (this.settings.galahad) {
            resistanceRoles.push("Galahad");
        }
        if (this.settings.jester && this.assassin) {
            resistanceRoles.push("Jester");
        }
        return resistanceRoles;
    }

    getResistanceRoles(containsMorgana, containsLucius) {
        var enabledResistanceRoles = this.getEnabledResistanceRoles();
        var usedResistanceRoles = [];

        var selectingRoles = true;
        do {
            usedResistanceRoles = [];
            var possibleResistanceRoles = this.shuffle(enabledResistanceRoles);
            var containsAssassinableRole = false;
            var containsSeeRole = false;
            var leonPossible = this.playerCount > 7;

            do {
                const currentRole = possibleResistanceRoles.pop();

                var add = true;
                if (usedResistanceRoles.length == this.resistanceCount - 1 &&
                    ((currentRole === "Percival" && !containsMorgana &&
                        possibleResistanceRoles.findIndex(e => e === "Merlin") != -1) ||
                        (currentRole === "Galahad" &&
                            possibleResistanceRoles.findIndex(e => e === "Arthur") != -1))) {
                    add = false;
                }

                if (add) {
                    switch (currentRole) {
                        case "Lancelot":
                            usedResistanceRoles.push(currentRole);
                            var puckIndex = possibleResistanceRoles.findIndex(e => e === "Puck");
                            if (puckIndex != -1) {
                                possibleResistanceRoles.splice(puckIndex,1);
                            }
                            break;
                        case "Puck":
                            usedResistanceRoles.push(currentRole);
                            var lancelotIndex = possibleResistanceRoles.findIndex(e => e === "Lancelot");
                            if (lancelotIndex != -1) {
                                possibleResistanceRoles.splice(lancelotIndex,1);
                            }
                            var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                            if (jesterIndex != -1) {
                                possibleResistanceRoles.splice(jesterIndex,1);
                            }
                            var robinIndex = possibleResistanceRoles.findIndex(e => e === "Sir Robin");
                            if (robinIndex != -1) {
                                possibleResistanceRoles.splice(robinIndex,1);
                            }
                            break;
                        case "Sir Robin":
                            usedResistanceRoles.push(currentRole);
                            var puckIndex = possibleResistanceRoles.findIndex(e => e === "Puck");
                            if (puckIndex != -1) {
                                possibleResistanceRoles.splice(puckIndex,1);
                            }
                            var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                            if (jesterIndex != -1) {
                                possibleResistanceRoles.splice(jesterIndex,1);
                            }
                            break;
                        case "Jester":
                            usedResistanceRoles.push(currentRole);
                            var robinIndex = possibleResistanceRoles.findIndex(e => e === "Sir Robin");
                            if (robinIndex != -1) {
                                possibleResistanceRoles.splice(robinIndex,1);
                            }
                            var arthurIndex = possibleResistanceRoles.findIndex(e => e === "Arthur");
                            if (arthurIndex != -1) {
                                possibleResistanceRoles.splice(arthurIndex,1);
                            }
                            var puckIndex = possibleResistanceRoles.findIndex(e => e === "Puck");
                            if (puckIndex != -1) {
                                possibleResistanceRoles.splice(puckIndex,1);
                            }
                            var galahadIndex = possibleResistanceRoles.findIndex(e => e === "Galahad");
                            if (galahadIndex != -1) {
                                possibleResistanceRoles.splice(galahadIndex,1);
                            }
                            break;
                        case "Arthur":
                            usedResistanceRoles.push(currentRole);
                            var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                            if (jesterIndex != -1) {
                                possibleResistanceRoles.splice(jesterIndex,1);
                            }
                            containsAssassinableRole = true;
                            break;
                        case "Galahad":
                            usedResistanceRoles.push(currentRole);
                            var tristanIndex = possibleResistanceRoles.findIndex(e => e === "Tristan");
                            if (tristanIndex != -1) {
                                possibleResistanceRoles.splice(tristanIndex,1);
                            }
                            var iseultIndex = possibleResistanceRoles.findIndex(e => e === "Iseult");
                            if (iseultIndex != -1) {
                                possibleResistanceRoles.splice(iseultIndex,1);
                            }
                            var arthurIndex = possibleResistanceRoles.findIndex(e => e === "Arthur");
                            if (arthurIndex != -1) {
                                usedResistanceRoles.push("Arthur");
                                possibleResistanceRoles.splice(arthurIndex,1);
                                var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                                if (jesterIndex != 1) {
                                    possibleResistanceRoles.splice(jesterIndex,1);
                                }
                                containsAssassinableRole = true;
                            }
                            containsSeeRole = true;
                            break;
                        case "Percival":
                            usedResistanceRoles.push(currentRole);
                            var merlinIndex = possibleResistanceRoles.findIndex(e => e === "Merlin")
                            if (!containsMorgana && merlinIndex != -1) {
                                usedResistanceRoles.push("Merlin");
                                possibleResistanceRoles.splice(merlinIndex,1);
                                containsAssassinableRole = true;
                            }
                            containsSeeRole = true;
                            leonPossible = false;
                            break;
                        case "Merlin":
                            usedResistanceRoles.push(currentRole);
                            containsAssassinableRole = true;
                            containsSeeRole = true;
                            break;
                        case "Tristan":
                        case "Iseult":
                            usedResistanceRoles.push(currentRole);
                            var galahadIndex = possibleResistanceRoles.findIndex(e => e === "Galahad");
                            if (galahadIndex != -1) {
                                possibleResistanceRoles.splice(galahadIndex,1);
                            }
                            containsSeeRole = true;
                            break;
                        case "Guinevere":
                            usedResistanceRoles.push(currentRole);
                            containsSeeRole = true;
                            leonPossible = false;
                            break;
                        default:
                            usedResistanceRoles.push(currentRole);
                            break;
                    }
                }
            } while (possibleResistanceRoles.length > 0 && usedResistanceRoles.length < this.resistanceCount);
            selectingRoles = (usedResistanceRoles.length != this.resistanceCount) || (this.assassin && !containsAssassinableRole)
                || (containsLucius && !containsSeeRole);

            const tristanFinalIndex = usedResistanceRoles.findIndex(e => e === "Tristan");
            const iseultFinalIndex = usedResistanceRoles.findIndex(e => e === "Iseult");
            if (tristanFinalIndex == -1 ^ iseultFinalIndex == -1) {
                const replacementIndex = tristanFinalIndex == -1 ? iseultFinalIndex : tristanFinalIndex;
                if (leonPossible && this.settings.leon) {
                    if (Math.random() >= 0.5) {
                        usedResistanceRoles[replacementIndex] = "Leon";
                    } else {
                        usedResistanceRoles[replacementIndex] = "Uther";
                    }
                } else {
                    usedResistanceRoles[replacementIndex] = "Uther";
                }
            }
        } while (selectingRoles);

        return this.shuffle(usedResistanceRoles);
    }

    getSpyIndexes() {
        return this.shuffle(this.getArrayTo(this.playerCount)).slice(0, this.spyCount);
    }

    getArrayTo(max) {
        const array = [];
        for (var i = 0; i < max; i++) {
            array.push(i);
        }
        return array;
    }

    shuffle(array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        const newArray = [];
        for (i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        return newArray;
    }

    getPlayerHTML(playerIndex) {
        const playerRole = this.roles[playerIndex];
        var playerHTML = null;
        switch (playerRole) {
            case "Merlin":
                playerHTML = this.getMerlinHTML();
                break;
            case "Percival":
                playerHTML = this.getPercivalHTML();
                break;
            case "Uther":
                playerHTML = this.getUtherHTML();
                break;
            case "Lancelot":
                playerHTML = this.getLancelotHTML();
                break;
            case "Tristan":
                playerHTML = this.getTristanHTML();
                break;
            case "Iseult":
                playerHTML = this.getIseultHTML();
                break;
            case "Leon":
                playerHTML = this.getLeonHTML();
                break;
            case "Puck":
                playerHTML = this.getPuckHTML();
                break;
            case "Sir Robin":
                playerHTML = this.getRobinHTML();
                break;
            case "Arthur":
                playerHTML = this.getArthurHTML();
                break;
            case "Guinevere":
                playerHTML = this.getGuinevereHTML();
                break;
            case "Jester":
                playerHTML = this.getJesterHTML();
                break;
            case "Galahad":
                playerHTML = this.getGalahadHTML();
                break;
            case "Mordred":
                playerHTML = this.getMordredHTML(playerIndex);
                break;
            case "Morgana":
                playerHTML = this.getMorganaHTML(playerIndex);
                break;
            case "Maelagant":
                playerHTML = this.getMaelagantHTML(playerIndex);
                break;
            case "Colgrevance":
                playerHTML = this.getColgrevanceHTML(playerIndex);
                break;
            case "Lucius":
                playerHTML = this.getLuciusHTML(playerIndex);
                break;
        }
        return playerHTML;
    }

    getMerlinHTML() {
        var merlinHTML = `
            <h2 class="resistance">Merlin</h2>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if ((this.spyList.includes(i) && this.roles[i] !== "Mordred") || this.roles[i] === "Puck") {
                if (this.settings.puck) {
                    merlinHTML += `<p>${this.players[i].name} is evil or <span class="resistance">Puck</span></p>`;
                } else {
                    merlinHTML += `<p>${this.players[i].name} is evil</p>`;
                }
            }
        }
        merlinHTML += `</section>`;

        return merlinHTML;
    }

    getPercivalHTML() {
        var percivalHTML = `
            <h2 class="resistance">Percival</h2>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if (this.roles[i] === "Merlin" || this.roles[i] === "Morgana") {
                percivalHTML += `<p>${this.players[i].name} is <span class="resistance">Merlin</span> or <span class="spy">Morgana</span></p>`;
            }
        }
        percivalHTML += `</section>`;

        return percivalHTML;
    }

    getTristanHTML() {
        var tristanHTML = `
            <h2 class="resistance">Tristan</h2>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if (this.roles[i] === "Iseult") {
                tristanHTML += `<p>${this.players[i].name} is <span class="resistance">Iseult</span></p></section>`;
                break;
            }
        }

        return tristanHTML;
    }

    getIseultHTML() {
        var tristanHTML = `
            <h2 class="resistance">Iseult</h2>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if (this.roles[i] === "Tristan") {
                tristanHTML += `<p>${this.players[i].name} is <span class="resistance">Tristan</span></p></section>`;
                break;
            }
        }

        return tristanHTML;
    }

    getUtherHTML() {
        return `
            <h2 class="resistance">Uther</h2>
            <section><p>You see:</p></section>
            <section><p>${this.players[this.utherInformationIndex].name} is good</p></section>
        `;
    }

    getArthurHTML() {
        var arthurHTML = `
            <h2 class="resistance">Arthur</h2>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if (!this.spyList.includes(i) && this.roles[i] !== "Arthur") {
                arthurHTML += `<p><span class="resistance">${this.roles[i]}</span> is in the game</p>`;
            }
        }
        arthurHTML += `</section>`;

        return arthurHTML;
    }

    getLancelotHTML() {
        return `
            <h2 class="resistance">Lancelot</h2>
            <section><p>You may play reserve cards while on missions.</p></section>
        `;
    }

    getPuckHTML() {
        return `
            <h2 class="resistance">Puck</h2>
            <section>
                <p>You only win if the Resistance wins on mission 5.</p>
                <p>You may play fail cards while on missions.</p>
                <p>If <span class="resistance">Merlin</span> is in the game, you are seen by <span class="resistance">Merlin</span> as a possible spy.</p>
            </section>
        `;
    }

    getRobinHTML() {
        return `
            <h2 class="resistance">Sir Robin</h2>
            <section>
                <p>You only win if the resistance wins and you went on two or fewer missions.</p>
            </section>
        `;
    }

    getJesterHTML() {
        var jesterHTML = `
            <h2 class="resistance">Jester</h2>
            <section><p>You only win if you get assassinated by the assassin.</p></section>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if (this.roles[i] === "Tristan" || this.roles[i] === "Iseult" || this.roles[i] === "Merlin") {
                jesterHTML += `<p><span class="resistance">${this.roles[i]}</span> is in the game</p>`;
            }
        }
        jesterHTML += `</section>`;

        return jesterHTML;
    }

    getGuinevereHTML() {
        var guinevereHTML = `
            <h2 class="resistance">Guinevere</h2>
            <section><p>You see:</p></section><section>
        `;

        var reverseCount = 0;
        for (var i = 0; i < this.playerCount; i++) {
            if (this.roles[i] === "Lancelot" || this.roles[i] === "Maelagant") {
                reverseCount += 1;
                guinevereHTML += `<p>${this.players[i].name} is <span class="resistance">Lancelot</span> or <span class="spy">Maelagant</span></p>`;
            }
        }

        if (reverseCount === 0) {
            guinevereHTML += `<p><span class="resistance">Lancelot</span> is not in the game</p>
                <p><span class="spy">Maelagant</span> is not in the game</p></section>`;
        } else {
            guinevereHTML += `</section>`;
        }

        return guinevereHTML;
    }

    getLeonHTML() {
        var leonHTML = `
            <h2 class="resistance">Leon</h2>
            <section><p>You see:</p></section><section>
        `;

        var spyCount = 0;
        if (this.spyList.includes(this.leonInformationIndexes[0])) {
            spyCount += 1;
        }
        if (this.spyList.includes(this.leonInformationIndexes[1])) {
            spyCount += 1;
        }

        if (spyCount == 1) {
            leonHTML += `<p>${this.players[this.leonInformationIndexes[0]].name} or ${this.players[this.leonInformationIndexes[1]].name}
                is good; the other is evil</p></section>
            `;
        } else {
            leonHTML += `<p>${this.players[this.leonInformationIndexes[0]].name} and ${this.players[this.leonInformationIndexes[1]].name}
                are either both good or both evil</p></section>
            `;
        }

        return leonHTML;
    }

    getGalahadHTML() {
        var galahadHTML = `
            <h2 class="resistance">Galahad</h2>
            <section><p>You see:</p></section><section>
        `;

        for (var i = 0; i < this.playerCount; i++) {
            if (this.roles[i] === "Arthur") {
                galahadHTML += `<p>${this.players[i].name} is <span class="resistance">Arthur</span></p></section>`;
                break;
            }
        }

        return galahadHTML;
    }

    getMordredHTML(playerIndex) {
        var mordredHTML = `
            <h2 class="spy">Mordred</h2>
            <section><p>You are not seen by <span class="resistance">Merlin</span>.</p></section>
        `;

        mordredHTML += this.getSpyHTML(false, this.assassinIndex === playerIndex);
        return mordredHTML;
    }

    getMorganaHTML(playerIndex) {
        var morganaHTML = `
            <h2 class="spy">Morgana</h2>
            <section><p>You are seen by <span class="resistance">Percival</span> as a possible <span class="resistance">Merlin</span>.</p></section>
        `;

        morganaHTML += this.getSpyHTML(false, this.assassinIndex === playerIndex);
        return morganaHTML;
    }

    getMaelagantHTML(playerIndex) {
        var maelagantHTML = `
            <h2 class="spy">Maelagant</h2>
            <section><p>You may play reserve cards while on missions.</p></section>
        `;

        maelagantHTML += this.getSpyHTML(false, this.assassinIndex === playerIndex);
        return maelagantHTML;
    }

    getColgrevanceHTML(playerIndex) {
        var colgrevanceHTML = `<h2 class="spy">Colgrevance</h2>`;
        colgrevanceHTML += this.getSpyHTML(true, this.assassinIndex === playerIndex);
        return colgrevanceHTML;
    }

    getLuciusHTML(playerIndex) {
        const luciusSourceName = this.players[this.luciusInformation.source].name;
        const luciusDestinationName = this.players[this.luciusInformation.destination].name;

        var luciusHTML = `
            <h2 class="spy">Lucius</h2>
            <section>
                <p>You hijacked ${luciusSourceName}.</p>
                <p>${luciusSourceName} sees ${luciusDestinationName}.</p>
            </section>
        `;

        luciusHTML += this.getSpyHTML(false, this.assassinIndex === playerIndex);
        return luciusHTML;
    }

    getSpyHTML(isColgrevance, isAssassin) {
        var spyHTML = "";

        if (isAssassin) {
            if (!isColgrevance) {
                spyHTML += `<section><p>You are also the assassin.</p></section>`;
            } else {
                spyHTML += `<section><p>You are the assassin.</p></section>`;
            }
        }

        spyHTML += `<section><p>You see:</p></section><section>`;

        for (var i = 0; i < this.spyList.length; i++) {
            var spyIndex = this.spyList[i];
            if (isColgrevance) {
                spyHTML += `<p>${i + 1}) ${this.players[spyIndex].name} is <span class="spy">${this.roles[spyIndex]}</span></p>`;
            } else {
                spyHTML += `<p>${i + 1}) ${this.players[spyIndex].name} is evil</p>`;
            }
        }
        spyHTML += `</section>`;

        return spyHTML;
    }
}

module.exports = Game;