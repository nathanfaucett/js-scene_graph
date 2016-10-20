var indexOf = require("@nathanfaucett/index_of"),
    Class = require("@nathanfaucett/class"),
    isNullOrUndefined = require("@nathanfaucett/is_null_or_undefined");


var ClassPrototype = Class.prototype,
    ComponentManagerPrototype;


module.exports = ComponentManager;


function ComponentManager() {

    Class.call(this);

    this.scene = null;
    this._components = [];
}

ComponentManager.onExtend = function(child, className, order) {
    child.order = child.prototype.order = isNullOrUndefined(order) ? 0 : order;
};

Class.extend(ComponentManager, "scene_graph.ComponentManager");
ComponentManagerPrototype = ComponentManager.prototype;

ComponentManager.order = ComponentManagerPrototype.order = 0;

ComponentManagerPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

ComponentManagerPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.scene = null;
    this._components.length = 0;

    return this;
};

ComponentManagerPrototype.onAddToScene = function() {
    return this;
};

ComponentManagerPrototype.onRemoveFromScene = function() {
    return this;
};

ComponentManagerPrototype.isEmpty = function() {
    return this._components.length === 0;
};

ComponentManagerPrototype.sort = function() {
    this._components.sort(this.sortFunction);
    return this;
};

ComponentManagerPrototype.sortFunction = function() {
    return 0;
};

ComponentManagerPrototype.init = function() {
    var components = this._components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        components[i].init();
    }

    return this;
};

ComponentManagerPrototype.awake = function() {
    var components = this._components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        components[i].awake();
    }

    return this;
};

ComponentManagerPrototype.update = function() {
    var components = this._components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        components[i].update();
    }

    return this;
};

ComponentManagerPrototype.forEach = function(fn) {
    var components = this._components,
        i = -1,
        il = components.length - 1;

    while (i++ < il) {
        if (fn(components[i], i) === false) {
            return false;
        }
    }

    return true;
};

ComponentManagerPrototype.hasComponent = function(component) {
    return indexOf(this._components, component) !== -1;
};

ComponentManagerPrototype.addComponent = function(component) {
    var components = this._components,
        index = indexOf(components, component);

    if (index === -1) {
        components[components.length] = component;
    }

    return this;
};

ComponentManagerPrototype.removeComponent = function(component) {
    var components = this._components,
        index = indexOf(components, component);

    if (index !== -1) {
        components.splice(index, 1);
    }

    return this;
};