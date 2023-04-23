uniform highp sampler2DShadow u_shadowMapTexture;

vec2 poissonDisk[4] = vec2[](vec2(-0.94201624, -0.39906216), vec2(0.94558609, -0.76890725), vec2(-0.094184101, -0.92938870), vec2(0.34495938, 0.29387760));

vec2 poissonDisk16[16] = vec2[](vec2(-0.94201624, -0.39906216), vec2(0.94558609, -0.76890725), vec2(-0.094184101, -0.92938870), vec2(0.34495938, 0.29387760), vec2(-0.91588581, 0.45771432), vec2(-0.81544232, -0.87912464), vec2(-0.38277543, 0.27676845), vec2(0.97484398, 0.75648379), vec2(0.44323325, -0.97511554), vec2(0.53742981, -0.47373420), vec2(-0.26496911, -0.41893023), vec2(0.79197514, 0.19090188), vec2(-0.24188840, 0.99706507), vec2(-0.81409955, 0.91437590), vec2(0.19984126, 0.78641367), vec2(0.14383161, -0.14100790));

float pseudoRandom(vec4 seed4) {
    float dot_product = dot(seed4, vec4(12.9898, 78.233, 45.164, 94.673));
    return fract(sin(dot_product) * 43758.5453);
}

float calcShadow(vec3 point) {
    // TODO: If bias is contant then it better to move this transformation
    //       into light transformation matrix
    float bias = 0.01;
    // TODO: Research is it nececary to calculate vary bias?
    // float bias = max(0.05 * (1.0 - dot(v_normal, u_lightDirection)), 0.005);

    point.z -= bias;

    float visibility = 1.0;

    int samplesCount = 3;

    for (int i = 0; i < samplesCount; ++i) {
        int index = int(float(samplesCount) * pseudoRandom(vec4(gl_FragCoord.xyy, i))) % samplesCount;
        // int index = i;
        if (texture(u_shadowMapTexture, point + vec3(poissonDisk16[index] / 1024.0, 0.0)) == 0.0) {
            visibility -= 1.0 / float(samplesCount);
        }
    }

    return visibility;
}
