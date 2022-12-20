// IBL
#preImport <precomputeLight>
#preImport <computeDiffuseSPH>

#ifdef PANORAMA
    #preImport <panoramaSampler>
#endif

vec3 integrateBRDF(vec3 materialSpecular, float roughness, float NoV) {
    vec4 rgba = texture2D(uIntegrateBRDF, vec2(NoV, roughness));
    float a = (rgba[1] * 65280.0 + rgba[0] * 255.0) / 65535.0;
    float b = (rgba[3] * 65280.0 + rgba[2] * 255.0) / 65535.0;
    return (1.-materialSpecular) * a + materialSpecular * b;
}

// frostbite, lagarde paper p67
// http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
float linRoughnessToMipmap(float roughnessLinear){
    return sqrt(roughnessLinear);
}

vec3 prefilterEnvMap(float rLinear, vec3 R) {
    vec3 dir = R;
    float lod = linRoughnessToMipmap(rLinear) * uEnvironmentLodRange[1]; //(uEnvironmentMaxLod - 1.0);
    lod = min(uEnvironmentLodRange[0], lod);
#ifdef CUBEMAP_LOD
    // http://seblagarde.wordpress.com/2012/06/10/amd-cubemapgen-for-physically-based-rendering/
    float scale = 1.0 - exp2(lod) / uEnvironmentSize[0];
    vec3 absDir = abs(dir);
    float M = max(max(absDir.x, absDir.y), absDir.z);
    // cubemapSeamlessFixDirection
    if (absDir.x != M) dir.x *= scale;
    if (absDir.y != M) dir.y *= scale;
    if (absDir.z != M) dir.z *= scale;
	//return LogLuvToLinear(textureCubeLodEXT(envMap, dir, lod)).rgb;
    return vec3(0, 0, 0);
#else
    //return LogLuvToLinear(texturePanoramaLod(envMap, uEnvironmentSize, R, lod, uEnvironmentLodRange[0])).rgb;
	return vec3(0, 0, 0);
    #endif
}

// Anisotropic
#if defined(USE_TANGENT) && defined(ENABLE_ANISOTROPY)
vec3 computeAnisotropicBentNormal(vec3 normal, vec3 viewDir, float roughness, vec3 anisotropicT, vec3 anisotropicB, float anisotropy) {
    vec3 anisotropyDirection = anisotropy >= 0.0 ? anisotropicB : anisotropicT;
    vec3 anisotropicTangent = cross(anisotropyDirection, viewDir);
    vec3 anisotropicNormal = cross(anisotropicTangent, anisotropyDirection);
    float bendFactor = abs(anisotropy) * clamp(5.0 * roughness, 0.0, 1.0);
    vec3  bentNormal = normalize(mix(normal, anisotropicNormal, bendFactor));
    return bentNormal;
}
#endif

// From Sebastien Lagarde Moving Frostbite to PBR page 69
// We have a better approximation of the off specular peak
// but due to the other approximations we found this one performs better.
// N is the normal direction
// R is the mirror vector
// This approximation works fine for G smith correlated and uncorrelated
vec3 getSpecularDominantDir(vec3 N, vec3 R, float realRoughness) {
    float smoothness = 1.0 - realRoughness;
    float lerpFactor = smoothness * (sqrt(smoothness) + realRoughness);
    return mix(N, R, lerpFactor);
}

vec3 getPrefilteredEnvMapColor(vec3 normal, vec3 viewDir, float roughness) {
    vec3 R = reflect(-viewDir, normal);
    // From Sebastien Lagarde Moving Frostbite to PBR page 69
    vec3 dominantR = getSpecularDominantDir(normal, R, roughness * roughness);
    vec3 dir = uEnvironmentTransform * dominantR;
    vec3 prefilteredColor = prefilterEnvMap(roughness, dir);
    return prefilteredColor;
}

