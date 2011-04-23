// DataSource = low level persistent functions

DataSource = function() { };

DataSource.insert = function(record) { };

// "*" -> todos
// {} -> mapeo
// [] -> lista de campos
DataSource.retrieve = function(where, order, fields) { };

DataSource.update = function(record) { };

DataSource.remove = function(record) { };

if (!isBrowser) {
   exports.DataSource = DataSource;
}
