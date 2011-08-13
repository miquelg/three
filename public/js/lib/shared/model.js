if (exports) {
    var inherits = require('sys').inherits;
    var types = require('./types');
    var Record = require('./record').Record;
    var Store = require('./store').Store;
}

(function(exports) {   // Open closure

Model = function(type) {
    this.type_ = type;
    this.recordClass_ = null;
    Model.modelsMap[type.getName()] = this;
    // console.log("ModelsMap: " + type.getName() + "-" + Model.getModelByName(type.getName()).getType().table + "/ModelsMap: ");
};
Model.prototype.isModel = true;

Model.modelsMap = {};

Model.getModelByName = function(name) {
    return Model.modelsMap[name];
};

Model.prototype.getName = function() {
    return this.type_.getName();
};

Model.prototype.getType = function() {
    return this.type_;
};

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
    
    f.load = function(where, store, callback) {
        store.loadRecord(model, where, "", "", callback);        // TODO: params
    };
    
    f.loadCollection = function(where, store, params, offset, rowCount, callback) {
        // console.log( store);
        store.loadCollection(model, where, "", params, offset, rowCount, callback);        // TODO: params, startRow, numRows
    };

    f.getModel = function() {
        return model;
    };

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

exports.Model = Model;

})(exports ? exports : window);

