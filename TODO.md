# TODO

- [x] Add depth test
- [x] Decouple creation of buffers and vao objects
- [x] Add model skin
- [x] Use uint for joint attribute
- [x] Make dynamic scene
- [x] Add several game objects
- [x] Split shaders (regular and with skinning)
- [x] Support texturing
- [x] Add texture based plains (height map)
- [ ] Add procedural terrains
- [ ] Mix procedural terrains with height map textures
- [x] Add free-look camera (capture mouse)
- [ ] Add mouse-drag camera (drag to look)
- [x] Make starting and ending of moving smooth
- [ ] Spawn and destroy objects in time
- [ ] Add simple physics engine
- [x] Add animations
- [ ] Add animation interpolation
- [ ] Add smooth animation transition
- [ ] Use layout for shader attributes
- [ ] Use material specular modifier (look at https://github.com/tparisi/webgl-lessons/tree/master/lesson15)
- [ ] Add possibility to use specular textures
- [ ] Add possibility to use bump textures
- [x] Add shadows
- [ ] Add fullscreen mode
- [ ] Game should be paused when window lose focus?
      (problem with to big deltas in logic loop)
- [ ] Add cube textures for Skyboxes
- [ ] Add depth texture sampling
- [ ] Add bump texture sampling
- [ ] Add cubemaps support

Optimizations:

- [x] Add out of view render optimization
- [x] Add out of view render optimization base on camera frustum
- [x] Optimize out of view optimization (use camera's angles)
- [ ] Add dynamic LOD optimization
- [ ] Use fewer joints to skinning
  - [ ] Optimize model (remove unnecessary joint weights)
  - [ ] Adapt shader to know how many joints should be used
  - [ ] Visualize weights distribution
- [ ] Allow change antialias
- [ ] Use less detailed model for shadow map generating
- [ ] Sort objects to reduce fragment shader work
- [ ] Try calculate MVP matrix before shader run
- [ ] Check that I don't use some extensive blend-mode by default
- [ ] Load texture mipmaps separately (load hi-res textures only on-demand)
      http://tomforsyth1000.github.io/blog.wiki.html#%5B%5BKnowing%20which%20mipmap%20levels%20are%20needed%5D%5D
- [ ] Use splitted gl-matrix version https://github.com/stackgl/gl-mat4
- [ ] Hardcore frustum culling optimizations: https://fgiesen.wordpress.com/2010/10/17/view-frustum-culling/

Refactoring:

- [ ] Look at model features (not on model type) in initVertexBufferObjects
- [ ] Move draw mode (points, lines, triangles) in model data
- [x] Remove cyclic dependencies

Helpers:

- [x] Add easy way to display debug objects as overlay on same canvas

Bugs:

- [x] Fix camera position and orientation
- [x] Fix bounding sphere size, r = (maxSide/2) \* sqrt(2)

Ideas:

- [ ] Add mechanism for matrix frustrum capturing and dysplaying as wireframe
- [ ] Add logic for tweaking intermideate matrices (after model, after world, after view, after perspective transformation applying)
- [ ] Display world via perspective matrix
- [ ] Idea for menu - add animation where active game screen is moving away like a display in real life and showing menu items as items in this workd, after resuming camera is moving up and start to display same world as before menu was activated.
- [ ] The menu room is adapting to age/epoch in current game. For example in stone age we have room in a rock.
