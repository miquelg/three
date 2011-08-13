var mysql = require('mysql-libmysqlclient');
require('../public/js/lib/shared/record');
var Collection = require('../public/js/lib/shared/collection').Collection;

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
        if (params.length === 0) {
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
    var type = record.getModel().getType();
    conn.query("INSERT INTO " + type.table + " (" + columnsString + ") VALUES (" + valuesPlacement + ")", params, function(err, info) {
        console.log(err);
    });    
};

// "*" -> todos
// {} -> mapeo
// [] -> lista de campos
DataSourceMySQL.retrieve = function(model, where, order, params, offset, rowCount, callback) {
    var type = model.getType();
    var sql = "";
    var table = type.table;
    if (table.toUpperCase() == "TABLE") {
        sql += "SHOW TABLE STATUS ";
        if (where) sql += " WHERE " + where;
    }
    else if (table.toUpperCase() == "COLUMN") {
        sql += "SHOW COLUMNS FROM  " + params[0];
        params = [];
    }
    else {
        sql += "SELECT * FROM " + table;
        if (where) sql += " WHERE " + where;
        if (order) sql += " ORDER BY " + order;
        if ((offset || offset === 0) && rowCount) {
            sql += " LIMIT " + offset + ", " + rowCount;
        }
    }
    var sql = this.format(sql, params);
    console.log(sql);
    var query = conn.query(sql, function selectCb(err, res) {
      if (err) {
        throw err;
      }
      // console.log(type);
    res.fetchAll(function (err, rows) {
      // console.log(type);
    if (err) {
        throw err;
      }
    var col = new Collection(model);
      for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var record = new (model.getRecordClass());
          model.forEachProperty(function(name) {
              record.set(name, row[name]);
          });
          col.insert(record);
      }
      // console.log(rows);
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
    var type = record.getModel().getType();
    var sql = "UPDATE " + type.table + " SET " + setsString;
    sql += " WHERE " + type.pk + "=?";
    params.push(record.getPkValue());
    conn.query(sql, params, function(err, info) {
        console.log(err);
    });   
};

DataSourceMySQL.remove = function(record) {
    var type = record.getModel().getType();
    var pk = type.pk;
    var sql = "DELETE FROM " + type.table + " WHERE " + pk + "=?";
    conn.query(sql, [record.getPkValue()], function(err, info) {
        console.log(err);
    });
};    

exports.DataSourceMySQL = DataSourceMySQL;

