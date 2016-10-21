var tape = require("tape"),
    sg = require("..");


tape("scene_graph", function(assert) {
    var scene = sg.Scene.create("Scene"),
        entity = sg.Entity.create("Entity"),
        entity1 = sg.Entity.create("Entity1"),
        entity2 = sg.Entity.create("Entity2"),
        component = sg.Component.create(),
        plugin = sg.Plugin.create();

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

    var newScene = new sg.Scene().fromJSON(scene.toJSON()),
        newEntity = newScene.getEntityByName("Entity");

    scene.clear();

    assert.equals(newScene.hasEntity(newEntity), true);
    assert.equals(newScene.hasEntityWithName("Entity2"), true);
    assert.equals(newScene.hasComponentManager(component.className), true);
    assert.equals(newEntity.hasComponent(component.className), true);
    assert.equals(newScene.hasPlugin(plugin.className), true);

    assert.end();
});