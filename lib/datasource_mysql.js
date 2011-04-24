var mysql = require('mysql-libmysqlclient');
require('record');

var
    host = "localhost",
    user = "root",
    password = "",
    database = "sakila";

// Create connection
conn = mysql.createConnectionSync();
conn.connectSync(host, user, password, database);

DataSourceMySQL = {};

DataSourceMySQL.format = function(sql, params) {
  if (params) {
      sql = sql.replace(/\?/g, function() {
        if (params.length == 0) {
          throw new Error('too few parameters given');
        }
    
        return this.escape(params.shift());
      });
    
      if (params.length) {
        throw new Error('too many parameters given');
      }
  }

  return sql;
};

DataSourceMySQL.escape = function(val) {
  if (val === undefined || val === null) {
    return 'NULL';
  }

  switch (typeof val) {
    case 'boolean': return (val) ? 'true' : 'false';
    case 'number': return val+'';
  }

  if (typeof val === 'object') {
    val = val.toString();
  }

  val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
    switch(s) {
      case "\0": return "\\0";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\b": return "\\b";
      case "\t": return "\\t";
      case "\x1a": return "\\Z";
      default: return "\\"+s;
    }
  });
  return "'"+val+"'";
};

DataSourceMySQL.insert = function(record) {
    var params = [], valuesPlacement = "", columnsString = "";
    var first = true;
    record.forEachProperty(function(name) {
        params.push(record.get(name));
        valuesPlacement += first ? "?" : ", ?";
        columnsString += (first ? "" : ", ") + name;
        first = false;
    });
    conn.query("INSERT INTO " + record.getType().table + " (" + columnsString + ") VALUES (" + valuesPlacement + ")", params, function(err, info) {
        console.log(err);
    });    
};

// "*" -> todos
// {} -> mapeo
// [] -> lista de campos
DataSourceMySQL.retrieve = function(model, where, order, params, callback) {
    var type = model.getType();
    var sql = "SELECT * FROM " + type.table;
    if (where) sql += " WHERE " + where;
    if (order) sql += " ORDER BY " + order;
    var sql = this.format(sql, params);
    var query = conn.query(sql, function selectCb(err, res) {
      if (err) {
        throw err;
      }
      console.log(type);
    res.fetchAll(function (err, rows) {
      console.log(type);
    if (err) {
        throw err;
      }
    var col = new data.Collection();
      for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var record = new (model.getRecordClass());
          model.forEachProperty(function(name) {
              record.set(name, row[name]);
          });
          col.insert(record);
      }
      console.log(rows);
      if (callback)
        callback(col);
    });
});
};

DataSourceMySQL.update = function(record) {
    var params = [], setsString = "";
    var first = true;
    record.forEachProperty(function(name) {
        params.push(record.get(name));
        setsString += (first ? "" : ", ") + name + "=?";
        first = false;
    });
    var sql = "UPDATE " + record.getType().table + " SET " + setsString;
    sql += " WHERE " + record.getType().pk + "=?";
    params.push(record.get(record.getType().pk));
    conn.query(sql, params, function(err, info) {
        console.log(err);
    });   
};

DataSourceMySQL.remove = function(record) {
    var pk = record.getType().pk;
    var sql = "DELETE FROM " + record.getType().table + " WHERE " + pk + "=?";
    conn.query(sql, [record.get(pk)], function(err, info) {
        console.log(err);
    });
};    

exports.DataSourceMySQL = DataSourceMySQL;

