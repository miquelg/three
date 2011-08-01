if (!isBrowser) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
}
else {
    var exports = window;
}

(function() {   // Open closure
    
Collection = function(model, valuesArray, store) { 
    this.model_ = model;
	this.elements_ = [];
    this.store_ = store;
	// Add values
    var recordClass = model.getRecordClass();
	for (var i = 0; i < valuesArray; i++) {
		var record = new recordClass(valuesArray[i], store);
		this.insert(record);
	}
};
Collection.prototype.isCollection = true;

Collection.prototype.getStore = function() {
    return this.store_;
};

Collection.prototype.setStore = function(store) {
    this.store_ = store;
};

Collection.prototype.insert = function(record) { 
	if (this.getIndex(record) == -1)
		this.elements_.push(record); 
};

Collection.prototype.remove = function(record) { 
	var index = this.getIndex(record);
	if (index != -1) {
		this.elements_.splice(index, 1);
	}
};

Collection.prototype.size = function() { 
	return this.elements_.length;
};

Collection.prototype.get = function(index) {
	if (0 <= index && index < this.elements_.length)
		return this.elements_[index];
	else
		return null;
};

Collection.prototype.getIndex = function(record) {
	for (var i = 0; i < this.elements_.length; i++) {
		if (record == this.elements_[i]) 
			return i;
	}
	return -1;
};

Collection.prototype.getElementType = function() { 
	return this.elementType_;
};

Collection.prototype.findRecord = function(property, value) { 
	for (var i = 0; i < this.elements_.length; i++) {
		var element = this.elements_[i];
		if (element.get(property) == value) 
			return element;
	}
	return null;
};

Collection.forEachRecord = function(callback) {
	for (var i = 0; i < this.elements_.length; i++) {
		callback(i, this.elements_[i]);
	}
};

exports.Collection = Collection;

})();

