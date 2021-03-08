class Mission {
    constructor(id, teamSize, requiredFails) {
        this.id = id;
        this.teamSize = teamSize;
        this.requiredFails = requiredFails;
        this.proposalCount = 0;
        this.failedProposalCount = 0;
        this.proposals = [];
        this.proposalsByPlayerId = new Map();
        this.failActionCount = 0;
        this.reverseActionCount = 0;
        this.actionCount = 0;
        this.actionsPerformedByPlayerId = new Map();
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

    addAction(playerId, action) {
        this.actionsPerformedByPlayerId.set(playerId, action);
        this.actionCount += 1;
        switch (action) {
            case "Fail":
                this.failActionCount += 1;
                break;
            case "Reverse":
                this.reverseActionCount += 1;
                break;
        }
    }

    finalize() {
        let missionFailed = this.failActionCount >= this.requiredFails;
        if (this.reverseActionCount % 2 != 0)
        {
            missionFailed = !missionFailed;
        }
        this.result = missionFailed ? "Fail" : "Success";
    }

    getMissionTeam() {
        return this.getCurrentProposal().team;
    }
}

module.exports = Mission;