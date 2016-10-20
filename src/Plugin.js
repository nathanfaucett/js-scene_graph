var Class = require("@nathanfaucett/class");


var PluginPrototype;


module.exports = Plugin;


function Plugin() {

    Class.call(this);

    this.scene = null;
}
Class.extend(Plugin, "scene_graph.Plugin");
PluginPrototype = Plugin.prototype;

PluginPrototype.init = function init() {
    this.emit("init");
    return this;
};

PluginPrototype.awake = function awake() {
    this.emit("awake");
    return this;
};

PluginPrototype.clear = function clear(emitEvent) {
    if (emitEvent !== false) {
        this.emit("clear");
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