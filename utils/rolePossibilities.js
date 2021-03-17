class RolePossibilities {
    constructor(roleList) {
        this.roleList = roleList;
        this.roleMapping = new Map();
        for (let i = 0; i < roleList.length; i++) {
            this.roleMapping.set(roleList[i], i);
        }
    }

    getIndex(role) {
        return this.roleMapping.get(role) || -1;
    }

    isEmpty() {
        return this.roleList.length === 0;
    }

    pop() {
        const currentRole = this.roleList.pop();
        this.roleMapping.delete(currentRole);
        return currentRole;
    }

    remove(role) {
        const roleIndex = this.getIndex(role);
        if (roleIndex !== -1) {
            this.roleMapping.delete(role);
            this.roleList.splice(roleIndex, 1);
            for (let i = roleIndex; i < this.roleList.length; i++) {
                this.roleMapping.set(this.roleList[i], i);
            }
        }
    }
}

module.exports = RolePossibilities;
