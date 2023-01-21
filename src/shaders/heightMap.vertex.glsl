#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;
uniform sampler2D u_heightMap;

in vec4 a_position;

out vec3 v_normal;
out vec2 v_texcoord;

void main() {
  v_normal = (u_model * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
  v_texcoord = a_position.xy;
  float height = texture(u_heightMap, v_texcoord).r - 0.5;
  gl_Position = u_projection * u_model * vec4(a_position.x - 0.5, height, a_position.y - 0.5, 1.0);
}
