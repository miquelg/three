if (!isBrowser) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
    var types = require('types');
}

// Create a record from its values
var Record = function(values, store) {
  EventEmitter.call(this);
  this.values_ = values || {};
  this.store_ = store;
  this.dirtyMark_ = Record.UNMODIFIED;
  // TODO: Create fake PK if not informed
  if (store) store.register(this);
};
inherits(Record, EventEmitter);
Record.prototype.isRecord = true;

Record.prototype.getStore = function() {
    return this.store_;
};

Record.prototype.setStore = function(store) {
    this.store_ = store;
};

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
Record.prototype.getPkValue = function() { };
Record.prototype.getF = function() { };

// Sets a value to a property
Record.prototype.set = function(property, value) {
	
	// Possible data conversions from string
	var t = this.getPropertyType(property);
	if (t && typeof(value) == 'string') value = t.fromString(value);
	
	// Sets the value
	this.values_[property] = value;
	
	// Notify change
    var this_ = this;
    setTimeout(function () { this_.emit(property, value); this_.emit("*", value); }, 0);
};

// Call a callback function for each property of the record
Record.prototype.forEachProperty = function(callback) {
    this.getModel().forEachProperty(callback);
};

// Static methods defined in model:
// Record.load;
// Record.loadCollection;

// Load a property (only has sense if it's a relation, 
// since basic properties are already loaded
Record.prototype.loadProperty = function(property, preloadPaths) {
};

if (!isBrowser) {
   exports.Record = Record;
}
