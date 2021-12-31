function Mission(id, teamSize, requiredFails) {
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

Mission.prototype.getCurrentProposal = function() {
    return this.proposalCount > 0 ? this.proposals[this.proposalCount - 1] : null;
}

Mission.prototype.getProposal = function(playerId) {
    return this.proposalsByPlayerId.get(playerId);
}

Mission.prototype.addProposal = function(playerId, proposal) {
    this.proposalsByPlayerId.set(playerId, proposal);
    this.proposals.push(proposal);
    this.proposalCount += 1;
}

Mission.prototype.hasConducted = function(playerId) {
    return this.actionsPerformedByPlayerId.has(playerId);
}

Mission.prototype.getBindOnPlayerId = function(playerId) {
    return this.getCurrentProposal().getBindOnPlayerId(playerId);
}

Mission.prototype.addAction = function(playerId, action) {
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

Mission.prototype.finalize = function() {
    let missionFailed = this.failActionCount >= this.requiredFails;
    if (this.reverseActionCount % 2 != 0)
    {
        missionFailed = !missionFailed;
    }
    this.result = missionFailed ? "Fail" : "Success";
}

Mission.prototype.getMissionTeam = function() {
    return this.getCurrentProposal().team;
}

Mission.prototype.isOnMissionTeam = function (id) {
    return this.getCurrentProposal().team.includes(id);
}

module.exports = Mission;