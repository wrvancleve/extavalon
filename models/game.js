const PlayerInformation = require('./playerInformation');
const ArrayHelper = require('./arrayHelper');

class Game {
    constructor(players, settings) {
        this.playerInformation = new PlayerInformation(players, settings);
        this.puckEnabled = settings.puck;
    }

    getPlayerHTML(playerIndex) {
        const playerRole = this._getPlayerRole(playerIndex);
        var playerHTML = null;
        switch (playerRole) {
            case "Merlin":
                playerHTML = this._getMerlinHTML(playerIndex);
                break;
            case "Percival":
                playerHTML = this._getPercivalHTML(playerIndex);
                break;
            case "Uther":
                playerHTML = this._getUtherHTML(playerIndex);
                break;
            case "Lancelot":
                playerHTML = this._getLancelotHTML();
                break;
            case "Tristan":
                playerHTML = this._getTristanHTML(playerIndex);
                break;
            case "Iseult":
                playerHTML = this._getIseultHTML(playerIndex);
                break;
            case "Leon":
                playerHTML = this._getLeonHTML(playerIndex);
                break;
            case "Puck":
                playerHTML = this._getPuckHTML();
                break;
            case "Arthur":
                playerHTML = this._getArthurHTML(playerIndex);
                break;
            case "Guinevere":
                playerHTML = this._getGuinevereHTML(playerIndex);
                break;
            case "Jester":
                playerHTML = this._getJesterHTML(playerIndex);
                break;
            case "Galahad":
                playerHTML = this._getGalahadHTML(playerIndex);
                break;
            case "Titania":
                playerHTML = this._getTitaniaHTML(playerIndex);
                break;
            case "Mordred":
                playerHTML = this._getMordredHTML(playerIndex);
                break;
            case "Morgana":
                playerHTML = this._getMorganaHTML(playerIndex);
                break;
            case "Maelagant":
                playerHTML = this._getMaelagantHTML(playerIndex);
                break;
            case "Colgrevance":
                playerHTML = this._getColgrevanceHTML(playerIndex);
                break;
            case "Lucius":
                playerHTML = this._getLuciusHTML(playerIndex);
                break;
            case "Accolon":
                playerHTML = this._getAccolonHTML(playerIndex);
                break;
        }
        return playerHTML;
    }

    _getMerlinHTML(playerIndex) {
        var seeIndexes = this.playerInformation.getPlayerIndexes({
            includedRoles: ["Puck"],
            excludedRoles: ["Mordred"],
            includedTeams: ["Spy"]
        });
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var merlinHTML = `<h2 class="resistance">Merlin</h2><section>`;
        if (!accolonSabotage) {
            merlinHTML += `<p>You see:</p></section><section>`;
        } else {
            merlinHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            if (this.puckEnabled) {
                merlinHTML += `
                    <p>${this._getPlayerName(seeIndexes[i])} is <span class="spy">evil</span>
                    or <span class="resistance">Puck</span></p>
                `;
            } else {
                merlinHTML += `<p>${this._getPlayerName(seeIndexes[i])} is <span class="spy">evil</span></p>`;
            }
        }
        merlinHTML += `</section>`;

        return merlinHTML;
    }

    _getPercivalHTML(playerIndex) {
        var seeIndexes = this.playerInformation.getPlayerIndexes({
            includedRoles: ["Merlin", "Morgana"],
            includedTeams: []
        });
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var percivalHTML = `
            <h2 class="resistance">Percival</h2><section>
        `;
        if (!accolonSabotage) {
            percivalHTML += `<p>You see:</p></section><section>`;
        } else {
            percivalHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            percivalHTML += `
                <p>${this._getPlayerName(seeIndexes[i])} is <span class="resistance">Merlin</span> or
                <span class="spy">Morgana</span></p>
            `;
        }
        percivalHTML += `</section>`;

        return percivalHTML;
    }

    _getTristanHTML(playerIndex) {
        var seeIndexes = [this.playerInformation.getRoleIndex("Iseult")];
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var tristanHTML = `
            <h2 class="resistance">Tristan</h2><section>
        `;
        if (!accolonSabotage) {
            tristanHTML += `<p>You see:</p></section><section>`;
        } else {
            tristanHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            tristanHTML += `<p>${this._getPlayerName(seeIndexes[i])} is <span class="resistance">Iseult</span></p>`;
        }
        tristanHTML += `</section>`;

        return tristanHTML;
    }

    _getIseultHTML(playerIndex) {
        var seeIndexes = [this.playerInformation.getRoleIndex("Tristan")];
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var iseultHTML = `
            <h2 class="resistance">Iseult</h2><section>
        `;
        if (!accolonSabotage) {
            iseultHTML += `<p>You see:</p></section><section>`;
        } else {
            iseultHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            iseultHTML += `<p>${this._getPlayerName(seeIndexes[i])} is <span class="resistance">Tristan</span></p>`;
        }
        iseultHTML += `</section>`;

        return iseultHTML;
    }

