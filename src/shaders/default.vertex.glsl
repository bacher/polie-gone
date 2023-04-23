#version 300 es
uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_lightSpace;

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec3 v_normal;
out vec2 v_texcoord;
out vec3 v_posInLightSpace;

void main() {
  // v_normal = (u_model * vec4(a_normal, 0.0)).xyz;
  // TODO: or
  v_normal = mat3(u_model) * a_normal;
  // or if we have non uniform scale
  // v_normal = transpose(inverse(mat3(u_model))) * a_normal;

  vec4 pos = u_model * a_position;

  v_texcoord = a_texcoord;

  vec4 posInLightSpace = u_lightSpace * pos;

  // Use this line for point lights
  // v_posInLightSpace = posInLightSpace.xyz / posInLightSpace.w;
  v_posInLightSpace = posInLightSpace.xyz;

  // TODO: Should we use vec4(a_position, 1.0) instead?
  gl_Position = u_projection * pos;
  // gl_Position = u_lightSpace * pos;
}
