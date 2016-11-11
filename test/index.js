var tape = require("tape"),
    sceneGraph = require("..");


var Scene = sceneGraph.Scene,
    Entity = sceneGraph.Entity,
    Component = sceneGraph.Component,
    Plugin = sceneGraph.Plugin;


tape("scene_graph", function(assert) {
    var scene = Scene.create("Scene"),
        entity = Entity.create("Entity"),
        entity1 = Entity.create("Entity1"),
        entity2 = Entity.create("Entity2"),
        component = Component.create(),
        plugin = Plugin.create();

    entity
        .addComponent(component)
        .addChild(entity1);

    entity1.addChild(entity2);

    var depth = 0;
    assert.equals(entity.depth, depth++);
    entity.forEachChild(function(child /*, index, parent */ ) {
        assert.equals(child.depth, depth++);
    }, true);

    scene.addEntity(entity);
    scene.addPlugin(plugin);

    scene.init();
    scene.update();

    assert.equals(scene.hasEntity(entity), true);
    assert.equals(scene.hasEntityWithName("Entity2"), true);
    assert.equals(scene.hasComponentManager(component.className), true);
    assert.equals(entity.hasComponent(component.className), true);
    assert.equals(scene.hasPlugin(plugin.className), true);

    var newScene = Scene.create().fromJSON(scene.toJSON()),
        newEntity = newScene.getEntityByName("Entity");

    scene.clear();

    assert.equals(newScene.hasEntity(newEntity), true);
    assert.equals(newScene.hasEntityWithName("Entity2"), true);
    assert.equals(newScene.hasComponentManager(component.className), true);
    assert.equals(newEntity.hasComponent(component.className), true);
    assert.equals(newScene.hasPlugin(plugin.className), true);

    newScene.clear();

    assert.end();
});