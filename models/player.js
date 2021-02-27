const Roles = require('./roles');

class Player {
    constructor(gameState, id, name, role) {
        this.gameState = gameState;
        this.id = id;
        this.name = name;
        this.role = role;
        this.isSpy = role.team === 'Spies';
    }

    getPlayerHTML() {
        var playerHTML = null;
        switch (this.role) {
            case Roles.Merlin:
                playerHTML = this._getMerlinHTML();
                break;
            case Roles.Percival:
                playerHTML = this._getPercivalHTML();
                break;
            case Roles.Uther:
                playerHTML = this._getUtherHTML();
                break;
            case Roles.Lancelot:
                playerHTML = this._getLancelotHTML();
                break;
            case Roles.Tristan:
                playerHTML = this._getTristanHTML();
                break;
            case Roles.Iseult:
                playerHTML = this._getIseultHTML();
                break;
            case Roles.Puck:
                playerHTML = this._getPuckHTML();
                break;
            case Roles.Arthur:
                playerHTML = this._getArthurHTML();
                break;
            case Roles.Guinevere:
                playerHTML = this._getGuinevereHTML();
                break;
            case Roles.Jester:
                playerHTML = this._getJesterHTML();
                break;
            case Roles.Mordred:
                playerHTML = this._getMordredHTML();
                break;
            case Roles.Morgana:
                playerHTML = this._getMorganaHTML();
                break;
            case Roles.Maelagant:
                playerHTML = this._getMaelagantHTML();
                break;
            case Roles.Colgrevance:
                playerHTML = this._getColgrevanceHTML();
                break;
        }
        return playerHTML;
    }

