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
  // TODO: It's error to multiply on model matrix,
  //       we should only rotate.
  v_normal = (u_model * vec4(a_normal, 0.0)).xyz;

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
