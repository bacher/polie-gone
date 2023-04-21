float calcShadow(sampler2D shadowMapTexture, vec3 point) {
    // transform to [0,1] range
    point = point * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)

    if (point.s < 0.0 || point.s > 1.0 ||
        point.t < 0.0 || point.t > 1.0) {
        return 0.0;
    }

    // get depth of current fragment from light's perspective
    float currentDepth = point.z - 0.01;

    float closestDepth = texture(shadowMapTexture, point.st).r;
    // float closestDepth1 = texture(shadowMapTexture, point.st + vec2(0.000, -0.0017)).r;
    // float closestDepth2 = texture(shadowMapTexture, point.st + vec2(-0.001, 0.001)).r;
    // float closestDepth3 = texture(shadowMapTexture, point.st + vec2(0.001, 0.001)).r;

    // return (currentDepth > closestDepth ? 0.25 : 0.0) +
    //   (currentDepth > closestDepth1 ? 0.25 : 0.0) +
    //   (currentDepth > closestDepth2 ? 0.25 : 0.0) +
    //   (currentDepth > closestDepth3 ? 0.25 : 0.0);

    return (closestDepth < 1.0 && currentDepth > closestDepth) ? 1.0 : 0.0;

    // return closestDepth;
    // return currentDepth * 12.0 - 0.7; // for debugging (display depth on model);
}
