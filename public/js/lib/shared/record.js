if (exports) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
    var types = require('./types');
}

(function(exports) {   // Open closure

// Create a record from its values
var Record = function(values, store) {
  EventEmitter.call(this);
  
  this.store_ = store;
  this.dirtyMark_ = Record.UNMODIFIED;

  // admit relations (recursive)
  this.values_ = {};
  for (var key in values) {
    var value = values[key];
    var t = this.getPropertyType(key);
    if (t) {
        if (t.isRelationN) {
            value = new Collection(t.getModel(), value, store);
        }
        else if (t.isRelation1) {
            value = new t.getModel().getRecordClass()(value, store);
        }
        this.set(key, value);       // Proper set       
    }
    else {
      this.values_[key] = value;    // Admit non–property key/values
    }
  }
  
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
Record.prototype.get = function(propertyName) { 
	return this.values_[propertyName];
};

// Obtains the model
Record.prototype.getModel = function() { 
    return this.model_;
};

// Obtains the type of a property
Record.prototype.getPropertyType = function(propertyName) { 
	return this.model_.getPropertyType(propertyName);
};

Record.prototype.getPk = function() { };
Record.prototype.getPkValue = function() { };
Record.prototype.getF = function() { };

// Sets a value to a property
Record.prototype.set = function(propertyName, value) {
	
	// Possible data conversions from string
	var t = this.getPropertyType(propertyName);
	if (t && typeof(value) == 'string') value = t.fromString(value);
	
    // Sets the value
    this.values_[propertyName] = value;
	
	// Notify change
    var this_ = this;
    setTimeout(function () { this_.emit(propertyName, value); this_.emit("*", value); }, 0);
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
// TODO: support "own"
// TODO: rename to "loadPath" or "loadRelation" ???
Record.prototype.loadProperty = function(propertyName, offset, rowCount, callback) {
    var this_ = this;
    var type = this.getPropertyType(propertyName);
    if (type.isRelationN) {
        var model =  Model.modelsMap[type.model];
        model.getRecordClass().loadCollection(type.other + "=?", this.getStore(), [this.get(this.getModel().getType().getPk())], offset, rowCount, function(col) {
            this_.set(propertyName, col);
            if (callback) callback(col);
        });
    }
};

// TODO: use this map to avoid recursion, writting only PK columns for already written records
Record.jsonRecurseMap = {};
Record.jsonRecurseDeep = false;

// Writes value data to a JSON string
// deep: also writes relations (keeps trace of written elements to cute down recursivity)
// TODO: test!!!
Record.prototype.convertToJSON = function(deep) {
    Record.jsonRecurseDeep = deep;
    Record.jsonRecurseMap = {};
    return JSON.stringify(JSON.stringify(this));
};

// Internal method: not to be called
Record.prototype.toJSON = function() {
    var this_ = this;
    var values = { model: this.getModel().getName() };
    this.forEachProperty(function(name, propertyType) {
        if (propertyType && (Record.jsonRecurseDeep || propertyType.isRelation)) {
            values[name] = this_.get(name);
        }
    });
    // return JSON.stringify(values);
    return values;
};

exports.Record = Record;

})(exports ? exports : window);

