function RandomAlternative(alternatives) {
    this.alternatives = alternatives;
}

RandomAlternative.prototype.getValue = function() {
    if (!this.hasValue()) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * this.alternatives.length);
    const selectedAlternative = this.alternatives[randomIndex];
    this.alternatives = null;
    return selectedAlternative;
}

RandomAlternative.prototype.hasValue = function() {
    return this.alternatives !== null && this.alternatives.length !== 0;
}

module.exports = RandomAlternative;