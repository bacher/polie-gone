#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;

in vec4 a_position;
in vec3 a_normal;
// in vec3 a_uv;

out vec3 v_normal;

void main() {
  v_normal = (u_model * vec4(a_normal, 0.0)).xyz;
  gl_Position = u_projection * u_model * a_position;
}
