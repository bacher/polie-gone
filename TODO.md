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
- [ ] Use layout for shader attributes
- [ ] Use material specular modifier
- [ ] Add possibility to use specular textures
- [ ] Add possibility to use bump textures
- [ ] Add shadows
- [ ] Add fullscreen mode
- [ ] Game should be paused when window lose focus?
      (problem with to big deltas in logic loop)

Optimizations:

- [x] Add out of view render optimization
- [x] Add out of view render optimization base on camera frustum
- [ ] Optimize out of view optimization (use camera's angles)
- [ ] Add dynamic LOD optimization
- [ ] Use fewer joints to skinning
  - [ ] Optimize model (remove unnecessary joint weights)
  - [ ] Adapt shader to know how many joints should be used
  - [ ] Visualize weights distribution
- [ ] Allow change antialias

Refactoring:

- [ ] Look at model features (not on model type) in initVertexBufferObjects
- [ ] Move draw mode (points, lines, triangles) in model data
- [x] Remove cyclic dependencies

Helpers:

- [x] Add easy way to display debug objects as overlay on same canvas

Bugs:

- [x] Fix camera position and orientation
- [x] Fix bounding sphere size, r = (maxSide/2) \* sqrt(2)
