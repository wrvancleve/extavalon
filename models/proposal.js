class Proposal { 
    constructor(leaderId, team) {
        this.leader = leaderId;
        this.team = team;
        this.voteCount = 0;
        this.rejectCount = 0;
        this.votesByPlayerId = new Map();
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

    finalize() {
        this.approved = this.rejectCount < Math.ceil(this.voteCount / 2);
        return this.approved;
    }
}

module.exports = Proposal;