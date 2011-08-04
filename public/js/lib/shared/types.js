if (exports) {
    var inherits = require('sys').inherits;
}
else {
    window.types = {};
}

// TODO: options directly in object? how is that?

(function(exports) {   // Open closure

// Base type

Type = function(options) {
    for (var optionName in options) {
        if (options.hasOwnProperty(optionName)) { 
            this[optionName] = options[optionName];
        }
    }
};
Type.prototype.isType = true;
Type.prototype.toJSON = function(value) { };
Type.prototype.fromJSON = function(json) { };

// Basic types

BasicType = function(options) {
    Type.call(this, options);
};
inherits(BasicType, Type);
BasicType.prototype.isBasicType = true;

BasicType.prototype.toString = function(value) { };
BasicType.prototype.toFormattedString = function(value, formatOptions) { };
BasicType.prototype.fromString = function(string) { return string; };

NumberType = function(options) { 
	BasicType.call(this, options);         
};
inherits(NumberType, BasicType);
NumberType.prototype.isNumber = true;

NumberType.prototype.fromString = function(string) { return parseFloat(string); };      // TODO: separated Int - Float?

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
exports.Date = function(options) { return new DateType(options); };

// Record type

RecordType = function(options) {
    Type.call(this, options);
};
inherits(RecordType, Type);
RecordType.prototype.isRecordType = true;
exports.RecordType = function(options) { return new RecordType(options); };

RecordType.prototype.getProperties = function() {
	return this.properties;
};

RecordType.prototype.getName = function() {
    return this.name ? this.name : this.table;
}

// Relation types

Relation = function(options) {
    Type.call(this, options);
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


})(exports ? exports : window.types );
