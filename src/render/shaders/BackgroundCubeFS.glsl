#define ENVMAP_TYPE_CUBE_UV

varying vec3 vWorldDirection;
uniform sampler2D envMap;
uniform float envMapRotate;

uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
#include <cube_uv_reflection_fragment>

void main() {
    mat3 rotYMatrix = mat3(cos(envMapRotate), 0, sin(envMapRotate), 0, 1, 0, -sin(envMapRotate), 0, cos(envMapRotate));
    vec3 newDirection = rotYMatrix * vWorldDirection;
    vec4 texColor = textureCubeUV( envMap, newDirection, backgroundBlurriness );

    texColor.rgb *= backgroundIntensity;

    gl_FragColor = texColor;

    #include <tonemapping_fragment>
    #include <encodings_fragment>

}