    _getUtherHTML(playerIndex) {
        var seeIndexes = [this.playerInformation.getUtherInformationIndex()];
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var utherHTML = `
            <h2 class="resistance">Uther</h2><section>
        `;
        if (!accolonSabotage) {
            utherHTML += `<p>You see:</p></section><section>`;
        } else {
            utherHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            utherHTML += `<p>${this._getPlayerName(seeIndexes[i])} is <span class="resistance">good</span></p>`;
        }
        utherHTML += `</section>`;

        return utherHTML;
    }

    _getArthurHTML(playerIndex) {
        const seeIndexes = this.playerInformation.getPlayerIndexes({
            excludedRoles: ["Arthur"],
            includedTeams: ["Resistance"]
        });
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var arthurHTML = `
            <h2 class="resistance">Arthur</h2><section>
        `;
        if (!accolonSabotage) {
            arthurHTML += `<p>You see:</p></section><section>`;
        } else {
            arthurHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            if (!accolonSabotage) {
                arthurHTML += `<p><span class="resistance">${this._getPlayerRole(seeIndexes[i])}</span> is in the game</p>`;
            } else {
                if (accolonSabotage.destination === seeIndexes[i]) {
                    arthurHTML += `<p>??? is in the game</p>`;
                } else {
                    arthurHTML += `<p><span class="resistance">${this._getPlayerRole(seeIndexes[i])}</span> is in the game</p>`;
                }
            }
        }
        arthurHTML += `</section>`;

        return arthurHTML;
    }

    _getLancelotHTML() {
        return `
            <h2 class="resistance">Lancelot</h2>
            <section><p>You may play reserve cards while on missions.</p></section>
        `;
    }

    _getPuckHTML() {
        return `
            <h2 class="resistance">Puck</h2>
            <section>
                <p>You only win if the <span class="resistance">Resistance</span> wins on mission 5.</p>
                <p>You may play fail cards while on missions.</p>
                <p>
                    If <span class="resistance">Merlin</span> is in the game, you are seen by
                    <span class="resistance">Merlin</span> as a possible <span class="spy">spy</span>.
                </p>
            </section>
        `;
    }

    _getJesterHTML(playerIndex) {
        const seeIndexes = this.playerInformation.getPlayerIndexes({
            includedRoles: ["Tristan", "Iseult", "Merlin"],
            includedTeams: []
        });
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var jesterHTML = `
            <h2 class="resistance">Jester</h2>
            <section><p>You only win if you get assassinated by the assassin.</p></section><section>
        `;
        if (!accolonSabotage) {
            jesterHTML += `<p>You see:</p></section><section>`;

            for (var i = 0; i < seeIndexes.length; i++) {
                jesterHTML += `<p><span class="resistance">${this._getPlayerRole(seeIndexes[i])}</span> is in the game</p>`;
            }
        } else {
            jesterHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            if (seeIndexes.length === 1) {
                jesterHTML += `<p>${seeIndexes.length} assassinable role is in the game</p>`;
            } else {
                jesterHTML += `<p>${seeIndexes.length} assassinable roles are in the game</p>`;
            }
        }
        jesterHTML += `</section>`;

        return jesterHTML;
    }

