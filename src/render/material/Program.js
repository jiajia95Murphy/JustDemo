import ShaderChunk from '../shaders/ShaderChunk';

export default class Program {
	constructor(vertexShader, fragmentShader) {
		this.includePattern = /^[ \t]*#preImport +<([\w\d./]+)>/gm;
		this.customVS = vertexShader;
		this.customFS = fragmentShader;
	}

	getPBRShader() {
		let vs = this.preParseShader(this.customVS);
		let fs = this.preParseShader(this.customFS);
		return {
			vs,
			fs
		};
	}
	
	preParseShader(string) {
		let includeReplacer = (match, include) => {
			let string = ShaderChunk[include];
			if (string === undefined) {
				throw new Error('Can not resolve #preImport <' + include + '>');
			}
			return this.preParseShader(string);
		};
		return string?.replace(this.includePattern, includeReplacer);
	}
}
