const Roles = require('../models/roles');

class ResistanceRoleSelections {
    constructor(maxSize, containsMorgana) {
        this.maxSize = maxSize;
        this.containsMorgana = containsMorgana;
        this.roleList = [];
        this.roleMapping = new Map();
        this.containsAssassinableRole = false;
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

        if (!this.containsAssassinableRole && (role === Roles.Merlin || role === Roles.Arthur ||
            (this.roleMapping.has(Roles.Tristan) && this.roleMapping.has(Roles.Iseult)))) {
            this.containsAssassinableRole = true;
        }

        return true;
    }

    isFull() {
        return this.roleList.length === this.maxSize;
    }

    getRoles() {
        if (!this.containsAssassinableRole) {
            return null;
        }

        const tristanIndex = this.getIndex(Roles.Tristan);
        const iseultIndex = this.getIndex(Roles.Iseult);
        if ((tristanIndex === -1 && iseultIndex !== -1) || (tristanIndex !== -1 && iseultIndex === -1)) {
            this.roleList[tristanIndex === -1 ? iseultIndex : tristanIndex] = Roles.Uther;
        }

        return this.roleList;
    }
}

module.exports = ResistanceRoleSelections;