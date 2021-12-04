const RandomAlternative = require("./randomAlternative");

function RandomSample(possibilities, maxSelections) {
    this.possibilities = possibilities;
    this.selectionsMade = 0;
    this.maxSelections = maxSelections;
}

RandomSample.prototype.getNextValue = function() {
    if (!this.hasNextValue()) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * this.possibilities.length);
    let randomPossibility = this.possibilities[randomIndex];

    while (randomPossibility instanceof RandomAlternative) {
        randomPossibility = randomPossibility.getValue();
        this.possibilities[randomIndex] = randomPossibility;
    }

    let selectedPossibility = null;
    if (randomPossibility instanceof RandomSample) {
        selectedPossibility = randomPossibility.getNextValue();
        if (!randomPossibility.hasNextValue()) {
            this.possibilities.splice(randomIndex, 1);
        }
    } else if (Array.isArray(randomPossibility)) {
        selectedPossibility = randomPossibility.splice(0, 1)[0];
        if (randomPossibility.length === 0) {
            this.possibilities.splice(randomIndex, 1);
        }
    } else {
        selectedPossibility = randomPossibility;
        this.possibilities.splice(randomIndex, 1);
    }

    this.selectionsMade += 1;
    return selectedPossibility;
}

RandomSample.prototype.hasNextValue = function() {
    return this.possibilities.length !== 0 && this.selectionsMade < this.maxSelections;
}

module.exports = RandomSample;