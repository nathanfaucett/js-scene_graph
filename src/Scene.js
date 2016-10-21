var indexOf = require("@nathanfaucett/index_of"),
    Class = require("@nathanfaucett/class"),
    isString = require("@nathanfaucett/is_string"),
    Entity = require("./Entity"),
    Time = require("./Time");


var ClassPrototype = Class.prototype,
    ScenePrototype;


module.exports = Scene;


function Scene() {

    Class.call(this);

    this.name = null;
    this.time = Time.create();

    this.entities = [];
    this._entityHash = {};
    this._entityNameHash = {};

    this._componentManagers = [];
    this.componentManagers = {};

    this._plugins = [];
    this.plugins = {};

    this._initted = false;
}

Class.extend(Scene, "scene_graph.Scene");
ScenePrototype = Scene.prototype;

ScenePrototype.construct = function(name) {

    ClassPrototype.construct.call(this);

    if (isString(name)) {
        this.name = name;
    }

    this.time.construct();

    this._initted = false;

    return this;
};

ScenePrototype.destructor = function() {
    var entities = this.entities,
        plugins = this._plugins,
        i;

    ClassPrototype.destructor.call(this);

    i = entities.length;
    while (i--) {
        entities[i].destroy(false).destructor();
    }
    i = plugins.length;
    while (i--) {
        plugins[i].destroy(false).destructor();
    }

    this.name = null;
    this._initted = false;

    return this;
};

ScenePrototype.init = function() {
    if (!this._initted) {
        this._initted = true;
        sortComponentManagers(this);
        this.sortComponentManagers();
        this.initPlugins();
        this.initComponentManagers();
        this.initEntities();
        this.emitArg("init");
    }
    return this;
};

ScenePrototype.update = function() {

    this.time.update();
    this.updatePlugins();
    this.updateComponentManagers();
    this.updateEntities();

    return this;
};

ScenePrototype.clear = function(emitEvent) {
    var entities = this.entities,
        plugins = this._plugins,
        i, il, entity;

    if (emitEvent !== false) {
        this.emitArg("clear");
    }

    i = -1;
    il = entities.length - 1;
    while (i++ < il) {
        entity = entities[i];

        if (entity) {
            entity.destroy(emitEvent);
        }
    }

    i = plugins.length;
    while (i--) {
        plugins[i].destroy(emitEvent).destructor();
    }

    return this;
};

ScenePrototype.destroy = function(emitEvent) {
    if (emitEvent !== false) {
        this.emitArg("destroy");
    }
    this.clear(false);
    return this;
};

ScenePrototype.hasEntity = function(entity) {
    return !!this._entityHash[entity._id];
};

ScenePrototype.hasEntityWithName = function(name) {
    return !!this._entityNameHash[name];
};

ScenePrototype.getEntityByName = function(name) {
    return this._entityNameHash[name];
};

ScenePrototype.addEntity = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Scene_addEntity(this, arguments[i]);
    }

    return this;
};

function Scene_addEntity(_this, entity) {
    var entities = _this.entities,
        entityHash = _this._entityHash,
        id = entity._id,
        entityNameHash;

    if (!entityHash[id]) {
        entity.scene = _this;
        entities[entities.length] = entity;
        entityHash[id] = entity;

        if (isString(entity.name)) {
            entityNameHash = _this._entityNameHash;

            if (!entityNameHash[entity.name]) {
                entityNameHash[entity.name] = entity;
            } else {
                throw new Error(
                    "Scene addEntity(...entities) Trying to add two entities " +
                    "with the same name " + entity.name
                );
            }
        }

        Scene_addComponents(_this, entity._components);
        Scene_addChildren(_this, entity.children);

        _this.emitArg("addEntity", entity);
    } else {
        throw new Error(
            "Scene addEntity(...entities) Trying to add Entity that is " +
            "already a member of Scene"
        );
    }
}

function Scene_addComponents(_this, components) {
    var i = -1,
        il = components.length - 1;

    while (i++ < il) {
        _this._addComponent(components[i]);
    }
}

function Scene_addChildren(_this, children) {
    var i = -1,
        il = children.length - 1;

    while (i++ < il) {
        Scene_addEntity(_this, children[i]);
    }
}

