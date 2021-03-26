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

    setVote(playerId, vote) {
        const newVote = !this.votesByPlayerId.has(playerId);
        this.votesByPlayerId.set(playerId, vote);
        if (newVote) {
            this.voteCount += 1;
        }
    }

    hasVoted(playerId) {
        return this.votesByPlayerId.has(playerId);
    }

    finalize() {
        for (let vote of this.votesByPlayerId.values()){
            if (!vote) {
                this.rejectCount += 1;
            }
        }
        this.result = this.rejectCount < Math.ceil(this.voteCount / 2);
    }
}

module.exports = Proposal;