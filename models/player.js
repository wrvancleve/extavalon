const Roles = require('./roles');
const { shuffle } = require('../utils/random');
const e = require('express');

class Player {
    constructor(gameState, id, name, role) {
        this.gameState = gameState;
        this.id = id;
        this.name = name;
        this.role = role;
        this.isSpy = role.team === 'Spies';
    }

    getPlayerObject() {
        return {
            id: this.id,
            name: this.name,
            role: this.role.name,
            team: this.role.team
        };
    }

    getPlayerHTML() {
        let playerHTML = null;
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
            case Roles.Leon:
                playerHTML = this._getLeonHTML();
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
            case Roles.Galahad:
                playerHTML = this._getGalahadHTML();
                break;
            case Roles.Titania:
                playerHTML = this._getTitaniaHTML();
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
            case Roles.Lucius:
                playerHTML = this._getLuciusHTML();
                break;
            case Roles.Accolon:
                playerHTML = this._getAccolonHTML();
                break;
        }
        return playerHTML;
    }

    _getMerlinHTML() {
        let seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Puck],
            excludedRoles: [Roles.Mordred],
            includedTeams: ["Spies"]
        });

        let merlinHTML = `<h2 class="resistance">Merlin</h2><section>`;
        merlinHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        merlinHTML += `<p>You see:</p></section><section>`;

        for (let i = 0; i < seenPlayers.length; i++) {
            if (this.gameState.settings.puck) {
                merlinHTML += `
                    <p>${seenPlayers[i].name} is <span class="spy">evil</span>
                    or <span class="resistance">Puck</span></p>
                `;
            } else {
                merlinHTML += `<p>${seenPlayers[i].name} is <span class="spy">evil</span></p>`;
            }
        }
        merlinHTML += `</section>`;

        return merlinHTML;
    }

    _getPercivalHTML() {
        let seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Merlin, Roles.Morgana],
            includedTeams: []
        });

        let percivalHTML = `
            <h2 class="resistance">Percival</h2><section>
        `;
        percivalHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        percivalHTML += `<p>You see:</p></section><section>`;

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
        const seenPlayers = [this.gameState.playersByRole.get(Roles.Iseult)];

        let tristanHTML = `
            <h2 class="resistance">Tristan</h2><section>
        `;
        tristanHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        tristanHTML += `<p>You see:</p></section><section>`;

        for (let i = 0; i < seenPlayers.length; i++) {
            tristanHTML += `<p>${seenPlayers[i].name} is <span class="resistance">Iseult</span></p>`;
        }
        tristanHTML += `</section>`;

        return tristanHTML;
    }

    _getIseultHTML() {
        let seenPlayers = [this.gameState.playersByRole.get(Roles.Tristan)];

        let iseultHTML = `
            <h2 class="resistance">Iseult</h2><section>
        `;
        iseultHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        iseultHTML += `<p>You see:</p></section><section>`;

        for (let i = 0; i < seenPlayers.length; i++) {
            iseultHTML += `<p>${seenPlayers[i].name} is <span class="resistance">Tristan</span></p>`;
        }
        iseultHTML += `</section>`;

        return iseultHTML;
    }

    _getUtherHTML() {
        let seenPlayers = [this.gameState.utherSight];

        let utherHTML = `
            <h2 class="resistance">Uther</h2><section>
        `;
        utherHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        utherHTML += `<p>You see:</p></section><section>`;

        for (let i = 0; i < seenPlayers.length; i++) {
            utherHTML += `<p>${seenPlayers[i].name} is <span class="resistance">good</span></p>`;
        }
        utherHTML += `</section>`;

        return utherHTML;
    }

    _getArthurHTML() {
        let seenPlayers = this.gameState.selectPlayers({
            excludedRoles: [Roles.Arthur],
            includedTeams: ["Resistance"]
        });
        const accolonSabotage = this.gameState.getAccolonSabotage(this.id);

        let arthurHTML = `
            <h2 class="resistance">Arthur</h2><section>
        `;
        if (accolonSabotage) {
            arthurHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
            `;
            for (let i = 0; i < seenPlayers.length; i++) {
                if (seenPlayers[i].id === accolonSabotage.destination.id) {
                    seenPlayers[i] = null;
                    break;
                }
            }
        }
        arthurHTML += `<p>You see:</p></section><section>`;

        for (let i = 0; i < seenPlayers.length; i++) {
            const seenPlayer = seenPlayers[i];
            if (seenPlayer) {
                arthurHTML += `<p><span class="resistance">${seenPlayer.role.name}</span> is in the game</p>`;
            } else {
                arthurHTML += `<p>??? is in the game</p>`;
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

    _getJesterHTML() {
        let seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Tristan, Roles.Iseult, Roles.Merlin],
            includedTeams: []
        });
        const accolonSabotage = this.gameState.getAccolonSabotage(this.id);

        let jesterHTML = `
            <h2 class="resistance">Jester</h2>
            <section><p>You only win if you get assassinated by the assassin.</p></section><section>
        `;
        if (!accolonSabotage) {
            jesterHTML += `<p>You see:</p></section><section>`;

            for (let i = 0; i < seenPlayers.length; i++) {
                jesterHTML += `<p><span class="resistance">${seenPlayers[i].role.name}</span> is in the game</p>`;
            }
        } else {
            jesterHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see:</p></section><section>
            `;

            if (seenPlayers.length === 1) {
                jesterHTML += `<p>${seenPlayers.length} assassinable role is in the game</p>`;
            } else {
                jesterHTML += `<p>${seenPlayers.length} assassinable roles are in the game</p>`;
            }
        }
        jesterHTML += `</section>`;

        return jesterHTML;
    }

    _getGuinevereHTML() {
        let seenPlayers = this.gameState.selectPlayers({
            includedRoles: [Roles.Lancelot, Roles.Maelagant],
            includedTeams: []
        });

        let guinevereHTML = `
            <h2 class="resistance">Guinevere</h2><section>
        `;
        guinevereHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        guinevereHTML += `<p>You see:</p></section><section>`;

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

    _getLeonHTML() {
        const leonSight = this.gameState.leonSight;
        const accolonSabotage = this.gameState.getAccolonSabotage(this.id);

        let leonHTML = `
            <h2 class="resistance">Leon</h2><section>
        `;
        if (!accolonSabotage) {
            leonHTML += `<p>You see:</p></section><section>`;

            if (leonSight.spyCount === 1) {
                leonHTML += `
                    <p>${leonSight.players[0].name} or ${leonSight.players[1].name}
                    is <span class="resistance">good</span>; the other is <span class="spy">evil</span></p></section>
                `;
            } else {
                leonHTML += `
                    <p>${leonSight.players[0].name} and ${leonSight.players[1].name}
                    are either both <span class="resistance">good</span> or both <span class="spy">evil</span></p></section>
                `;
            }
        } else {
            leonHTML += `
                <p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>
                <p>You see there is one <span class="spy">spy</span> in:</p></section><section>
            `;

            for (let i = 0; i < leonSight.players.length; i++) {
                leonHTML += `
                    <p>${leonSight.players[i].name}</p>
                `;
            }
            leonHTML += `</section>`;
        }

        return leonHTML;
    }

    _getGalahadHTML() {
        let seenPlayers = [this.gameState.playersByRole.get(Roles.Arthur)];

        let galahadHTML = `
            <h2 class="resistance">Galahad</h2><section>
        `;
        galahadHTML += this._processAccolonSabotage(seenPlayers, this.gameState.getAccolonSabotage(this.id));
        galahadHTML += `<p>You see:</p></section><section>`;

        for (let i = 0; i < seenPlayers.length; i++) {
            galahadHTML += `<p>${seenPlayers[i].name} is <span class="resistance">Arthur</span></p>`;
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

    _processAccolonSabotage(seenPlayers, accolonSabotage) {
        if (accolonSabotage) {
            seenPlayers.push(accolonSabotage.destination);
            seenPlayers = shuffle(seenPlayers);
            return `<p>Your vision has been sabotaged by <span class="spy">Accolon</span></p>`;
        } else {
            return "";
        }
    }

    _getMordredHTML() {
        let mordredHTML = `
            <h2 class="spy">Mordred</h2>
            <section><p>You are not seen by <span class="resistance">Merlin</span>.</p></section>
        `;

        mordredHTML += this._getSpyHTML(false);
        return mordredHTML;
    }

    _getMorganaHTML() {
        let morganaHTML = `
            <h2 class="spy">Morgana</h2>
            <section><p>You are seen by <span class="resistance">Percival</span> as a possible <span class="resistance">Merlin</span>.</p></section>
        `;

        morganaHTML += this._getSpyHTML(false);
        return morganaHTML;
    }

    _getMaelagantHTML() {
        let maelagantHTML = `
            <h2 class="spy">Maelagant</h2>
            <section><p>You may play reserve cards while on missions.</p></section>
        `;

        maelagantHTML += this._getSpyHTML(false);
        return maelagantHTML;
    }

    _getColgrevanceHTML() {
        let colgrevanceHTML = `<h2 class="spy">Colgrevance</h2>`;
        colgrevanceHTML += this._getSpyHTML(true);
        return colgrevanceHTML;
    }

    _getLuciusHTML() {
        const luciusSight = this.gameState.luciusSight;

        let luciusHTML = `
            <h2 class="spy">Lucius</h2>
            <section>
                <p>You hijacked ${luciusSight.source.name}.</p>
                <p>${luciusSight.source.name} sees ${luciusSight.destination.name}.</p>
            </section>
        `;

        luciusHTML += this._getSpyHTML(false);
        return luciusHTML;
    }

    _getAccolonHTML() {
        let accolonHTML = `
            <h2 class="spy">Accolon</h2>
            <section>
                <p>You sabotaged the vision of a <span class="resistance">resistance</span> player.</p>
            </section>
        `;
        accolonHTML += this._getSpyHTML(false);
        return accolonHTML;
    }

    _getSpyHTML(isColgrevance) {
        let spyHTML = "";

        if (this.gameState.assassinId === this.id) {
            if (!isColgrevance) {
                spyHTML += `<section><p>You are also the assassin.</p></section>`;
            } else {
                spyHTML += `<section><p>You are the assassin.</p></section>`;
            }
        }
        
        let spyPlayers = this.gameState.spys.slice(0);

        const doesTitaniaSabotage = this.gameState.titaniaSabotage.player
            ? this.gameState.titaniaSabotage.player.id === this.id
            : false;
        if (doesTitaniaSabotage) {
            spyPlayers.splice(this.gameState.titaniaSabotage.insertIndex, 0, this.gameState.playersByRole.get(Roles.Titania));
            spyHTML += `
                <p>Your vision has been sabotaged by <span class="resistance">Titania</span></p>
                <p>You see:</p></section><section>
            `;
        } else {
            spyHTML += `<section><p>You see:</p></section><section>`;
        }

        for (let i = 0; i < spyPlayers.length; i++) {
            const spyPlayer = spyPlayers[i];
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