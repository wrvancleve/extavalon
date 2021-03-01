class Proposal { 
    constructor(leaderId, team) {
        this.leader = leaderId;
        this.team = team;
        this.voteCount = 0;
        this.rejectCount = 0;
        this.votesByPlayerId = new Map();
    }

    addVote(playerId, vote) {
        this.votesByPlayerId.set(playerId, vote);
        this.voteCount += 1;
        if (!vote) {
            this.rejectCount += 1;
        }
    }

    finalize() {
        return this.rejectCount < Math.ceil(this.voteCount / 2);
    }

    getVote(playerId) {
        return this.votesByPlayerId.get(playerId);
    }

    getVotes() {
        return this.votesByPlayerId;
    }
}

module.exports = Proposal;