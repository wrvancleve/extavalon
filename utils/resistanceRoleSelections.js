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
        if (this.roleList.length === this.maxSize - 1 && 
                ((role === Roles.Percival && !this.containsMorgana)
                || (role === Roles.Galahad && !this.roleMapping.has(Roles.Arthur)))) {
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

        if (role === Roles.Galahad && !this.roleMapping.has(Roles.Arthur))
        {
            this.roleMapping.set(Roles.Arthur, this.roleList.length);
            this.roleList.push(Roles.Arthur);
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

    getRoles(leonPossible) {
        if (!this.containsAssassinableRole) {
            return null;
        }

        const tristanIndex = this.getIndex(Roles.Tristan);
        const iseultIndex = this.getIndex(Roles.Iseult);
        if ((tristanIndex === -1 && iseultIndex !== -1) || (tristanIndex !== -1 && iseultIndex === -1)) {
            const replacementIndex = tristanIndex === -1 ? iseultIndex : tristanIndex;
            if (leonPossible) {
                this.roleList[replacementIndex] = Roles.Leon;
            } else {
                this.roleList[replacementIndex] = Roles.Uther;
            }
        }

        return this.roleList;
    }
}

module.exports = ResistanceRoleSelections;