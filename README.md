scene_graph [![Build Status](https://travis-ci.org/nathanfaucett/js-scene_graph.svg?branch=master)](https://travis-ci.org/nathanfaucett/js-scene_graph)
======

entity component scene graph

```javascript
var sceneGraph = require("@nathanfaucett/scene_graph");


var Scene = sceneGraph.Scene,
    Entity = sceneGraph.Entity;


var scene = Scene.create(),
    entity = Entity.create();


scene.addEntity(entity);
```
