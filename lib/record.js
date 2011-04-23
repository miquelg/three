if (!isBrowser) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
}

// Create a record from its values
var Record = function(values) {
  EventEmitter.call(this);
  this.values_ = values || {};
  this.dirtyMark_ = Record.UNMODIFIED;
};
inherits(Record, EventEmitter);
Record.prototype.isRecord = true;

// States of data
Record.UNMODIFIED = 0;
Record.NEW = 1;
Record.DELETED = 2;
Record.MODIFIED = 3;
Record.NEW_DELETED = 4;

// Obtains a property
Record.prototype.get = function(property) { 
	return this.values_[property];
};

// Obtains the model
Record.prototype.getModel = function() { 
    return this.model_;
};

// Obtains the type of a property
Record.prototype.getPropertyType = function(property) { 
	return this.model_.getPropertyType(property);
};

Record.prototype.getPk = function() { };
Record.prototype.getF = function() { };

// Sets a value to a property
Record.prototype.set = function(property, value) {
	
	// Possible data conversions from string
	var t = this.getPropertyType(property);
	if (t && typeof(value) == 'string') value = t.fromString(value);
	
	// Sets the value
	this.values_[property] = value;
	
	// Notify the change
    var this_ = this;
    setTimeout(function () { this_.notify(property, value); }, 0);   
};

// Call a callback function for each property of the record
Record.prototype.forEachProperty = function(callback) {
    this.getModel().forEachProperty(callback);
};

Record.load;
Record.loadCollection;
Record.prototype.loadPath;

if (!isBrowser) {
   exports.Record = Record;
}