ScenePrototype._addComponent = function(component) {
    var className = component.className,
        managerHash = this.componentManagers,
        componentManagerHash = this._componentManagers,
        manager = managerHash[className];

    if (!manager) {
        manager = component.ComponentManager.create();

        manager.scene = this;
        componentManagerHash[componentManagerHash.length] = manager;
        managerHash[className] = manager;


        if (this._initted) {
            sortComponentManagers(this);
            manager.onAddToScene();
            manager.init();
        } else {
            manager.onAddToScene();
        }

        this.emitArg("addComponentManager", manager);
    }

    manager.addComponent(component);
    component.manager = manager;

    this.emitArg("add." + className, component);

    if (this._initted) {
        manager.sort();
        component.init();
    }

    return this;
};

ScenePrototype.removeEntity = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Scene_removeEntity(this, arguments[i]);
    }

    return this;
};

function Scene_removeEntity(_this, entity) {
    var entities = _this.entities,
        entityHash = _this._entityHash,
        id = entity._id,
        entityNameHash;

    if (entityHash[id]) {
        _this.emitArg("removeEntity", entity);

        if (isString(entity.name)) {
            entityNameHash = _this._entityNameHash;

            if (entityNameHash[entity.name]) {
                delete entityNameHash[entity.name];
            } else {
                throw new Error(
                    "Scene removeEntity(...entities) " +
                    "Trying to remove entity without a name. You might have " +
                    "change the name after adding it to the Scene."
                );
            }
        }

        entity.scene = null;

        entities.splice(indexOf(entities, entity), 1);
        delete entityHash[id];

        Scene_removeComponents(_this, entity._components);
        Scene_removeChildren(_this, entity.children);
    } else {
        throw new Error(
            "Scene removeEntity(...entities) trying to remove " +
            "Entity that is not a member of Scene"
        );
    }
}

function Scene_removeComponents(_this, components) {
    var i = -1,
        il = components.length - 1;

    while (i++ < il) {
        _this._removeComponent(components[i]);
    }
}

function Scene_removeChildren(_this, children) {
    var i = -1,
        il = children.length - 1;

    while (i++ < il) {
        Scene_removeEntity(_this, children[i]);
    }
}

ScenePrototype._removeComponent = function(component) {
    var className = component.className,
        managerHash = this.componentManagers,
        componentManagerHash = this._componentManagers,
        manager = managerHash[className];

    if (manager) {
        this.emitArg("remove." + className, component);

        manager.removeComponent(component);
        component.manager = null;

        if (manager.isEmpty()) {
            manager.onRemoveFromScene();
            this.emitArg("removeComponentManager", manager);

            manager.scene = null;
            componentManagerHash.splice(
                indexOf(componentManagerHash, manager),
                1
            );
            delete managerHash[className];
        }
    }

    return this;
};

function sortComponentManagers(_this) {
    _this._componentManagers.sort(sortComponentManagersFn);
}

function sortComponentManagersFn(a, b) {
    return a.order - b.order;
}

ScenePrototype.hasComponentManager = function(name) {
    return !!this.componentManagers[name];
};
ScenePrototype.hasComponentManagerFor = ScenePrototype.hasComponentManager;

ScenePrototype.getComponentManager = function(name) {
    return this.componentManagers[name];
};
ScenePrototype.getComponentManagerFor = ScenePrototype.getComponentManager;

function clearComponentManagers_callback(manager) {
    manager.clear(clearManagers_callback.emitEvents);
}
clearComponentManagers_callback.set = function(emitEvents) {
    this.emitEvents = emitEvents;
    return this;
};
ScenePrototype.clearComponentManagers = function(emitEvents) {
    return this.forEachComponentManager(
        clearComponentManagers_callback.set(emitEvents)
    );
};

function initComponentManagers_callback(manager) {
    manager.init();
}
ScenePrototype.initComponentManagers = function() {
    return this.forEachComponentManager(initComponentManagers_callback);
};

function sortComponentManagers_callback(manager) {
    manager.sort();
}
ScenePrototype.sortComponentManagers = function() {
    return this.forEachComponentManager(sortComponentManagers_callback);
};

function initEntities_callback(entity) {
    entity.emitArg("init");
}
ScenePrototype.initEntities = function() {
    return this.forEachEntity(initEntities_callback);
};

function updateEntities_callback(entity) {
    entity.emitArg("update");
}
ScenePrototype.updateEntities = function() {
    return this.forEachEntity(updateEntities_callback);
};

function updateComponentManagers_callback(manager) {
    manager.update();
}
ScenePrototype.updateComponentManagers = function() {
    return this.forEachComponentManager(updateComponentManagers_callback);
};

ScenePrototype.forEachEntity = function(fn) {
    var entities = this.entities,
        i = -1,
        il = entities.length - 1;

    while (i++ < il) {
        if (fn(entities[i]) === false) {
            break;
        }
    }
    return this;
};

