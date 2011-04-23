## Goals:

- Proper separation of concerns (presentation and bussiness layers)
- Unified programming model shared among layers
- Metadata for models used in server and client (DRY)
- Component-based layout

### Models

Bussiness layer classes for metadata and bussiness logic

- Live on server
- Contain metadata for tables: properties, indexes, foreing keys, validation
- Can contain bussiness logic methods and data life-cycle events (onSave)
- Used to generate Record classes
- Models are read from fs on initialization and are keep in memory for the whole application life
- If not present in fs, can be inferred from DB metadata

### Records

Contain the actual data pushed and pulled from DB, that can be binded to UI Controls and later sync with DB.

- Generated automatically from Models
- Shared among client and server
- Actual ORM classes to interact with
- Inherit metadata from Models (can be transformed when sending to client)
- Can call bussiness logic methods in Models via AJAX

### Components

Server code for UI. Mainly declarative. Used to render the HTML that are sent to the client.

- Contain the server code for the Controls
- Exist on client in form of Control
- Mainly used for rendering basic HTML, that will be managed on client by the corresponding Control class
- Components can be based on other Components, or can render HTML directly

### Controls

Client code for UI Controls. Used for low level components and also contains the application presentation logic.

- Contain the presentation logic of the application
- Can be simple controls: textbox, select, checkbox, grid or a whole form
- Tree of controls are created dynamically in client from Components
- Can be binded to a Record


