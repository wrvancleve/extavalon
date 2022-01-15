function FiniteSet(elements) {
    this.elements = elements;
}

FiniteSet.prototype.contains = function(element) {
    return this.elements.has(element);
}

FiniteSet.prototype.except = function(exceptElement) {
    const others = [];
    for (let element of this.elements) {
        if (element != exceptElement) {
            others.push(element);
        }
    }
    return others;
}

module.exports = FiniteSet;
