// Store = high level persistence (with cache)

Store = function(dataSource) {
    this.dataSource_ = dataSource;
	this.data_ = {};
};

Store.loadRecord = function(model, where, callback) {
};

Store.loadRecordFromJSON;

Store.loadCollection = function(model, where, order, callback) {
	
};

Store.loadCollectionFromJSON;

Store.put = function(record, callback) {
	
};

Store.remove = function(record, callback) {
	
};

Store.flush;

if (!isBrowser) {
   exports.Store = Store;
}
