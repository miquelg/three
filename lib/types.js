if (!isBrowser) {
    var inherits = require('sys').inherits;
}
else {
    window.types = {};
    var exports = window.types;
}

(function() {   // Open closure

// Base type

Type = function(options) {
    for (var option in options) {
        if (options.hasOwnProperty(prop)) { 
            this[option] = options[option];
        }
    }
};
Type.prototype.isType = true;
Type.prototype.toJSON = function(value) { };
Type.prototype.fromJSON = function(json) { };

// Basic types

BasicType = function(options) {
    types.ctorType.call(this, options);
};
inherits(BasicType, Type);
BasicType.prototype.isBasicType = true;

BasicType.prototype.toString = function(value) { };
BasicType.prototype.toFormattedString = function(value, formatOptions) { };
BasicType.prototype.fromString = function(string) { };

NumberType = function(options) { 
	BasicType.call(this, options);         
};
inherits(NumberType, BasicType);
NumberType.prototype.isNumber = true;
exports.Number = function(options) { return new NumberType(options); };

StringType = function(options) { 
	BasicType.call(this, options);         
};
inherits(StringType, BasicType);
exports.String = function(options) { return new StringType(options); };

BooleanType = function(options) { 
	BasicType.call(this, options);         
};
inherits(BooleanType, BasicType);
exports.Boolean = function(options) { return new BooleanType(options); };

DateType = function(options) { 
	BasicType.call(this, options);         
};
inherits(DateType, BasicType);
exports.Date = function(options) { return new ctorDate(options); };

// Record type

Record = function(options) {
    Type.call(this, options);
};
inherits(Record, Type);
Record.prototype.isRecord = true;
exports.Record = function(options) { return new Record(options); };

Record.prototype.getProperties = function() {
	return this.properties;
};

// Relation types

Relation = function(options) {
    ype.call(this, options);
};
inherits(Relation, Type);
Relation.prototype.isRelation = true;

Relation1 = function(options) {
    Relation.call(this, options);
};
inherits(Relation1, Relation);
Relation1.prototype.isRelation1 = true;
exports.Relation1 = function(options) { return new Relation1(options); };

RelationN = function(options) {
    Relation.call(this, options);
};
inherits(RelationN, Relation);
RelationN.prototype.isRelationN = true;
exports.RelationN = function(options) { return new RelationN(options); };


})();
