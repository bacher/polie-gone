uniform highp sampler2DShadow u_shadowMapTexture;

float calcShadow(vec3 point) {
    // TODO: If bias is contant then it better to move this transformation
    //       into light transformation matrix
    float bias = 0.01;
    // TODO: Research is it nececary to calculate vary bias?
    // float bias = max(0.05 * (1.0 - dot(v_normal, u_lightDirection)), 0.005);

    point.z -= bias;

    return texture(u_shadowMapTexture, point);
}
