const Roles = require('../models/roles');

class SpyRoleSelections {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.roleList = [];
        this.roleMapping = new Map();
    }

    getIndex(role) {
        return this.roleMapping.has(role) ? this.roleMapping.get(role) : -1;
    }

    add(role) {
        if (this.roleList.length === this.maxSize - 1 && role === Roles.Percival && !this.containsMorgana) {
            return false;
        }

        this.roleMapping.set(role, this.roleList.length);
        this.roleList.push(role);

        if (role === Roles.Percival && !this.containsMorgana && !this.roleMapping.has(Roles.Merlin))
        {
            this.roleMapping.set(Roles.Merlin, this.roleList.length);
            this.roleList.push(Roles.Merlin);
            this.containsAssassinableRole = true;
        }

        return true;
    }

    isFull() {
        return this.roleList.length === this.maxSize;
    }

    getRoles() {
        return this.roleList;
    }
}

module.exports = SpyRoleSelections;