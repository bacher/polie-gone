#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_jointMatrices[12];

in vec4 a_position;
in vec3 a_normal;
in vec3 a_uv;
in vec4 a_joints;
in vec4 a_weights;

out vec3 v_normal;

void main() {
  mat4 skinMatrix =
  a_weights.x * u_jointMatrices[int(a_joints.x)] +
  a_weights.y * u_jointMatrices[int(a_joints.y)] +
  a_weights.z * u_jointMatrices[int(a_joints.z)] +
  a_weights.w * u_jointMatrices[int(a_joints.w)];

  v_normal = a_normal;
  gl_Position = u_projection * u_model * skinMatrix * a_position;
  //  gl_Position = u_projection * u_model * a_position;
}
