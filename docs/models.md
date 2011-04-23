#### Model example

(actor.js)

    var t = require('types');

    module.exports = {

        create: function() {

            return new t.Record({
                table: "actor",
                pk: "actor_id",
                properties: {
				"actor_id": t.Number(5),
				"first_name", t.String(45),
				"last_name", t.String(45),
				"last_update", t.Date(),
				"film_debutted_id": t.Number(5),
				"film_debutted": t.Relation1({ model: "film", own: "film_debutted_id" }),
				"films_actors": t.RelationN({ model: "film_actor", other: "actor_id" })
                }
        };

        bussinessMethod1 = function(record) {
        };

    };

