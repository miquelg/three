// Store = high level persistence (with cache)

Store = function(dataSource) {
    this.dataSource_ = dataSource;
	this.recordsMap_ = {};
};

// TODO: Allow callback in any of the latter params OR options with named params
Store.loadRecord = function(model, where, order, params, callback) {
    var ds = this.dataSource_;
    var type = model.getType();
    var col = ds.retrieve(type, where, order, params, callback);
    var record = col.get(0);
    record.setStore(this);      // Set the store, since ds retrieved records are storeless
    return record;
};

Store.loadRecordFromJSON = function(model, values) {
    var recordClass = model.getRecordClass();
    return new (recordClass)(values, store);
};

Store.loadCollection = function(model, where, order, callback) {
    var ds = this.dataSource_;
    var col = ds.retrieve(model, where, order, params, callback);
    for (var i = 0; i < col.size(); i++) {
        var record = col.get(i);
        record.setStore(this);
    }
    col.setStore(this);      // Set the storex
    return col;
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

if (!isBrowser) {
   exports.Store = Store;
}
