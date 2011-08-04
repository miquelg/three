var Model = require('../public/js/lib/shared/model.js').Model;
var Store = require('../public/js/lib/shared/store.js').Store;
var t = require('../public/js/lib/shared/types.js');

var DataSourceMySQL = require('./datasource_mysql').DataSourceMySQL;

var Actor = new Model(t.RecordType({
    table: "actor",
    pk: "actor_id",
    properties: {
        "actor_id": t.Number(5),
        "first_name": t.String(45),
        "last_name": t.String(45),
        "last_update": t.Date(),
        "film_debutted_id": t.Number(5),
        "film_debutted": t.Relation1({ model: "film", own: "film_debutted_id" }),
        "films_actors": t.RelationN({ model: "film_actor", other: "actor_id" })
    }
})).getRecordClass();

var Language = new Model(t.RecordType({
    table: "language",
    pk: "language_id",
    properties: {
        "language_id": t.Number(3),
        "name": t.String(20),
        "last_update": t.Date()
    }
})).getRecordClass();

DataSourceMySQL.retrieve(Actor.getModel(), "1=1", "", "");

var store = new Store(DataSourceMySQL);

Actor.load("actor_id=198", store, function(julia) {
    console.log(julia.get("first_name"));
    console.log(julia.get("last_name"));
    console.log(julia.values_);
    
    Language.loadCollection("", store, function(col) {
        console.log("lenguajes");
    });

});

