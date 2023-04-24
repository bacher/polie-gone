#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_jointMatrices[20];
uniform mat4 u_lightSpace;

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;
in uvec4 a_joints;
in vec4 a_weights;

out vec3 v_normal;
out vec2 v_texcoord;
out vec3 v_posInLightSpace;

void main() {
  mat4 skinMatrix = a_weights.x * u_jointMatrices[a_joints.x] +
    a_weights.y * u_jointMatrices[a_joints.y] +
    a_weights.z * u_jointMatrices[a_joints.z] +
    a_weights.w * u_jointMatrices[a_joints.w];

  // Disable skin
  // skinMatrix = mat4(1);

  mat4 model = u_model * skinMatrix;

  vec4 pos = model * a_position;

  v_normal = (model * vec4(a_normal, 0.0)).xyz;
  v_texcoord = a_texcoord;
  v_posInLightSpace = (u_lightSpace * pos).xyz;
  gl_Position = u_projection * pos;
}
