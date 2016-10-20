var Class = require("@nathanfaucett/class"),
    ComponentManager = require("./ComponentManager");


var ClassPrototype = Class.prototype,
    ComponentPrototype;


module.exports = Component;


function Component() {

    Class.call(this);

    this.manager = null;
    this.entity = null;
}

Component.onExtend = function(child, className, manager) {
    manager = manager || ComponentManager;

    child.ComponentManager = child.prototype.ComponentManager = manager;
    manager.prototype.className = child.className;
};

Class.extend(Component, "scene_graph.Component");
ComponentPrototype = Component.prototype;

Component.className = ComponentPrototype.className = "scene_graph.Component";
Component.ComponentManager = ComponentPrototype.ComponentManager = ComponentManager;

ComponentPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

ComponentPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.manager = null;
    this.entity = null;

    return this;
};

ComponentPrototype.init = function() {
    this.emit("init");
    return this;
};

ComponentPrototype.awake = function() {
    this.emit("awake");
    return this;
};

ComponentPrototype.clear = function(emitEvent) {
    if (emitEvent !== false) {
        this.emit("clear");
    }
    return this;
};

ComponentPrototype.update = function() {
    return this;
};

ComponentPrototype.destroy = function(emitEvent) {
    var entity = this.entity;

    if (entity) {
        if (emitEvent !== false) {
            this.emit("destroy");
        }
        entity.removeComponent(this);
        this.clear(false);
    }

    return this;
};