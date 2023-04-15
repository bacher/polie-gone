#version 300 es
precision highp float;

uniform vec3 u_lightDirection;
uniform sampler2D u_diffuse;
uniform sampler2D u_shadowMapTexture;

in vec3 v_normal;
in vec2 v_texcoord;
in vec4 v_posInLightSpace;

out vec4 outColor;

float calcShadow(vec4 fragPosLightSpace) {
  // perform perspective divide
  vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
  // transform to [0,1] range
  projCoords = projCoords * 0.5 + 0.5;
  // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
  float closestDepth = texture(u_shadowMapTexture, projCoords.xy).r;
  // get depth of current fragment from light's perspective
  float currentDepth = projCoords.z;
  // check whether current frag pos is in shadow
  return currentDepth > closestDepth + 0.01 ? 1.0 : 0.0;

  // return closestDepth;
  // return currentDepth * 12.0 - 0.7; // for debugging (display depth on model);
}

void main() {
  vec4 baseColor = texture(u_diffuse, v_texcoord);

  float lightFactor = max(dot(normalize(v_normal), u_lightDirection), 0.0);
  float shadowFactor = calcShadow(v_posInLightSpace);

  // Show shadow in red
  // outColor = vec4(shadowFactor, 0.0, 0.0, 1.0);

  outColor = vec4(baseColor * (0.5 + lightFactor * 0.5 * (1.0 - shadowFactor)));

  // Old solid light
  //  outColor = vec4(vec3(0.4 + (lightFactor * 0.4)), 1.0);
}