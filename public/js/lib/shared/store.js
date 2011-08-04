if (exports) {
    var inherits = require('sys').inherits;
}

(function(exports) {   // Open closure

Store = function(dataSource) {
    this.dataSource_ = dataSource;
	this.recordsMap_ = {};
};

// TODO: paralellyze -> connection pool?

// TODO: Allow callback in any of the latter params OR options with named params
// TODO: err
Store.prototype.loadRecord = function(model, where, order, params, callback) {
    var ds = this.dataSource_;
    var col = ds.retrieve(model, where, order, params, function(col) {
        var record = col.get(0);
        record.setStore(this);      // Set the store, since ds retrieved records are storeless
        if (callback) callback(record);
    });
};

// TODO: err
Store.prototype.loadCollection = function(model, where, order, params, callback) {
    var ds = this.dataSource_;
    var col = ds.retrieve(model, where, order, params, function(col) {
        for (var i = 0; i < col.size(); i++) {
            var record = col.get(i);
            record.setStore(this);
        }
        col.setStore(this);      // Set the storex
        if (callback) callback(col);
    });
};

// TODO: fixme
Store.loadRecordFromJSON = function(model, values) {
    var recordClass = model.getRecordClass();
    return new (recordClass)(values, store);
};

Store.loadCollectionFromJSON = function(model, valuesArray) {
    return new Collection(model, valuesArray);
};

// Register a record in the store by PK
Store.register = function(record) {
    this.recordsMap_[record.getPkValue()] = record;
};

Store.flush = function() {
    for (var pk in  this.recordsMap_) {
         if (this.recordsMap_.hasOwnProperty(pk)) {
                // 1.- Resolve fake PKs
                // 2.- call the appropiate dataSource method based on record state
         }
    }
};

exports.Store = Store;

})(exports ? exports : window);
