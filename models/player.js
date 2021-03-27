const Roles = require('./roles');

class Player {
    constructor(gameState, id, name, role) {
        this.gameState = gameState;
        this.id = id;
        this.name = name;
        this.role = role;
        this.isSpy = role.team === 'Spies';
        this.intel = [];
        this.intelSabotaged = false;
    }

    addIntel(intel) {
        this.intel.push(intel);
    }

    performSabotage(newIntel) {
        this.intel.splice(0, 1, newIntel);
        this.intelSabotaged = true;
    }

    getPlayerObject() {
        return {
            id: this.id,
            name: this.name,
            role: this.role.name,
            team: this.role.team
        };
    }

    getStatus(otherPlayer) {
        if (this.isSpy) {
            const consideredSpy = this.intel[0].filter(spy => spy.id === otherPlayer.id).length > 0;
            return consideredSpy ? "spy" : "resistance";
        } else {
            let status = "unknown";
            let isInIntel = false;
            switch (this.role) {
                case Roles.Merlin:
                case Roles.Percival:
                case Roles.Guinevere:
                    isInIntel = this.intel[0].filter(player => player.id === otherPlayer.id).length > 0;
                    return isInIntel ? "suspicious" : "unknown";
                case Roles.Tristan:
                case Roles.Iseult:
                case Roles.Uther:
                case Roles.Galahad:
                    isInIntel = this.intel[0].filter(player => player.id === otherPlayer.id).length > 0;
                    return (isInIntel && !this.intelSabotaged) ? "resistance" : "unknown";
            }

            return status;
        }
    }

    getPlayerHTML() {
        switch (this.role) {
            case Roles.Merlin:
                return this._getMerlinHTML();
            case Roles.Percival:
                return this._getPercivalHTML();
            case Roles.Uther:
                return this._getUtherHTML();
            case Roles.Lancelot:
                return this._getLancelotHTML();
            case Roles.Tristan:
                return this._getTristanHTML();
            case Roles.Iseult:
                return this._getIseultHTML();
            case Roles.Puck:
                return this._getPuckHTML();
            case Roles.Arthur:
                return this._getArthurHTML();
            case Roles.Guinevere:
                return this._getGuinevereHTML();
            case Roles.Bedivere:
                return this._getBedivereHTML();
            case Roles.Jester:
                return this._getJesterHTML();
            case Roles.Galahad:
                return this._getGalahadHTML();
            case Roles.Titania:
                return this._getTitaniaHTML();
            case Roles.Mordred:
                return this._getMordredHTML();
            case Roles.Morgana:
                return this._getMorganaHTML();
            case Roles.Maelagant:
                return this._getMaelagantHTML();
            case Roles.Colgrevance:
                return this._getColgrevanceHTML();
            case Roles.Lucius:
                return this._getLuciusHTML();
            case Roles.Accolon:
                return this._getAccolonHTML();
            default:
                return null;
        }
    }

    _getMerlinHTML() {
        let merlinHTML = `<h2 class="resistance">Merlin</h2><section>`;
        if (this.intelSabotaged) {
            merlinHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see is not a <span class="spy">spy</span> or <span class="resistance">Puck</span></p>
            `;
        }
        merlinHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            merlinHTML += `
                <p>${seenPlayers[i].name} is <span class="spy">evil</span>
                or <span class="resistance">Puck</span></p>
            `;
        }
        merlinHTML += `</section>`;

        return merlinHTML;
    }

    _getPercivalHTML() {
        let percivalHTML = `
            <h2 class="resistance">Percival</h2><section>
        `;
        if (this.intelSabotaged) {
            percivalHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see is not <span class="resistance">Merlin</span> or <span class="spy">Morgana</span></p>
            `;
        }
        percivalHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            percivalHTML += `
                <p>${seenPlayers[i].name} is <span class="resistance">Merlin</span> or
                <span class="spy">Morgana</span></p>
            `;
        }
        percivalHTML += `</section>`;

