class Proposal { 
    constructor(leaderId, team) {
        this.leader = leaderId;
        this.team = team;
        this.voteCount = 0;
        this.rejectCount = 0;
        this.votesByPlayerId = new Map();
        this.result = null;
    }

    getVotes() {
        return this.votesByPlayerId;
    }

    addVote(playerId, vote) {
        this.votesByPlayerId.set(playerId, vote);
        this.voteCount += 1;
        if (!vote) {
            this.rejectCount += 1;
        }
    }

    hasVoted(playerId) {
        return this.votesByPlayerId.has(playerId);
    }

    finalize() {
        this.result = this.rejectCount < Math.ceil(this.voteCount / 2);
    }
}

module.exports = Proposal;