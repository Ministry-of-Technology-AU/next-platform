'use strict';

class DatabaseError extends Error {
    constructor(message = 'A database error occurred', details = {}){
        super();
        this.name = 'DatabaseError';
        this.message = message;
        this.details = details;
    }
}

module.exports = DatabaseError;
//# sourceMappingURL=database.js.map
