import computeDiffuseSPH from './chunk/function/computeDiffuseSPH.glsl?raw';
import integrateBRDFMobile from './chunk/function/integrateBRDFMobile.glsl?raw';
import panoramaSampler from './chunk/function/panoramaSampler.glsl?raw';
import precomputeLight from './chunk/function/precomputeLight.glsl?raw';
import isotropyLightCompute from './chunk/function/isotropyLightCompute.glsl?raw';
import anisotropyLightCompute from './chunk/function/anisotropyLightCompute.glsl?raw';

import math from './chunk/math.glsl?raw';
import shadow from './chunk/shadow.glsl?raw';
import light from './chunk/light.glsl?raw';
import brdf from './chunk/brdf.glsl?raw';
import ibl from './chunk/ibl.glsl?raw';
import clearCoat from './chunk/clearCoat.glsl?raw';
import advance from './chunk/advance.glsl?raw';

export default {
	computeDiffuseSPH,
	integrateBRDFMobile,
	panoramaSampler,
    precomputeLight,
	isotropyLightCompute,
	anisotropyLightCompute,

	math,
	shadow,
	light,
	brdf,
	ibl,
	clearCoat,
	advance
};