        return percivalHTML;
    }

    _getTristanHTML() {
        let tristanHTML = `
            <h2 class="resistance">Tristan</h2><section>
        `;
        if (this.intelSabotaged) {
            tristanHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see is not <span class="resistance">Iseult</span></p>
            `;
        }
        tristanHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            tristanHTML += `<p>${seenPlayers[i].name} is <span class="resistance">Iseult</span></p>`;
        }
        tristanHTML += `</section>`;

        return tristanHTML;
    }

    _getIseultHTML() {
        let iseultHTML = `
            <h2 class="resistance">Iseult</h2><section>
        `;
        if (this.intelSabotaged) {
            iseultHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see is not <span class="resistance">Tristan</span></p>
            `;
        }
        iseultHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            iseultHTML += `<p>${seenPlayers[i].name} is <span class="resistance">Tristan</span></p>`;
        }
        iseultHTML += `</section>`;

        return iseultHTML;
    }

    _getUtherHTML() {
        let utherHTML = `
            <h2 class="resistance">Uther</h2><section>
        `;
        if (this.intelSabotaged) {
            utherHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see may or may not be <span class="resistance">good</span></p>
            `;
        }
        utherHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            utherHTML += `<p>${seenPlayers[i].name} is <span class="resistance">good</span></p>`;
        }
        utherHTML += `</section>`;

        return utherHTML;
    }

    _getArthurHTML() {
        let arthurHTML = `
            <h2 class="resistance">Arthur</h2><section>
        `;
        if (this.intelSabotaged) {
            arthurHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
            `;
        }
        arthurHTML += `<p>You see:</p></section><section>`;

        const seenRoles = this.intel[0];
        for (let i = 0; i < seenRoles.length; i++) {
            const seenRole = seenRoles[i];
            if (seenRole) {
                arthurHTML += `<p><span class="resistance">${seenRole}</span> is in the game</p>`;
            } else {
                arthurHTML += `<p>??? is in the game</p>`;
            }
        }
        arthurHTML += `</section>`;

        if (this.intel.length > 1) {
            arthurHTML += this._getResistanceEctorHTML();
        }

        return arthurHTML;
    }

    _getLancelotHTML() {
        let lancelotHTML = `
            <h2 class="resistance">Lancelot</h2>
            <section><p>You may play reverse cards while on missions.</p></section>
        `;

        if (this.intel.length > 1) {
            lancelotHTML += this._getResistanceEctorHTML();
        }

        return lancelotHTML;
    }

    _getPuckHTML() {
        let puckHTML = `
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

        if (this.intel.length > 1) {
            puckHTML += this._getResistanceEctorHTML();
        }

        return puckHTML;
    }

    _getJesterHTML() {
        const seenRoles = this.intel[0];

        let jesterHTML = `
            <h2 class="resistance">Jester</h2>
            <section><p>You only win if you get assassinated by the assassin.</p></section><section>
        `;
        if (!this.intelSabotaged) {
            jesterHTML += `<p>You see:</p></section><section>`;

            for (let i = 0; i < seenRoles.length; i++) {
                jesterHTML += `<p><span class="resistance">${seenRoles[i]}</span> is in the game</p>`;
            }
        } else {
            jesterHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            if (seenRoles === 1) {
                jesterHTML += `<p>${seenRoles} assassinable role is in the game</p>`;
            } else {
                jesterHTML += `<p>${seenRoles} assassinable roles are in the game</p>`;
            }
        }
        jesterHTML += `</section>`;

        if (this.intel.length > 1) {
            jesterHTML += this._getResistanceEctorHTML();
        }

        return jesterHTML;
    }

    _getGuinevereHTML() {
        let guinevereHTML = `
            <h2 class="resistance">Guinevere</h2><section>
        `;
        if (this.intelSabotaged) {
            guinevereHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see is not <span class="resistance">Lancelot</span> or <span class="spy">Maelagant</span></p>
            `;
        }
        guinevereHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            const seenPlayer = seenPlayers[i];
            guinevereHTML += `
                <p>${seenPlayer.name} is <span class="resistance">Lancelot</span> or
                <span class="spy">Maelagant</span></p>
            `;
        }
        guinevereHTML += `</section>`;

        if (this.intel.length > 1) {
            guinevereHTML += this._getResistanceEctorHTML();
        }

        return guinevereHTML;
    }

    _getBedivereHTML() {
        let bedivereHTML = `
            <h2 class="resistance">Bedivere</h2><section>
        `;
        if (this.intelSabotaged) {
            bedivereHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
            `;
        }
        bedivereHTML += `<p>You see:</p></section><section>`;

        const seenRoles = this.intel[0];
        for (let i = 0; i < seenRoles.length; i++) {
            const seenRole = seenRoles[i];
            if (seenRole) {
                bedivereHTML += `<p><span class="spy">${seenRole}</span> is in the game</p>`;
            } else {
                bedivereHTML += `<p>??? is in the game</p>`;
            }
        }
        bedivereHTML += `</section>`;

        if (this.intel.length > 1) {
            bedivereHTML += this._getResistanceEctorHTML();
        }

        return bedivereHTML;
    }

    _getGalahadHTML() {
        let galahadHTML = `
            <h2 class="resistance">Galahad</h2><section>
        `;
        if (this.intelSabotaged) {
            galahadHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>One of the players you see is not <span class="resistance">Arthur</span></p>
            `;
        }
        galahadHTML += `<p>You see:</p></section><section>`;

        const seenPlayers = this.intel[0];
        for (let i = 0; i < seenPlayers.length; i++) {
            galahadHTML += `<p>${seenPlayers[i].name} is <span class="resistance">Arthur</span></p>`;
        }
        galahadHTML += `</section>`;

        return galahadHTML;
    }

    _getTitaniaHTML() {
        let titaniaHTML = `
            <h2 class="resistance">Titania</h2>
            <section>
                <p>You sabotaged a member of the <span class="spy">spies</span>.</p>
                <p>That member sees you as a possible <span class="spy">spy</span>.</p>
            </section>
        `;

        if (this.intel.length > 1) {
            titaniaHTML += this._getResistanceEctorHTML();
        }

        return titaniaHTML;
    }

    _getMordredHTML() {
        let mordredHTML = `
            <h2 class="spy">Mordred</h2>
            <section><p>You are not seen by <span class="resistance">Merlin</span>.</p></section>
        `;

        mordredHTML += this._getSpyHTML();
        return mordredHTML;
    }

    _getMorganaHTML() {
        let morganaHTML = `
            <h2 class="spy">Morgana</h2>
            <section><p>You are seen by <span class="resistance">Percival</span> as a possible <span class="resistance">Merlin</span>.</p></section>
        `;

        morganaHTML += this._getSpyHTML();
        return morganaHTML;
    }

    _getMaelagantHTML() {
        let maelagantHTML = `
            <h2 class="spy">Maelagant</h2>
            <section><p>You may play reverse cards while on missions.</p></section>
        `;

        maelagantHTML += this._getSpyHTML();
        return maelagantHTML;
    }

    _getColgrevanceHTML() {
        let colgrevanceHTML = `<h2 class="spy">Colgrevance</h2>`;
        colgrevanceHTML += this._getSpyHTML();
        return colgrevanceHTML;
    }

    _getAccolonHTML() {
        let accolonHTML = `
            <h2 class="spy">Accolon</h2>
            <section>
                <p>You sabotaged the vision of a <span class="resistance">resistance</span> player.</p>
            </section>
        `;
        accolonHTML += this._getSpyHTML();
        return accolonHTML;
    }

    _getLuciusHTML() {
        let luciusHTML = `
            <h2 class="spy">Lucius</h2>
            <section>
                <p>You hijacked some <span class="resistance">resistance</span> roles:</p>
            </section><section>
        `;

        const seenRoles = this.intel[1];
        for (let i = 0; i < seenRoles.length; i++) {
            const seenRole = seenRoles[i];
            luciusHTML += `<p><span class="resistance">${seenRole}</span> is in the game</p>`;
        }
        luciusHTML += `</section>`;

        luciusHTML += this._getSpyHTML();
        return luciusHTML;
    }

    _getSpyHTML() {
        let spyHTML = "";
        if (this.gameState.assassinId === this.id) {
            spyHTML += `<section><p>You are also the assassin.</p></section>`;
        }

        if (this.intelSabotaged) {
            spyHTML += `
                <section><p>Your vision has been sabotaged by <span class="resistance">Titania</span></p>
                <p>One of the players you see is not a <span class="spy">spy</span></p>
                <p>You see:</p></section><section>
            `;
        } else {
            spyHTML += `<section><p>You see:</p></section><section>`;
        }

        const seenSpies = this.intel[0];
        for (let i = 0; i < seenSpies.length; i++) {
            const seenSpy = seenSpies[i];
            if ('role' in seenSpy) {
                spyHTML += `
                    <p>
                        ${i + 1}) ${seenSpy.name} is <span class="spy">${seenSpy.role}</span>
                    </p>
                `;
            } else {
                spyHTML += `<p>${i + 1}) ${seenSpy.name} is <span class="spy">evil</span></p>`;
            }
        }
        spyHTML += `</section>`;

        return spyHTML;
    }
}

module.exports = Player