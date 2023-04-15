#version 300 es
precision highp float;

uniform sampler2D u_diffuse;
uniform bool u_useOnlyRedChannel;
uniform bool u_invertColor;

in vec2 v_texcoord;

out vec4 outColor;

void main() {
  vec4 texColor = texture(u_diffuse, v_texcoord);

  if(u_invertColor) {
    texColor = vec4(1.0 - texColor.rgb, texColor.a);
  }

  if(u_useOnlyRedChannel) {
    outColor = vec4(texColor.rrr, 1.0);
  } else {
    outColor = texColor;
  }
}
