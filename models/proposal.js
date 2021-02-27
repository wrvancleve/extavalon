class Proposal { 
    constructor(leaderId, team) {
        this.leaderId = leaderId;
        this.team = team;
        this.rejectCount = 0;
        this.votesByPlayerId = new Map();
    }

    addVote(playerId, vote) {
        this.votesByPlayerId.set(playerId, vote);
        if (!vote) {
            this.rejectCount += 1;
        }
    }

    getVote(playerId) {
        return this.votesByPlayerId.get(playerId);
    }
}

module.exports = Proposal;