vec3 computeIBLSpecularUE4(vec3 specularDFG, vec3 normal, vec3 viewDir, float roughness) {
    return getPrefilteredEnvMapColor(normal, viewDir, roughness) * specularDFG;
    //return vec3(0, 0, 0);
}
// Add from gltf-sampler-view
 float getFace( vec3 direction ) {
  vec3 absDirection = abs( direction );
  float face = - 1.0;
  if ( absDirection.x > absDirection.z ) {
   if ( absDirection.x > absDirection.y )
    face = direction.x > 0.0 ? 0.0 : 3.0;
   else
    face = direction.y > 0.0 ? 1.0 : 4.0;
  } else {
   if ( absDirection.z > absDirection.y )
    face = direction.z > 0.0 ? 2.0 : 5.0;
   else
    face = direction.y > 0.0 ? 1.0 : 4.0;
  }
  return face;
 }
 vec2 getUV( vec3 direction, float face ) {
  vec2 uv;
  if ( face == 0.0 ) {
   uv = vec2( direction.z, direction.y ) / abs( direction.x );
  } else if ( face == 1.0 ) {
   uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
  } else if ( face == 2.0 ) {
   uv = vec2( - direction.x, direction.y ) / abs( direction.z );
  } else if ( face == 3.0 ) {
   uv = vec2( - direction.z, direction.y ) / abs( direction.x );
  } else if ( face == 4.0 ) {
   uv = vec2( - direction.x, direction.z ) / abs( direction.y );
  } else {
   uv = vec2( direction.x, direction.y ) / abs( direction.z );
  }
  return 0.5 * ( uv + 1.0 );
 }
vec4 getSpecularSample(vec3 reflection, float lod)
{
    return textureLod(envMap, reflection, lod);
}

vec3 getIBLRadianceGGX(vec3 n, vec3 v, float roughness, vec3 F0, float specularWeight)
{
    float NdotV = clampedDot(n, v);
    float lod = 0.0;//roughness * float(u_MipCount - 1);
    vec3 reflection = normalize(reflect(-v, n));

    vec2 brdfSamplePoint = clamp(vec2(NdotV, roughness), vec2(0.0, 0.0), vec2(1.0, 1.0));
    //vec2 f_ab = texture(envMap, brdfSamplePoint).rg;
    vec4 specularSample = getSpecularSample(reflection, lod);

    vec3 specularLight = specularSample.rgb;

    // see https://bruop.github.io/ibl/#single_scattering_results at Single Scattering Results
    // Roughness dependent fresnel, from Fdez-Aguera
    vec3 Fr = max(vec3(1.0 - roughness), F0) - F0;
    vec3 k_S = F0 + Fr * pow(1.0 - NdotV, 5.0);
    vec3 FssEss = k_S;// * f_ab.x + f_ab.y;

    return specularWeight * specularLight * FssEss;
}

vec3 getIBLRadianceLambertian(vec3 n, vec3 v, float roughness, vec3 diffuseColor, vec3 F0, float specularWeight)
{
    float NdotV = clampedDot(n, v);
    vec2 brdfSamplePoint = clamp(vec2(NdotV, roughness), vec2(0.0, 0.0), vec2(1.0, 1.0));
    //vec2 f_ab = texture(envMap, brdfSamplePoint).rg;

    vec3 irradiance = getDiffuseLight(n);

    // see https://bruop.github.io/ibl/#single_scattering_results at Single Scattering Results
    // Roughness dependent fresnel, from Fdez-Aguera

    vec3 Fr = max(vec3(1.0 - roughness), F0) - F0;
    vec3 k_S = F0 + Fr * pow(1.0 - NdotV, 5.0);
    vec3 FssEss = specularWeight * k_S ;//* f_ab.x + f_ab.y; // <--- GGX / specular light contribution (scale it down if the specularWeight is low)

    // Multiple scattering, from Fdez-Aguera
    float Ems = (1.0 - (f_ab.x + f_ab.y));
    vec3 F_avg = specularWeight * (F0 + (1.0 - F0) / 21.0);
    vec3 FmsEms = Ems * FssEss * F_avg / (1.0 - F_avg * Ems);
    vec3 k_D = diffuseColor * (1.0 - FssEss + FmsEms); // we use +FmsEms as indicated by the formula in the blog post (might be a typo in the implementation)

    return (FmsEms + k_D) * irradiance;
}