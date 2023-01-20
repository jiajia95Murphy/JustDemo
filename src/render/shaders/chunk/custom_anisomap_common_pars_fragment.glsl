#ifdef USE_ANISOTROPY
    uniform float anisoIntensity;
	uniform float anisoFactor;

	#ifdef USE_ANISOMAP
		uniform sampler2D anisoMap;
	#endif
	
#endif