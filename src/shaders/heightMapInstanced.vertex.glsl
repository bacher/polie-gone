#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;
uniform sampler2D u_heightMap;
uniform vec2 u_cellSize;
uniform mat4 u_lightSpace;

in vec2 a_position;
in vec2 a_offset;

out vec3 v_normal;
out vec2 v_texcoord;
out vec3 v_posInLightSpace;

void main() {
  vec2 position = a_position * u_cellSize + a_offset;

  v_normal = (u_model * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
  v_texcoord = position;
  float height = texture(u_heightMap, v_texcoord).r - 0.5;

  vec4 pos = u_model * vec4(position.x - 0.5, height, position.y - 0.5, 1.0);

  v_posInLightSpace = (u_lightSpace * pos).xyz;

  gl_Position = u_projection * pos;
}
