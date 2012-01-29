/* Author: Jonathan Stanton
   Website: www.jastanton.com
   Date: January 29, 2012
   Links: http://www.emanueleferonato.com/2010/08/05/worms-like-destructible-terrain-in-flash-part-2/
   Links: http://hacks.mozilla.org/2009/06/pushing-pixels-with-canvas/
*/

var WORMS = function () {

	//private functions
	var Rectangle = function(x,y,w,h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.grid = [];
		for (var x_ = 0; x_ < this.w; x_++) {
			for (var y_ = 0; y_ < this.h; y_++) {
				this.grid.push([this.x + x_, this.y + y_]);
			}
		}
	};

	var Bitmap = function(imageData){
		this.imageData = imageData;
		this.height = this.imageData.height;
		this.width = this.imageData.width;
		this.x = 0;
		this.y = 0;
		this.hitTest = function(rect,color){
			color = color || "RGBA(0,255,0,255)";
			for (var i = 0; i < rect.grid.length; i++) {
				var x = rect.grid[i][0];
				var y = rect.grid[i][1];
				var pixel = get_pixel(x,y,this.imageData,-this.x,-this.y);

				if(pixel === color) return true;
			}
			return false;
		};
		this.fillColor = function(r,g,b,a){
			for (var x = 0; x < imageData.width; x++)  {
				for (var y = 0; y < imageData.height; y++)  {

					// Index of the pixel in the array
					var idx = (x + y * this.width) * 4;

					imageData.data[idx + 0] = r;
					imageData.data[idx + 1] = g;
					imageData.data[idx + 2] = b;
					imageData.data[idx + 3] = a;

				}
			}
		};
	};


	var get_pixel = function(x,y,canvasData,offsetX,offsetY){

		x = x + offsetX;
		y = y + offsetY;

		if(x < 0 || y < 0 || x > canvasData.width || y > canvasData.height) return;

		var r = (y * canvasData.width + x) * 4;
		var g = (y * canvasData.width + x) * 4 + 1;
		var b = (y * canvasData.width + x) * 4 + 2;
		var a = (y * canvasData.width + x) * 4 + 3;
		
		// WORMS.terrain_bmp.imageData.data[r] = 255;
		// WORMS.terrain_bmp.imageData.data[g] = 0;
		// WORMS.terrain_bmp.imageData.data[b] = 0;
		// WORMS.terrain_bmp.imageData.data[a] = 255;

		// WORMS.canvases.terrain.clearRect(0 , 0, WORMS.width ,WORMS.height);
		// WORMS.canvases.terrain.putImageData(WORMS.terrain_bmp.imageData,WORMS.terrain_bmp.x,WORMS.terrain_bmp.y);
		// WORMS.draw_objects();

		return "RGBA(" + canvasData.data[r] + "," + canvasData.data[g] + "," + canvasData.data[b] + "," + canvasData.data[a] + ")";
	};

	return {
		init: function () {
			this.status = "paused";
			var hello = new Rectangle(10,10,3,3);
			var canvas = document.getElementById("surface");
			this.ctx = canvas.getContext("2d");

			this.canvases = {};

			var terrain_bmpd = this.ctx.createImageData(550,200);
			this.terrain_bmp = new Bitmap(terrain_bmpd);
			this.terrain_bmp.fillColor(0,255,0,255);


			var character_bmpd = this.ctx.createImageData(10,20);
			this.character_bmp = new Bitmap(character_bmpd);
			this.character_bmp.fillColor(0,0,255,255);

			this.width = canvas.getAttribute("width");
			this.height = canvas.getAttribute("height");

			document.onkeydown = this.key_down;
			document.onkeyup   = this.key_up;
			document.onmouseup = this.mouse_up;
			// document.onmousemove = this.mouse_move;

			this.jumping = false;
			this.left_key = false;
			this.right_key = false;
			this.space_key = false;
			this.character_speed = 0;

			this.init_objects(); //init the objects
			this.frame();
		},
		draw_rectancgle : function(rect,color){
			this.ctx.fillStyle = color || "rgba(255,0,0,.5)";
			this.ctx.fillRect(rect.x,rect.y,rect.w,rect.h);
		},
		init_objects : function(){
			this.terrain_bmp.y = 200;
			this.add_child("terrain",this.terrain_bmp);

			this.character_bmp.x = 250;
			this.character_bmp.y = 180;
			this.add_child("character",this.character_bmp);

			this.draw_objects();
		},
		frame : function(){
			this.move_character();
			setTimeout(function(){ WORMS.frame(); }, 1000 / 60); //the loop

		},
		draw_objects : function(){
			this.ctx.clearRect (0 , 0, this.width ,this.height);

			for (var key in this.canvases) {
				var obj = this.canvases[key];
				if(obj !== undefined){
					this.ctx.drawImage(obj.canvas,0,0); //put the pieces together
				}
			}

		},
		add_child : function(temp_name,bitmap,method){
			//stores the canvases in temporary obj to manipulate later
			var t = document.createElement('canvas');
				t.height = this.height;
				t.width = this.width;
			
			var t_context = t.getContext("2d");
				t_context.putImageData(bitmap.imageData, bitmap.x, bitmap.y);

			this.canvases[temp_name] = t_context;
		},
		move_character : function(){
			var i = 0;

			// var left_arm = new Rectangle(this.character_bmp.x - 1,this.character_bmp.y,1,17);
			// var right_arm = new Rectangle(this.character_bmp.x + 10,this.character_bmp.y,1,17);
			//var head = new Rectangle(this.character_bmp.x,this.character_bmp.y,10,1);
			// var foot = new Rectangle(this.character_bmp.x,this.character_bmp.y + 20,10,1);

			if (this.left_key) {
				for (i = 0; i < 3; i++) {
					if(!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x - 1,this.character_bmp.y,1,17))){
						this.character_bmp.x -= 1;
					}
					while(this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x,this.character_bmp.y + 20,10,1))){
						
						this.character_bmp.y -= 1;
					}
				}
			}
			
			if(this.right_key){
				for (i = 0; i < 3; i++) {
					if(!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x + 10,this.character_bmp.y,1,17))){
						this.character_bmp.x += 1;
					}
					while(this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x,this.character_bmp.y + 20,10,1))){
						this.character_bmp.y -= 1;
					}
				}
			}

			if(this.space_key && !this.jumping){
				this.character_speed = -10;
				this.jumping = true;
			}
			this.character_speed++; //is this going to work prooperly?

			if(this.character_speed > 0){
				//check ground
				for (i = 0; i < this.character_speed; i++) {
					if(!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x,this.character_bmp.y + 20,10,1))){
						this.character_bmp.y += 1;
					}else{
						this.jumping = false;
						this.character_speed = 0;
					}
				}
			}else{
				for (i = 0; i < Math.abs(this.character_speed); i++) {
					if(!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x,this.character_bmp.y,10,1))){
						this.character_bmp.y -= 1;
					}else{
						this.character_speed = 0;
					}
				}
			}

			
			this.draw_character();
			// this.draw_rectancgle(new Rectangle(this.character_bmp.x,this.character_bmp.y,10,1));
		},
		draw_character : function(){
			this.canvases.character.clearRect(0 , 0, this.width ,this.height);
			this.canvases.character.putImageData(this.character_bmp.imageData,this.character_bmp.x,this.character_bmp.y);
			this.draw_objects();
		},
		mouse_move : function(){
			var x = event.offsetX,
				y = event.offsetY;
			
			console.log(get_pixel(x,y,WORMS.terrain_bmp.imageData,-WORMS.terrain_bmp.x,-WORMS.terrain_bmp.y));
		},
		mouse_up : function(){
			var x = event.offsetX,
				y = event.offsetY;

			WORMS.canvases.terrain.globalCompositeOperation = "destination-out";
			WORMS.canvases.terrain.beginPath();
			WORMS.canvases.terrain.arc(x,y,30,0,Math.PI*2,true);
			WORMS.canvases.terrain.fill();
			
			//update
			var newCanvasData = WORMS.canvases.terrain.getImageData(WORMS.terrain_bmp.x, WORMS.terrain_bmp.y, WORMS.terrain_bmp.width, WORMS.terrain_bmp.height);
			WORMS.terrain_bmp.imageData = newCanvasData;
			WORMS.canvases.terrain.putImageData(newCanvasData,WORMS.terrain_bmp.x,WORMS.terrain_bmp.y);
			WORMS.draw_objects();
		},
		key_down: function () {
			var KeyID = event.keyCode;
			if (KeyID === 37) {
				WORMS.left_key = true;
			}
			if (KeyID === 39) {
				WORMS.right_key = true;
			}
			if (KeyID === 32) {
				WORMS.space_key = true;
			}
		},
		key_up: function () {
			var KeyID = event.keyCode;
			if (KeyID === 37) {
				WORMS.left_key = false;
			}
			if (KeyID === 39) {
				WORMS.right_key = false;
			}
			if (KeyID === 32) {
				WORMS.space_key = false;
			}
		}
	}; //return

}();