    _getMerlinHTML() {
        var seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Puck],
            excludedRoles: [Roles.Mordred],
            includedTeams: ["Spies"]
        });

        var merlinHTML = `
            <h2 class="resistance">Merlin</h2>
            <section><p>You see:</p></section><section>
        `;

        for (let i = 0; i < seenPlayers.length; i++) {
            const seenPlayer = seenPlayers[i];
            if (this.gameState.settings.puck) {
                merlinHTML += `
                    <p>${seenPlayer.name} is <span class="spy">evil</span> 
                    or <span class="resistance">Puck</span></p>
                `;
            } else {
                merlinHTML += `<p>${seenPlayer.name} is <span class="spy">evil</span></p>`;
            }
        }
        merlinHTML += `</section>`;

        return merlinHTML;
    }

    _getPercivalHTML() {
        var seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Merlin, Roles.Morgana],
            includedTeams: []
        });

        var percivalHTML = `
            <h2 class="resistance">Percival</h2>
            <section><p>You see:</p></section><section>
        `;

        for (let i = 0; i < seenPlayers.length; i++) {
            const seenPlayer = seenPlayers[i];
            percivalHTML += `
                <p>${seenPlayer.name} is <span class="resistance">Merlin</span> or
                <span class="spy">Morgana</span></p>
            `;
        }
        percivalHTML += `</section>`;

        return percivalHTML;
    }

    _getTristanHTML() {
        const iseultName = this.gameState.playersByRole.get(Roles.Iseult).name;
        return `
            <h2 class="resistance">Tristan</h2>
            <section><p>You see:</p></section>
            <section><p>${iseultName} is <span class="resistance">Iseult</span></p></section>
        `;
    }

    _getIseultHTML() {
        const tristanName = this.gameState.playersByRole.get(Roles.Tristan).name;
        return `
            <h2 class="resistance">Iseult</h2>
            <section><p>You see:</p></section>
            <section><p>${tristanName} is <span class="resistance">Tristan</span></p></section>
        `;
    }

    _getUtherHTML() {
        const goodName = this.gameState.utherSight.name;
        return `
            <h2 class="resistance">Uther</h2>
            <section><p>You see:</p></section>
            <section><p>${goodName} is <span class="resistance">good</span></p></section>
        `;
    }

    _getArthurHTML() {
        const seenPlayers = this.gameState.selectPlayers({
            excludedRoles: [Roles.Arthur],
            includedTeams: ["Resistance"]
        });

        var arthurHTML = `
            <h2 class="resistance">Arthur</h2>
            <section><p>You see:</p></section><section>
        `;
        
        for (let i = 0; i < seenPlayers.length; i++) {
            const seenPlayer = seenPlayers[i];
            arthurHTML += `<p><span class="resistance">${seenPlayer.role.name}</span> is in the game</p>`;
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

    _getJesterHTML() {
        const assassinableRolesPresent = [];
        if (this.gameState.playersByRole.has(Roles.Tristan)) {
            assassinableRolesPresent.push(Roles.Tristan.name);
        }
        if (this.gameState.playersByRole.has(Roles.Iseult)) {
            assassinableRolesPresent.push(Roles.Iseult.name);
        }
        if (this.gameState.playersByRole.has(Roles.Merlin)) {
            assassinableRolesPresent.push(Roles.Merlin.name);
        }

        let jesterHTML = `
            <h2 class="resistance">Jester</h2>
            <section><p>You only win if you get assassinated by the assassin.</p></section>
            <section><p>You see:</p></section><section>
        `;

        for (let i = 0; i < assassinableRolesPresent.length; i++) {
            const role = assassinableRolesPresent[i];
            jesterHTML += `<p><span class="resistance">${role}</span> is in the game</p>`;
        }
        jesterHTML += `</section>`;

        return jesterHTML;
    }

    _getGuinevereHTML() {
        var seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Lancelot, Roles.Maelagant],
            includedTeams: []
        });

        var guinevereHTML = `
            <h2 class="resistance">Guinevere</h2>
            <section><p>You see:</p></section><section>
        `;

        if (seenPlayers.length > 0) {
            for (let i = 0; i < seenPlayers.length; i++) {
                const seenPlayer = seenPlayers[i];
                guinevereHTML += `
                    <p>${seenPlayer.name} is <span class="resistance">Lancelot</span> or
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

    _getMordredHTML() {
        var mordredHTML = `
            <h2 class="spy">Mordred</h2>
            <section><p>You are not seen by <span class="resistance">Merlin</span>.</p></section>
        `;

        mordredHTML += this._getSpyHTML(false);
        return mordredHTML;
    }

    _getMorganaHTML() {
        var morganaHTML = `
            <h2 class="spy">Morgana</h2>
            <section><p>You are seen by <span class="resistance">Percival</span> as a possible <span class="resistance">Merlin</span>.</p></section>
        `;

        morganaHTML += this._getSpyHTML(false);
        return morganaHTML;
    }

    _getMaelagantHTML() {
        var maelagantHTML = `
            <h2 class="spy">Maelagant</h2>
            <section><p>You may play reserve cards while on missions.</p></section>
        `;

        maelagantHTML += this._getSpyHTML(false);
        return maelagantHTML;
    }

    _getColgrevanceHTML() {
        var colgrevanceHTML = `<h2 class="spy">Colgrevance</h2>`;
        colgrevanceHTML += this._getSpyHTML(true);
        return colgrevanceHTML;
    }

    _getSpyHTML(isColgrevance) {
        var spyHTML = "";

        if (this.gameState.assassinId === this.id) {
            if (!isColgrevance) {
                spyHTML += `<section><p>You are also the assassin.</p></section>`;
            } else {
                spyHTML += `<section><p>You are the assassin.</p></section>`;
            }
        }

        spyHTML += `<section><p>You see:</p></section><section>`;
        for (var i = 0; i < this.gameState.spys.length; i++) {
            const spyPlayer = this.gameState.spys[i];
            if (isColgrevance) {
                spyHTML += `
                    <p>
                        ${i + 1}) ${spyPlayer.name} is <span class="spy">${spyPlayer.role.name}</span>
                    </p>
                `;
            } else {
                spyHTML += `<p>${i + 1}) ${spyPlayer.name} is <span class="spy">evil</span></p>`;
            }
        }
        spyHTML += `</section>`;

        return spyHTML;
    }
}

module.exports = Player