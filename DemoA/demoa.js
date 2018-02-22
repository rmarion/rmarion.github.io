window.onload = function(){
	var hmpCanvas = document.getElementById("hmpCanvas");
	var hmpCtx = hmpCanvas.getContext("2d");
	var hmpImg = new Image;
	hmpImg.onload = function(){
		hmpCtx.drawImage(hmpImg,0,0);
	};
	hmpImg.src = "../Images/hmp_placeholder.jpg";
	
	var triCanvas = document.getElementById("triCanvas");
	var gl = canvas.getContext("experimental-webgl");
	var verts = [-0.5, 0.5, -0.5, -0.5, 0.0, -0.5,];
	var vertex_buffer = gl.createBuffer();
	// binds empty array buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	// pass the vertices data to the buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
	// unbind the buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Shader programs
	// vert shader
	var vertCode = 
		'attribute vec2 coordinates;' +
		'void main(void) {' + 'gl_Position = vec4(coordinates, 0.0, 1.0);' + '}';

	// vert shader instance
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	// attach vertex shader code
	gl.shaderSource(vertShader, vertCode);
	// compile shader
	gl.compileShader(vertShader);
	// frag shader code
	var fragCode = 'void main(Void) {' + 'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' + '}';
	// frag shader instance
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	// attach source code
	gl.shaderSource(fragShader, fragCode);
	// compile
	gl.compileShader(fragShader);
	// create shader program object to store combined program
	var shaderProgram = gl.createProgram();
	// attach shaders
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);
	// link programs
	gl.linkProgram(shaderProgram);
	// use combined program object
	gl.useProgram(shaderProgram);
	
	// associate shader programs to buffer objects
	// bind vertex buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	//get attribute location
	var coord = gl.getAttribLocation(shaderProgram, "coordinates");
	// point an attribute to the currently bound buffer object
	gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
	// enable the attribute
	gl.enableVertexAttribArray(coord);

	// draw the object
	// clear the canvas
	gl.clearColor(0.5, 0.5, 0.5, 0.9);
	//enable the depth test
	gl.enable(gl.DEPTH_TEST);
	// clear color buffer bit
	gl.clear(gl.COLOR_BUFFER_BIT);
	// set the view port
	gl.viewport(0,0,triCanvas.width,triCanvas.height);
	// draw the triangle
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	/*
	var triCanvas = document.getElementById("triCanvas");
	var triCtx = triCanvas.getContext("2d");
	var triImg = new Image;
	triImg.onload = function(){
		triCtx.drawImage(triImg,0,0);
	};
	triImg.src = "../Images/tri_placeholder.jpg";
	*/
};
