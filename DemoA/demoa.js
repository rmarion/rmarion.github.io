window.onload = function(){
	var hmpCanvas = document.getElementById("hmpCanvas");
	var hmpCtx = hmpCanvas.getContext("2d");
	var hmpImg = new Image;
	hmpImg.onload = function(){
		hmpCtx.drawImage(hmpImg,0,0);
	};
	hmpImg.src = "../Images/hmp_placeholder.jpg";

	var triCanvas = document.getElementById("triCanvas");
	var triCtx = triCanvas.getContext("2d");
	var triImg = new Image;
	triImg.onload = function(){
		triCtx.drawImage(triImg,0,0);
	};
	triImg.src = "../Images/tri_placeholder.jpg";
};

/*window.onload = function(){
	var canvas = document.getElementById("hmpCanvas");
	var ctx = canvas.getContext("2d");
	var img = new Image;
	img.onload = function(){
		ctx.drawImage(img,0,0);
	};
	img src = "../Images/admin_cat.jpg";
};*/
