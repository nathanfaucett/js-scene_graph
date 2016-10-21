var Class = require("@nathanfaucett/class"),
    indexOf = require("@nathanfaucett/index_of"),
    isString = require("@nathanfaucett/is_string");


var ClassPrototype = Class.prototype,
    EntityPrototype;


module.exports = Entity;


function Entity() {

    Class.call(this);

    this.name = null;
    this.depth = 0;
    this.scene = null;
    this.root = this;
    this.parent = null;
    this.children = [];

    this._components = [];
    this.components = {};
}

Class.extend(Entity, "scene_graph.Entity");
EntityPrototype = Entity.prototype;

EntityPrototype.construct = function(name) {

    ClassPrototype.construct.call(this);

    if (isString(name)) {
        this.name = name;
    }

    this.depth = 0;
    this.root = this;

    return this;
};

EntityPrototype.destructor = function() {
    var components = this._components,
        i = components.length;

    ClassPrototype.destructor.call(this);

    while (i--) {
        components[i].destroy(false).destructor();
    }

    this.name = null;
    this.depth = 0;
    this.scene = null;
    this.root = this;
    this.parent = null;

    return this;
};

EntityPrototype.destroy = function(emitEvent) {
    var scene = this.scene;

    if (scene) {
        if (emitEvent !== false) {
            this.emitArg("destroy");
        }
        scene.removeEntity(this);
    }

    return this;
};

EntityPrototype.hasComponent = function(name) {
    return !!this.components[name];
};

EntityPrototype.getComponent = function(name) {
    return this.components[name];
};

EntityPrototype.addComponent = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_addComponent(this, arguments[i]);
    }

    return this;
};

function Entity_addComponent(_this, component) {
    var className = component.className,
        componentHash = _this.components,
        components = _this._components,
        scene = _this.scene;

    if (!componentHash[className]) {
        component.entity = _this;

        components[components.length] = component;
        componentHash[className] = component;

        if (scene) {
            scene._addComponent(component);
        }

        component.init();
    } else {
        throw new Error(
            "Entity addComponent(...components) trying to add " +
            "components that is already a member of Entity"
        );
    }
}

EntityPrototype.removeComponent = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_removeComponent(this, arguments[i]);
    }
    return this;
};

function Entity_removeComponent(_this, component) {
    var className = component.className,
        componentHash = _this.components,
        components = _this._components,
        index = components.indexOf(components, component),
        scene = _this.scene;

    if (index === -1) {
        if (scene) {
            scene._removeComponent(component);
        }

        component.entity = null;

        components.splice(index, 1);
        delete componentHash[className];
    } else {
        throw new Error(
            "Entity removeComponent(...components) trying to remove " +
            "component that is already not a member of Entity"
        );
    }
}

EntityPrototype.forEachChild = function(fn, recursize) {
    var children = this.children,
        i = -1,
        il = children.length - 1,
        child;

    while (i++ < il) {
        child = children[i];

        if (fn(child, i, this) === false) {
            return false;
        }
        if (recursize) {
            if (child.forEachChild(fn, recursize) === false) {
                return false;
            }
        }
    }
};

EntityPrototype.addChild = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_addChild(this, arguments[i]);
    }

    return this;
};

function Entity_addChild(_this, entity) {
    var children = _this.children,
        index = indexOf(children, entity),
        scene;

    if (index === -1) {
        if (entity.parent) {
            entity.parent.removeChild(entity);
        }

        children[children.length] = entity;

        entity.parent = _this;
        entity.root = _this.root;

        Entity_updateDepth(entity, _this.depth + 1);

        if ((scene = _this.scene)) {
            scene.addEntity(entity);
        }

        _this.emitArg("addChild", entity);
    } else {
        throw new Error(
            "Entity add(...entities) trying to add object " +
            "that is already a member of Entity"
        );
    }
}

EntityPrototype.removeChild = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Entity_removeChild(this, arguments[i]);
    }
    return this;
};

function Entity_removeChild(_this, entity) {
    var children = _this.children,
        index = indexOf(children, entity);

    if (index !== -1) {
        _this.emitArg("removeChild", entity);

        children.splice(index, 1);

        entity.parent = null;
        entity.root = entity;

        Entity_updateDepth(entity, 0);

        if (entity.scene) {
            entity.scene.remove(entity);
        }
    } else {
        throw new Error(
            "Entity removeChild(...entities) trying to remove " +
            "object that is not a member of Entity"
        );
    }
}

function Entity_updateDepth(child, depth) {
    var children = child.children,
        i = -1,
        il = children.length - 1;

    child.depth = depth;

    while (i++ < il) {
        Entity_updateDepth(children[i], depth + 1);
    }
}

EntityPrototype.toJSON = function(json) {
    var components = this._components,
        children = this.children,
        i = -1,
        il = components.length - 1,
        jsonComponents, jsonChildren;

    json = ClassPrototype.toJSON.call(this, json);

    jsonComponents = json.components || (json.components = []);

    while (i++ < il) {
        jsonComponents[i] = components[i].toJSON(jsonComponents[i]);
    }

    i = -1;
    il = children.length - 1;

    jsonChildren = json.children || (json.children = []);

    while (i++ < il) {
        jsonChildren[i] = children[i].toJSON(jsonChildren[i]);
    }

    json.name = this.name;

    return json;
};

EntityPrototype.fromJSON = function(json) {
    var jsonComponents = json.components,
        jsonChildren = json.children,
        i, il, component, entity;

    ClassPrototype.fromJSON.call(this, json);

    this.name = json.name;

    i = -1;
    il = jsonComponents.length - 1;
    while (i++ < il) {
        json = jsonComponents[i];
        component = Class.newClass(json.className);
        component.fromJSON(json);
        this.addComponent(component);
    }

    i = -1;
    il = jsonChildren.length - 1;
    while (i++ < il) {
        entity = new Entity();
        entity.fromJSON(jsonChildren[i]);
        this.addChild(entity);
    }

    return this;
};