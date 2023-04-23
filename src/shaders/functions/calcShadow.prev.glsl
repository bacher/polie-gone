uniform sampler2D u_shadowMapTexture;

float calcShadow(vec3 point) {
    if (point.s < 0.0 || point.s > 1.0 ||
        point.t < 0.0 || point.t > 1.0) {
        return 1.0;
    }

    float bias = 0.01;
    // TODO: Research is it nececary to calculate vary bias?
    // float bias = max(0.05 * (1.0 - dot(v_normal, u_lightDirection)), 0.005);

    float currentDepth = point.z - bias;

    float closestDepth = texture(u_shadowMapTexture, point.st).r;

    // float closestDepth1 = texture(shadowMapTexture, point.st + vec2(0.000, -0.0017)).r;
    // float closestDepth2 = texture(shadowMapTexture, point.st + vec2(-0.001, 0.001)).r;
    // float closestDepth3 = texture(shadowMapTexture, point.st + vec2(0.001, 0.001)).r;

    // return (currentDepth > closestDepth ? 0.25 : 0.0) +
    //   (currentDepth > closestDepth1 ? 0.25 : 0.0) +
    //   (currentDepth > closestDepth2 ? 0.25 : 0.0) +
    //   (currentDepth > closestDepth3 ? 0.25 : 0.0);

    if (closestDepth >= 1.0) {
        return 1.0;
    }

    return currentDepth > closestDepth ? 0.0 : 1.0;

    // return closestDepth;
    // return currentDepth * 12.0 - 0.7; // for debugging (display depth on model);

    /*
    // PCF Algorithm for soft shadows
    float shadow = 0.0;
    vec2 texelSize = 1.0 / vec2(textureSize(shadowMapTexture, 0)); // here could divide by 0.5 for more detailed shadows
    for (int x = -1; x <= 1; ++x) {
        for (int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(shadowMapTexture, point.st + vec2(x, y) * texelSize).r;
            shadow += currentDepth > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;

    return shadow;
    */
}
