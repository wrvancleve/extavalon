const crypto = require("crypto");

module.exports.shuffle = (array) => {
    let shuffled = array.slice(0), i = array.length, temp, index;
    while (i--) {
        //index = Math.floor((i + 1) * Math.random());
        index = crypto.randomInt(0, i + 1);
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0);
}

module.exports.sample = (array, size) => {
    let shuffled = array.slice(0), i = array.length, temp, index;
    while (i--) {
        //index = Math.floor((i + 1) * Math.random());
        index = crypto.randomInt(0, i + 1);
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

module.exports.choice = (array) => {
    //return array[Math.floor(Math.random() * array.length)];
    return array[crypto.randomInt(0, array.length)];
}

module.exports.nextBoolean = () => {
    //return Math.random() < 0.5;
    return crypto.randomInt(0, 2) === 1;
}