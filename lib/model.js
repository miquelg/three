// Shared ???

var inherits = require('sys').inherits;
var types = require('types');
var Record = require('record').Record;

Model = function() {
    this.type_ = null;
    this.recordClass_ = null;
};
Model.prototype.isModel = true;

Model.prototype.getProperties = function() {
    return this.type_.properties;
};

// Get the record class from its model
Model.prototype.getRecordClass = function() {
    
    // if already exist, return it
    if (this.recordClass_) return this.recordClass_;
    
	// else define the class
    var model = this;
	var f = function(values) {
        Record.call(this, values); 
		this.model_ = model;
	};
	inherits(f, Record);
    
    // Define static methods for f:
    // f.load
    // f.loadCollection

    this.recordClass_ = f;
	return f;
};

Model.prototype.forEachProperty = function(callback) {
    var properties = this.getProperties();
	for (var name in properties) {
	    if (properties.hasOwnProperty(name)) {
			callback(name, properties[name]);
		}
	}
};

Model.prototype.getPropertyType = function(property) {
    return this.getProperties()[property];
};



