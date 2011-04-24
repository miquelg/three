if (!isBrowser) {
    var inherits = require('sys').inherits;
    var types = exports;
}
else {
    var types = {};
}

// Base type

types.ctorType = function(options) {
    for (var option in options) {
        if (options.hasOwnProperty(prop)) { 
            this[option] = options[option];
        }
    }
};
types.ctorType.prototype.isType = true;
types.ctorType.prototype.toJSON = function(value) { };
types.ctorType.prototype.fromJSON = function(json) { };

// Basic types

types.ctorBasicType = function(options) {
    types.ctorType.call(this, options);
};
inherits(types.ctorBasicType, types.ctorType);
types.ctorBasicType.prototype.isBasicType = true;

types.ctorBasicType.prototype.toString = function(value) { };
types.ctorBasicType.prototype.toFormattedString = function(value, formatOptions) { };
types.ctorBasicType.prototype.fromString = function(string) { };

types.ctorNumber = function(options) { 
	types.ctorBasicType.call(this, options);         
};
inherits(types.ctorNumber, types.ctorBasicType);
types.Number = function(options) { return new ctorNumber(options); };

types.ctorString = function(options) { 
	types.ctorBasicType.call(this, options);         
};
inherits(types.ctorString, types.ctorBasicType);
types.String = function(options) { return new ctorString(options); };

types.ctorBoolean = function(options) { 
	types.ctorBasicType.call(this, options);         
};
inherits(types.ctorBoolean, types.ctorBasicType);
types.Boolean = function(options) { return new ctorBoolean(options); };

types.ctorDate = function(options) { 
	types.ctorBasicType.call(this, options);         
};
inherits(types.ctorDate, types.ctorBasicType);
types.Date = function(options) { return new ctorDate(options); };

// Record type

types.ctorRecord = function(options) {
    types.ctorType.call(this, options);
};
inherits(types.ctorRecord, types.ctorType);
types.ctorRecord.prototype.isRecord = true;
types.Record = function(options) { return new ctorRecord(options); };

types.ctorRecord.prototype.getProperties = function() {
	return this.properties;
};

// Relation types

types.ctorRelation = function(options) {
    types.ctorType.call(this, options);
};
inherits(types.ctorRelation, types.ctorType);
types.ctorRelation.prototype.isRelation = true;

types.ctorRelation1 = function(options) {
    types.ctorRelation.call(this, options);
};
inherits(types.ctorRelation1, types.ctorRelation);
types.ctorRelation1.prototype.isRelation1 = true;
types.Relation1 = function(options) { return new ctorRelation1(options); };

types.ctorRelationN = function(options) {
    types.ctorRelation.call(this, options);
};
inherits(types.ctorRelationN, types.ctorRelation);
types.ctorRelation1.prototype.isRelationN = true;
types.RelationN = function(options) { return new ctorRelationN(options); };

