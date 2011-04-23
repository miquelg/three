#### Records usage

    // Create store
    var store = new Store();

    // Create a new actor
    var actor1 = new Actor({ first_name: "Kevin", last_name: "Bacon" }, store);

    // Load an actor from DB
    var actor2 = Actor.load("id = 13", store , function(actor) {
        actor.first_name = "Kevin";
    });

    // Load and iterate collection
    actor2.films_actors.forEachRecord(function(film_actor) {
        film_actor.film.name = "xxx";
    });

    // Iterate properties
    actor2.forEachProperty(function(name) {
        actor2[name] = null;
    });

    // Flush store
    store.flush();

