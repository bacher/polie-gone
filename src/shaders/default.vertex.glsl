#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec3 v_normal;
out vec2 v_texcoord;

void main() {
  v_normal = (u_model * vec4(a_normal, 0.0)).xyz;
  v_texcoord = a_texcoord;
  gl_Position = u_projection * u_model * a_position;
}
