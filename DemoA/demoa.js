
var cubeRotation = 0.0;
window.onload = function(){
	main();
};


function main(){
	drawTrimap();
	drawHgtmap();
}


function drawHgtmap(){
	var hmpCanvas = document.getElementById("hmpCanvas");
	var hmpCtx = hmpCanvas.getContext("2d");
	var hmpImg = new Image;
	hmpImg.onload = function(){
		hmpCtx.drawImage(hmpImg,0,0);
	};
	hmpImg.src = "../Images/hmp_placeholder.jpg";
}

function drawTrimap(){

	// Vertex shader
	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec4 aVertexColor;

		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;

		varying lowp vec4 vColor;

		void main(){
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vColor = aVertexColor;
		}
	`;

	// Frag shader
	const fsSource = `
		varying lowp vec4 vColor;

		void main() {
			gl_FragColor = vColor;
		}
	`;

	const positions = [
		// front
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,	

		// back
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,	

		// top
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// bottom
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		// right
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// left
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,

	];

	const faceColors = [
		[1.0, 1.0, 1.0, 1.0], // white
		[1.0, 0.0, 0.0, 1.0], // red
		[0.0, 1.0, 0.0, 1.0], // green
		[0.0, 0.0, 1.0, 1.0], // blue
		[1.0, 1.0, 0.0, 1.0], // yellow
		[1.0, 0.0, 1.0, 1.0], // purple
	];

	var colors = [];

	for (var j =0; j < faceColors.length; ++j){
		const c = faceColors[j];

		// repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
	}

	const indices = [
		0, 1, 2,		0, 2, 3,	// front
		4, 5, 6,		4, 6, 7,	// back
		8, 9, 10,		8, 10, 11,	// top
		12, 13, 14,		12, 14, 15, // bottom
		16, 17, 18,		16, 18, 19,	// right
		20, 21, 22,		20, 22, 23,	// left
	];

	
	var triCanvas = document.getElementById("triCanvas");
	var gl = triCanvas.getContext("webgl");
	if (!gl) {
		alert("WebGL failed to initialize");
		return;
	}

	const texture = loadTexture(gl, '../Images/cube_cat.png');

	shaderProgram = initShaderProgram(gl, vsSource, fsSource);
	// info needed for shader program, look up which attribute our shader program is using for
	// avertexposition and look up uniform locations

	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		},
	};
    
	const buffers = initBuffers(gl, positions, colors, indices);

	var then = 0;

	// draw the scene repeatedly
	function render(now) {
		now *= 0.001;	// convert to seconds
		const deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, buffers, deltaTime);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

function drawScene(gl, programInfo, buffers, deltaTime){
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // black, opaque
	gl.clearDepth(1.0);// clear everything
	gl.enable(gl.DEPTH_TEST);// enable depth testing
	gl.depthFunc(gl.LEQUAL);// near things obscure far things
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// clear color buffer with clear color
	
	// create perspective matrix to simulate perspective
	// fov 45, width/height ratio of canvas, only want to see things between 0.1 and 100 units away
	const fieldOfView = 45 * Math.PI / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	
	const projectionMatrix = mat4.create();
	
	mat4.perspective(projectionMatrix,
					fieldOfView,
					aspect,
					zNear,
					zFar);
	
	// set drawing position to the identity point, which is the center of the scene
	const modelViewMatrix = mat4.create();
	
	// now move the drawing position a bit to where we want to start drawing the square
	mat4.translate(modelViewMatrix, // destination
					modelViewMatrix, // matrix to translate
					[-0.0, 0.0, -6.0]); // amount to translate

	mat4.rotate(modelViewMatrix,	// destination
				modelViewMatrix,	// matrix to translate
				cubeRotation,		// amount to rotate
				[0, 0, 1]);			// axis to rotate around

	mat4.rotate(modelViewMatrix,
				modelViewMatrix,
				cubeRotation * 0.7,
				[0, 1, 0]);

	// tell webgl how to pull out the positions from the position buffer
	// into the vertexposition attribte
	
	{
		const numComponents = 3; // 3 values per iteration
		const type = gl.FLOAT;	// data type in buffer
		const normalize = false; 
		const stride = 0;	// how many bytes to get from one set of values to the next
							// 0 = use type and numcomponents above
		const offset = 0;	// how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.vertexPosition);
	}

	// tell webgl how to pull out the coors from the color buffer
	// into the vertexcolor attribute
	{
		const numComponents = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.vertexColor);
	}

	// tell webgl to use our program when drawing
	gl.useProgram(programInfo.program);

	// set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix);

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		//gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
	cubeRotation += deltaTime;
}

function initBuffers(gl, positions, colors, indices){
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,
				new Float32Array(positions),
				gl.STATIC_DRAW);

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices), gl.STATIC_DRAW);

	return {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,
	};
}

function initShaderProgram(gl, vsSource, fsSource){
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// if creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		alert('Failed to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

/*
 *	Create a shader of the given type, uploads the soure and compiles it
 */
function loadShader(gl, type, source){
	const shader = gl.createShader(type);

	// send the source to the shader object
	gl.shaderSource(shader, source);

	// Compile the shader program
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert('Shader compile error: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

/* Initialize a texture and load an image
 * when the image finishes loading copy into texture
 */
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					width, height, border, srcFormat, srcType,
					pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
						srcFormat, srcType, image);

		/* WebGL1 has different requirements for power of 2 images
		 * vs non power of 2 images so check if the image is a
		 * power of 2 in both dimensions.
		 */
		if (isPowerOf2(image.width) && isPowerOf2(image.height)){
			// Yes, it's a power of 2, generate mips
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// not power of 2, turn of mips and set wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTuRE_MIN_FILER, gl.LINEAR);
		}
	};
	image.setAttribute('crossorigin', 'anonymous');
	image.src = url;

	return texture;
}

function isPowerOf2(value){
	return (value & (value - 1)) == 0;
}