ScenePrototype.forEachComponentManager = function(fn) {
    var componentManagerHash = this._componentManagers,
        i = -1,
        il = componentManagerHash.length - 1;

    while (i++ < il) {
        if (fn(componentManagerHash[i]) === false) {
            break;
        }
    }
    return this;
};

ScenePrototype.addPlugin = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        ScenePrototype_addPlugin(this, arguments[i]);
    }

    return this;
};

function ScenePrototype_addPlugin(_this, plugin) {
    var plugins = _this._plugins,
        pluginHash = _this.plugins,
        className = plugin.className;

    if (!pluginHash[className]) {
        plugin.scene = _this;
        plugins[plugins.length] = plugin;
        pluginHash[className] = plugin;
        if (_this._initted) {
            plugin.init();
        }
        _this.emitArg("addPlugin", plugin);
    } else {
        throw new Error(
            "Scene addPlugin(...plugins) trying to add plugin " +
            className + " that is already a member of Scene"
        );
    }
}

ScenePrototype.removePlugin = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        ScenePrototype_removePlugin(this, arguments[i]);
    }

    return this;
};

function ScenePrototype_removePlugin(_this, plugin) {
    var plugins = _this._plugins,
        pluginHash = _this.plugins,
        className = plugin.className;

    if (pluginHash[className]) {
        _this.emitArg("removePlugin", plugin);
        plugin.scene = null;
        plugins.splice(indexOf(plugins, plugin), 1);
        delete pluginHash[className];
    } else {
        throw new Error(
            "Scene removePlugin(...plugins) trying to remove plugin " +
            className + " that is not a member of Scene"
        );
    }
}

ScenePrototype.hasPlugin = function(name) {
    return !!this.plugins[name];
};

ScenePrototype.getPlugin = function(name) {
    return this.plugins[name];
};

function clearPlugins_callback(plugin) {
    plugin.clear(clearPlugins_callback.emitEvents);
}
clearPlugins_callback.set = function(emitEvents) {
    this.emitEvents = emitEvents;
    return this;
};
ScenePrototype.clearPlugins = function(emitEvents) {
    return this.forEachPlugin(clearPlugins_callback.set(emitEvents));
};

function initPlugins_callback(plugin) {
    plugin.init();
}
ScenePrototype.initPlugins = function() {
    return this.forEachPlugin(initPlugins_callback);
};

function updatePlugins_callback(plugin) {
    plugin.update();
}
ScenePrototype.updatePlugins = function() {
    return this.forEachPlugin(updatePlugins_callback);
};

ScenePrototype.forEachPlugin = function(fn) {
    var plugins = this._plugins,
        i = -1,
        il = plugins.length - 1;

    while (i++ < il) {
        if (fn(plugins[i]) === false) {
            break;
        }
    }
    return this;
};

ScenePrototype.toJSON = function(json) {
    var entities = this.entities,
        plugins = this._plugins,
        i = -1,
        il = entities.length - 1,
        index, jsonEntities, entity, jsonPlugins;

    json = ClassPrototype.toJSON.call(this, json);

    json.name = this.name;
    json.time = this.time.toJSON(json.time);

    jsonEntities = json.entities || (json.entities = []);
    jsonPlugins = json.plugins || (json.plugins = []);

    while (i++ < il) {
        entity = entities[i];

        if (entity.depth === 0) {
            index = jsonEntities.length;
            jsonEntities[index] = entity.toJSON(jsonEntities[index]);
        }
    }

    i = -1;
    il = plugins.length - 1;
    while (i++ < il) {
        index = jsonPlugins.length;
        jsonPlugins[index] = plugins[i].toJSON(jsonPlugins[index]);
    }

    return json;
};

ScenePrototype.fromJSON = function(json) {
    var jsonEntities = json.entities,
        jsonPlugins = json.plugins,
        i, il, entity, jsonPlugin, plugin;

    ClassPrototype.fromJSON.call(this, json);

    this.name = json.name;
    this.time.fromJSON(json.time);

    i = -1;
    il = jsonEntities.length - 1;
    while (i++ < il) {
        entity = new Entity();
        entity.fromJSON(jsonEntities[i]);
        this.addEntity(entity);
    }

    i = -1;
    il = jsonPlugins.length - 1;
    while (i++ < il) {
        jsonPlugin = jsonPlugins[i];
        plugin = Class.newClass(jsonPlugin.className);
        plugin.fromJSON(jsonPlugin);
        this.addPlugin(plugin);
    }

    return this;
};