    _getGuinevereHTML(playerIndex) {
        var seeIndexes = this.playerInformation.getPlayerIndexes({
            includedRoles: ["Lancelot", "Maelagant"],
            includedTeams: []
        });
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var guinevereHTML = `
            <h2 class="resistance">Guinevere</h2><section>
        `;
        if (!accolonSabotage) {
            guinevereHTML += `<p>You see:</p></section><section>`;
        } else {
            guinevereHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        if (seeIndexes.length > 0) {
            for (var i = 0; i < seeIndexes.length; i++) {
                guinevereHTML += `
                    <p>${this._getPlayerName(seeIndexes[i])} is <span class="resistance">Lancelot</span> or
                    <span class="spy">Maelagant</span></p>
                `;
            }
        } else {
            guinevereHTML += `
                <p><span class="resistance">Lancelot</span> is not in the game</p>
                <p><span class="spy">Maelagant</span> is not in the game</p>
            `;
        }
        guinevereHTML += `</section>`;

        return guinevereHTML;
    }

    _getLeonHTML(playerIndex) {
        const leonInformation = this.playerInformation.getLeonInformation();
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);
        console.log("Leon Information: %j", leonInformation);

        var leonHTML = `
            <h2 class="resistance">Leon</h2><section>
        `;
        if (!accolonSabotage) {
            leonHTML += `<p>You see:</p></section><section>`;

            if (leonInformation.spyCount === 1) {
                leonHTML += `
                <p>${this._getPlayerName(leonInformation.indexes[0])} or ${this._getPlayerName(leonInformation.indexes[1])}
                is <span class="resistance">good</span>; the other is <span class="spy">evil</span></p></section>
            `;
            } else {
                leonHTML += `
                <p>${this._getPlayerName(leonInformation.indexes[0])} and ${this._getPlayerName(leonInformation.indexes[1])}
                are either both <span class="resistance">good</span> or both <span class="spy">evil</span></p></section>
            `;
            }
        } else {
            leonHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see there is one <span class="spy">spy</span> in:</p></section><section>
            `;

            for (var i = 0; i < leonInformation.indexes.length; i++) {
                leonHTML += `
                    <p>${this._getPlayerName(leonInformation.indexes[i])}</p>
                `;
            }
            leonHTML += `</section>`;
        }

        return leonHTML;
    }

    _getGalahadHTML(playerIndex) {
        var seeIndexes = [this.playerInformation.getRoleIndex("Arthur")];
        const accolonSabotage = this.playerInformation.getAccolonSabotage(playerIndex);

        var galahadHTML = `
            <h2 class="resistance">Galahad</h2><section>
        `;
        if (!accolonSabotage) {
            galahadHTML += `<p>You see:</p></section><section>`;
        } else {
            galahadHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            seeIndexes.push(accolonSabotage.destination);
            seeIndexes = ArrayHelper.shuffle(seeIndexes);
        }

        for (var i = 0; i < seeIndexes.length; i++) {
            galahadHTML += `<p>${this._getPlayerName(seeIndexes[i])} is <span class="resistance">Arthur</span></p>`;
        }
        galahadHTML += `</section>`;

        return galahadHTML;
    }

    _getTitaniaHTML() {
        return `
            <h2 class="resistance">Titania</h2>
            <section>
                <p>You sabotaged a member of the <span class="spy">spies</span>.</p>
                <p>That member sees you as a possible <span class="spy">spy</span>.</p>
            </section>
        `;
    }

    _getMordredHTML(playerIndex) {
        var mordredHTML = `
            <h2 class="spy">Mordred</h2>
            <section><p>You are not seen by <span class="resistance">Merlin</span>.</p></section>
        `;

        mordredHTML += this._getSpyHTML(false, playerIndex);
        return mordredHTML;
    }

    _getMorganaHTML(playerIndex) {
        var morganaHTML = `
            <h2 class="spy">Morgana</h2>
            <section><p>You are seen by <span class="resistance">Percival</span> as a possible <span class="resistance">Merlin</span>.</p></section>
        `;

        morganaHTML += this._getSpyHTML(false, playerIndex);
        return morganaHTML;
    }

    _getMaelagantHTML(playerIndex) {
        var maelagantHTML = `
            <h2 class="spy">Maelagant</h2>
            <section><p>You may play reserve cards while on missions.</p></section>
        `;

        maelagantHTML += this._getSpyHTML(false, playerIndex);
        return maelagantHTML;
    }

    _getColgrevanceHTML(playerIndex) {
        var colgrevanceHTML = `<h2 class="spy">Colgrevance</h2>`;
        colgrevanceHTML += this._getSpyHTML(true, playerIndex);
        return colgrevanceHTML;
    }

    _getLuciusHTML(playerIndex) {
        const luciusInformation = this.playerInformation.getLuciusInformation();
        const luciusSourceName = this._getPlayerName(luciusInformation.source);
        const luciusDestinationName = this._getPlayerName(luciusInformation.destination);

        var luciusHTML = `
            <h2 class="spy">Lucius</h2>
            <section>
                <p>You hijacked ${luciusSourceName}.</p>
                <p>${luciusSourceName} sees ${luciusDestinationName}.</p>
            </section>
        `;

        luciusHTML += this._getSpyHTML(false, playerIndex);
        return luciusHTML;
    }

    _getAccolonHTML(playerIndex) {
        var accolonHTML = `
            <h2 class="spy">Accolon</h2>
            <section>
                <p>You sabotaged the vision of a <span class="resistance">resistance</span> player.</p>
            </section>
        `;
        accolonHTML += this._getSpyHTML(false, playerIndex);
        return accolonHTML;
    }

    _getSpyHTML(isColgrevance, playerIndex) {
        var spyHTML = "";

        if (this.playerInformation.isAssassin(playerIndex)) {
            if (!isColgrevance) {
                spyHTML += `<section><p>You are also the assassin.</p></section>`;
            } else {
                spyHTML += `<section><p>You are the assassin.</p></section>`;
            }
        }

        spyHTML += `<section>`;
        const spySeeInformation = this.playerInformation.getSpySeeInformation(playerIndex);
        if (spySeeInformation.sabotaged) {
            spyHTML += `
                <p>Your vision has been sabotaged by <span class="resistance">Titania</span></p>
                <p>You see:</p></section><section>
            `;
        } else {
            spyHTML += `<p>You see:</p></section><section>`;
        }

        for (var i = 0; i < spySeeInformation.indexes.length; i++) {
            const spyIndex = spySeeInformation.indexes[i];
            if (isColgrevance) {
                spyHTML += `
                    <p>
                        ${i + 1}) ${this._getPlayerName(spyIndex)} is <span class="spy">${this._getPlayerRole(spyIndex)}</span>
                    </p>
                `;
            } else {
                spyHTML += `<p>${i + 1}) ${this._getPlayerName(spyIndex)} is <span class="spy">evil</span></p>`;
            }
        }
        spyHTML += `</section>`;

        return spyHTML;
    }

    _getPlayerRole(index) {
        return this.playerInformation.getPlayerRole(index);
    }

    _getPlayerName(index) {
        return this.playerInformation.getPlayerName(index);
    }
}

module.exports = Game;