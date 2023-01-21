
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )

		iblIrradiance += getIBLIrradiance( geometry.normal );

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

    vec3 iblN = geometry.normal;
	float iblRoughness = material.roughness;
	#if defined(USE_ANISOTROPY)
		ModifyGGXAnisotropicNormalRoughness(geometry.tangent, geometry.normal, anisoIntensity, geometry.viewDir, iblRoughness, iblN);
	#endif
	radiance += getIBLRadiance( geometry.viewDir, iblN, iblRoughness );

	#ifdef USE_CLEARCOAT

		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );

	#endif

#endif