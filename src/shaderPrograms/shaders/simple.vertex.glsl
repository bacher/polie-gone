#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;

in vec4 a_position;
in vec3 a_normal;
out vec3 v_normal;

void main() {
  v_normal = a_normal;
  gl_Position = u_projection * u_model * a_position;
}
