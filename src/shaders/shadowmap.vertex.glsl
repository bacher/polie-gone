#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;

in vec4 a_position;

void main() {
  gl_Position = u_projection * u_model * a_position;
}
