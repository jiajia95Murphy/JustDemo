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

import custom_anisomap_common_pars_fragment from './chunk/custom_anisomap_common_pars_fragment.glsl?raw';
import custom_bsdfs from './chunk/custom_bsdfs.glsl?raw';
import custom_common from './chunk/custom_common.glsl?raw';
import custom_envmap_common_pars_fragment from './chunk/custom_envmap_common_pars_fragment.glsl?raw';
import custom_envmap_physical_pars_fragment from './chunk/custom_envmap_physical_pars_fragment.glsl?raw';
import custom_lights_fragment_begin from './chunk/custom_lights_fragment_begin.glsl?raw';
import custom_lights_fragment_maps from './chunk/custom_lights_fragment_maps.glsl?raw';
import custom_lights_physical_pars_fragment from './chunk/custom_lights_physical_pars_fragment.glsl?raw';
import custom_normal_fragment_begin from './chunk/custom_normal_fragment_begin.glsl?raw';

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
	advance,

	custom_anisomap_common_pars_fragment,
	custom_bsdfs,
	custom_common,
	custom_lights_fragment_begin,
	custom_lights_fragment_maps,
	custom_envmap_common_pars_fragment,
	custom_envmap_physical_pars_fragment,
	custom_lights_physical_pars_fragment,
	custom_normal_fragment_begin
};
