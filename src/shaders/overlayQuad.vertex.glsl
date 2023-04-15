#version 300 es

in vec4 a_position;

out vec2 v_texcoord;

void main() {
  v_texcoord = a_position.xy;
  gl_Position = a_position;
}
