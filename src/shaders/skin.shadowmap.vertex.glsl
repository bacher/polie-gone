#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_jointMatrices[20];

in vec4 a_position;
in uvec4 a_joints;

void main() {
  // Using only first joint (assume first joint is most valuable)
  // Or maybe it will be better to use 2 first joints
  mat4 skinMatrix = u_jointMatrices[a_joints.x];

  mat4 model = u_model * skinMatrix;

  gl_Position = u_projection * model * a_position;
}
