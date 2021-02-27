class Mission {
    constructor(id, teamSize, requiredFails) {
        this.id = id;
        this.teamSize = teamSize;
        this.requiredFails = requiredFails;
        this.proposalCount = 0;
        this.failedProposalCount = 0;
        this.proposals = [];
        this.proposalsByPlayerId = new Map();
        this.actionsPerformed = [];
        this.result = null;
    }

    getCurrentProposal() {
        return this.proposalCount > 0 ? this.proposals[this.proposalCount - 1] : null;
    }

    getProposal(playerId) {
        return this.proposalsByPlayerId.get(playerId);
    }

    addProposal(playerId, proposal) {
        this.proposalsByPlayerId.set(playerId, proposal);
        this.proposals.push(proposal);
        this.proposalCount += 1;
    }

    getMissionTeam() {
        return this.getCurrentProposal().team;
    }
}

module.exports = Mission;