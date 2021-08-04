const lobbies = new Map();

function generate_code () {
    var code = null;
    const code_length = 4;
    do {
        var result = '';
        const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < code_length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        if (!lobbies.has(code)) {
            code = result;
        }
    } while (code === null);
    return code;
};

module.exports = {
    generate_code,
    lobbies
};
