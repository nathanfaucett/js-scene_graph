var Class = require("@nathanfaucett/class");


var ClassPrototype = Class.prototype,
    PluginPrototype;


module.exports = Plugin;


function Plugin() {

    Class.call(this);

    this.scene = null;
}
Class.extend(Plugin, "scene_graph.Plugin");
PluginPrototype = Plugin.prototype;

PluginPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

PluginPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.scene = null;

    return this;
};

PluginPrototype.init = function init() {
    this.emitArg("init");
    return this;
};

PluginPrototype.clear = function clear(emitEvent) {
    if (emitEvent !== false) {
        this.emitArg("clear");
    }
    return this;
};

PluginPrototype.update = function update() {
    return this;
};

PluginPrototype.destroy = function(emitEvent) {
    var scene = this.scene;

    if (scene) {
        if (emitEvent !== false) {
            this.emit("destroy");
        }
        scene.removePlugin(this);
        this.clear(false);
    }

    return this;
};