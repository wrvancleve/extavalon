const FiniteSet = require('./finiteSet');

function RandomSample() {
    this.possibilities = new Set();
    this.conjunctions = [];
    this.disjunctions = [];
    this.size = 0;
}

RandomSample.prototype.addPossibility = function(possibility) {
    if (Array.isArray(possibility)) {
        for (let element of possibility) {
            this.possibilities.add(element);
            this.size += 1;
        }
    } else {
        this.possibilities.add(possibility);
        this.size += 1;
    }
}

RandomSample.prototype.addConjunction = function(elements) {
    this.conjunctions.push(new FiniteSet(elements));
}

RandomSample.prototype.addDisjunction = function(elements) {
    this.disjunctions.push(new FiniteSet(elements));
}

RandomSample.prototype.select = function(count) {
    const selections = new Set();
    
    while (selections.size < count) {
        const randomIndex = Math.floor(Math.random() * this.possibilities.size);
        const randomSelection = Array.from(this.possibilities)[randomIndex];
    
        const newSelections = [randomSelection];
        const usedConjunctions = [];
        for (let i = this.conjunctions.length - 1; i >= 0; i--) {
            const conjunction = this.conjunctions[i];
            if (conjunction.contains(randomSelection)) {
                Array.prototype.push.apply(newSelections, conjunction.except(randomSelection));
                usedConjunctions.push(i);
            }
        }

        if (selections.size + newSelections.length <= count) {
            for (let i = 0; i < usedConjunctions.length; i++) {
                this.conjunctions.splice(usedConjunctions[i], 1);
            }

            for (let newSelection of newSelections) {
                const usedDisjunctions = [];
                for (let i = this.disjunctions.length - 1; i >= 0; i--) {
                    const disjunction = this.disjunctions[i];
                    if (disjunction.contains(newSelection)) {
                        const restrictedElements = disjunction.except(newSelection);
                        for (let restrictedElement of restrictedElements) {
                            if (this.possibilities.has(restrictedElement)) {
                                this.possibilities.delete(restrictedElement);
                                this.size -= 1;
                            }
                        }
                        usedDisjunctions.push(i);
                    }
                }

                for (let i = 0; i < usedDisjunctions.length; i++) {
                    this.disjunctions.splice(usedDisjunctions[i], 1);
                }

                this.possibilities.delete(newSelection);
                this.size -= 1;
                selections.add(newSelection);
            }
        }
    }

    return selections;
}

module.exports = RandomSample;
