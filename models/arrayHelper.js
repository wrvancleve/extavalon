class ArrayHelper {
    static getArrayTo(max, min=0) {
        const array = [];
        for (var i = min; i < max; i++) {
            array.push(i);
        }
        return array;
    }

    static getArrayClone(array) {
        const newArray = [];
        for (var i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        return newArray;
    }

    static shuffle(array) {
        var m = array.length, t, i;

        while (m) {
            i = Math.floor(Math.random() * m--);

            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return this.getArrayClone(array);
    }
}

module.exports = ArrayHelper;