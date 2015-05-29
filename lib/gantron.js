                                                                                              
/*                                                                                                
███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗
╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝

				 ██████╗  █████╗ ███╗   ██╗████████╗██████╗  ██████╗ ███╗   ██╗                 
				██╔════╝ ██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║                 
				██║  ███╗███████║██╔██╗ ██║   ██║   ██████╔╝██║   ██║██╔██╗ ██║                 
				██║   ██║██╔══██║██║╚██╗██║   ██║   ██╔══██╗██║   ██║██║╚██╗██║                 
				╚██████╔╝██║  ██║██║ ╚████║   ██║   ██║  ██║╚██████╔╝██║ ╚████║                 
				 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝                 

███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗███████╗
╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝


	I hate Gantron ~ Shawn
 
 */                                                                                               

var Gantron = function(options){

	var _this = this;
	this.id = 1000 + Math.round(Math.random() * 5000)
	this.container = options.container;
	this.inputs = options.inputs;
	this.b = this.container.getBoundingClientRect();
	this.divisions = 48;
	this.size = [0,72];
	this.idleFps = 4;
	this.activeFps = 30;
	this.fps = this.idleFps;



	/*
		██████╗ ██╗      ██████╗  ██████╗██╗  ██╗███████╗
		██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝
		██████╔╝██║     ██║   ██║██║     █████╔╝ ███████╗
		██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ╚════██║
		██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗███████║
		╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝

		a "block" is more of a stylisitic concept. A simply a range on the chart. 
		When the value() or serialize() methods are called a loop is run over the entire gant.
		If a block occupies an intex the output serializes that blocks input arrays.
		if the index is unoccupied the ouput is simply false

	*/
	this.blocks = [];

	/*
		This shit is fucked up.
		We should create a block from an object.
		{
			location : [],

		}
	*/
	this.setBlockValues = function(block, values){
		for(var i = 0; i < block.inputs.length; i++){

			var input = block.inputs[i];

			// There is a value for this input object!
			if(values[input.name]){
				for(var prop in values[input.name]){
					input[prop] = values[input.name][prop]
				}
			}

		}
	}
	
	this.createBlock = function(location, values){
		if(!location)
			return console.warn('Gantron tried to create a block but did not know where to place the block.')

		if(_this.mouse.intent !== 'creating' || !_this.mouse.isOver)
			return
		
		var inputs = [];

		// Template the new block's input array
		for(var i = 0; i < options.inputs.length; i++){
			inputs[i] = {};
			for(var prop in options.inputs[i]){
				inputs[i][prop] = options.inputs[i][prop]
			}
		}

		// Create a templated block
		var newBlock = {
			location : location,
			inputs : inputs
		};

		// Apply values
		values = (values)?values:{};
		this.setBlockValues(newBlock, values)
		console.log(newBlock)
		_this.blocks.push(newBlock);
		
		// Fire a change event		
		if(options.onchange){
			options.onchange.bind(_this, newBlock)()
		}

	}		
	this.dragTargetBlock = function(){
		
		_this.destroyPop();
		
		var target = _this.blocks[_this.mouse.target.index];
		target.style = _this.generateGrabGradient();
		
		var originalStart = _this.mouse.target.tmp[0];
		var originalEnd = _this.mouse.target.tmp[1];
		
		var gridDelta = _this.locationToGrid(_this.mouse.delta)[0];
		var mouseGrid = _this.locationToGrid(_this.mouse.location)[0];
		
		var newStart = originalStart - gridDelta;
		var newEnd = originalEnd - gridDelta;
		
		target.location[0] = (newStart < 0) ? 0 : newStart;
		target.location[1] = (newEnd > _this.divisions) ? _this.divisions : newEnd;
		
		// collisions
		_this.collisionHandler();
		
	}

	this.resizeTargetBlock = function(){
		
		_this.destroyPop();
		
		var target = _this.blocks[_this.mouse.target.index];
		if(!target){
			return
		}
		
		// target.style = _this.generateResizeGradient();
		
		var originalStart = _this.mouse.target.tmp[0];
		var originalEnd = _this.mouse.target.tmp[1];
		
		var gridDelta = _this.locationToGrid(_this.mouse.delta)[0];
		
		var newStart = originalStart - gridDelta;
		var newEnd = originalEnd - gridDelta;
		
		if(_this.mouse.target.resize === 'left'){
			target.location[0] = newStart;
		}else{
			target.location[1] = newEnd;
		}
		
		// collisions
		_this.collisionHandler();
	}








	/*
		███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗
		████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝
		██╔████╔██║██║   ██║██║   ██║███████╗█████╗  
		██║╚██╔╝██║██║   ██║██║   ██║╚════██║██╔══╝  
		██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║███████╗
		╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
	*/
	this.mouse = {
		location : [0,0],
		grid : [0,0],
		delta : [0,0],
		down: [0,0],
		up: [0,0],
		isDown: false,
		isOver : false,
		snapSize : 4,
		intent: 'create',
		target : {
			resize : null,
			index: null,
			offset: [0,0],
			tmp: [0,0]
		},
		getGrid : function(){
			return _this.locationToGrid(_this.mouse.location);
		}
	}









	/*
		███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗    ███████╗██████╗  █████╗  ██████╗███████╗
		██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║    ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
		███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║    ███████╗██████╔╝███████║██║     █████╗  
		╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║    ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  
		███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║    ███████║██║     ██║  ██║╚██████╗███████╗
		╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝    ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝
	*/
	function getPosition(e){var b = _this.b;return {x:b.left,y:b.top}}
	this.locationToGrid = function(location){
		var grid = [Math.round(location[0]/_this.mouse.snapSize), Math.round(location[1]/_this.mouse.snapSize)];
		return grid;
	}
	this.gridToLocation = function(grid){
		return [Math.round(_this.mouse.snapSize * grid[0]), Math.round(_this.mouse.snapSize * grid[1])];
	}
	this.snapLocation = function(location){
		var grid = _this.locationToGrid(location);
		return _this.gridToLocation(grid);
	}
	










	/*
		███████╗████████╗██╗   ██╗██╗     ███████╗
		██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝
		███████╗   ██║    ╚████╔╝ ██║     █████╗  
		╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  
		███████║   ██║      ██║   ███████╗███████╗
		╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝
	*/

	this.colors = [
		"#2c3e50",
		"#27ae60",
		"#e74c3c",
		"#f1c40f"
	]
	this.setColor = function(i,color){}
	this.getColor = function(i){
		if(_this.colors[i])
			return _this.colors[i]

		return "#00ffff"
	}
	this.padding = 8;
	this.blockStyles = {
		'create' : '#bbbbbb',
		'grab' : '#ffffff',
		'resize' : 'rgba(250,250,250,1)'
	};















	/*
		███████╗ █████╗ ██╗   ██╗███████╗        ██╗    ██████╗ ███████╗███████╗████████╗ ██████╗ ██████╗ ███████╗
		██╔════╝██╔══██╗██║   ██║██╔════╝       ██╔╝    ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝
		███████╗███████║██║   ██║█████╗        ██╔╝     ██████╔╝█████╗  ███████╗   ██║   ██║   ██║██████╔╝█████╗  
		╚════██║██╔══██║╚██╗ ██╔╝██╔══╝       ██╔╝      ██╔══██╗██╔══╝  ╚════██║   ██║   ██║   ██║██╔══██╗██╔══╝  
		███████║██║  ██║ ╚████╔╝ ███████╗    ██╔╝       ██║  ██║███████╗███████║   ██║   ╚██████╔╝██║  ██║███████╗
		╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝        ╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝
	*/
	this.serialize = function(){
		return {inputs : _this.inputs, blocks : this.blocks}
	}

	this.deSerialize = function(json){

		if(typeof json === 'string'){
			try{json = JSON.parse(json)}catch(err){return console.warn("The block object you supplied is not valid JSON.", err)}
		}

		_this.inputs = json.inputs;
		_this.blocks = json.blocks;
	}

















	/*
		 ██████╗ ██╗   ██╗████████╗██████╗ ██╗   ██╗████████╗
		██╔═══██╗██║   ██║╚══██╔══╝██╔══██╗██║   ██║╚══██╔══╝
		██║   ██║██║   ██║   ██║   ██████╔╝██║   ██║   ██║   
		██║   ██║██║   ██║   ██║   ██╔═══╝ ██║   ██║   ██║   
		╚██████╔╝╚██████╔╝   ██║   ██║     ╚██████╔╝   ██║   
		 ╚═════╝  ╚═════╝    ╚═╝   ╚═╝      ╚═════╝    ╚═╝    
	*/
	
	/*
		assembles an input's label and value as well as any child inputs it may have
	*/
	this.getValue = function(input){
		if(!input)
			return false

		var serialized = {}

		if(input.value || input.value === false || input.value === 0)
			serialized.value = input.value

		if(input.selected || input.selected === 0)
			serialized.selected = input.selected

		if(Array.isArray(input.inputs) && typeof input.selected !== 'undefined'){
			if(Array.isArray(input.inputs[input.selected]))
				serialized.inputs = this.getValues(input.inputs[input.selected])
			else
				serialized.inputs = this.getValue(input.inputs[input.selected])
		}

		return serialized	
	}


	/*
		Assemble's an array of inputs
	*/
	this.getValues = function(inputs){
		var serialized = {};

		for(var i = 0; i < inputs.length; i++){
			if(Array.isArray(inputs[i]))
				serialized[inputs[i].name] = this.getValues(inputs[i])
			else
				serialized[inputs[i].name] = this.getValue(inputs[i])
		}

		return serialized
	}

	/*
		Assembles an array of input values that represents the chart at this moment
	*/
	this.value = function(val){
		
		if(val){
			for(i = 0; i < val.length; i++){
			
				for(var b = 0; b < _this.blocks.length; b++){
				
					var block = _this.blocks[b];
					
					if(
						block.location[0] <= i && 
						block.location[1] > i
					){	
						result.push(this.getValues(block.inputs));
					}
				}

				if(typeof result[i] === 'undefined'){
					result[i] = false;
				}
			}
		}

		var result = [];
		
		for(i = 0; i < _this.divisions; i++){
			
			for(var b = 0; b < _this.blocks.length; b++){
			
				var block = _this.blocks[b];
				
				if(
					block.location[0] <= i && 
					block.location[1] > i
				){	
					result.push(this.getValues(block.inputs));
				}
			}

			if(!result[i]){
				result[i] = false;
			}
		}
		
		return result;
	}

	this.updateIntent = function(){
		
		// Mouse is down, lock down that mouse intent
		if(this.mouse.isOver === true && this.mouse.isDown === true)
			return

		/*
			Mouse is out
			Mouse intent is not create (mouse can move in and out of the container while creating)
			Mouse intent is not currently idle
		*/
		if(
			_this.mouse.isOver === false
		){
			return _this.setIntent['idle']();
		}
		
		// if mouse is over a box - intent is to drag
		var mouseGrid = _this.mouse.getGrid();
		var gridSize = Math.round(_this.size[0]/_this.divisions);
		var resizeRange = 4; // pixel area that acts as a resize handle
		var margin = 4;
		
		for(var block = 0; block < _this.blocks.length; block++){
		
			var _block = _this.blocks[block];
			var blockLocation = _this.gridToLocation(_block.location)
			
			// resize left
			if(
				Math.abs((_this.mouse.location[0] - margin) - blockLocation[0]) <= resizeRange &&
				Math.abs((_this.mouse.location[0] - margin) - blockLocation[0]) >= 0
			){
				// console.log('resize left')
				// console.log(block)
				return _this.setIntent['resize'](block, 'left');
			}
			
			// resize right
			if(
				Math.abs(_this.mouse.location[0] - blockLocation[1]) <= resizeRange &&
				Math.abs(_this.mouse.location[0] - blockLocation[1]) >= 0
			){
				// console.log('resize right')
				// console.log(block)
				return _this.setIntent['resize'](block, 'right');
			}
			
			// grab
			if(
				_this.mouse.location[0] >= (blockLocation[0]+ resizeRange) && 
				_this.mouse.location[0] <= (blockLocation[1] - resizeRange)
			){
				// console.log('dragging')
				// console.log(block)
				return _this.setIntent['grab'](block);
			}
			
		}
		
		// _this.setIntent['idle']();
		_this.setIntent['create']();
		
	}
	
	this.setIntent = {
		'idle': function(){
			_this.mouse.intent = 'idle';
			_this.mouse.target.index = null;
			_this.container.className = "gantron";
		},
		'create': function(){
			_this.mouse.intent = 'create';
			_this.mouse.target.index = null;
			_this.container.className = "gantron";
		},
		'creating': function(){
			_this.mouse.intent = 'creating';
			_this.mouse.target.index = null;
			_this.container.className = "gantron";
		},
		'grab': function(block){
			_this.mouse.intent = 'grab';
			_this.mouse.target.index = block;
			_this.container.className = "gantron grab";
		},
		'resize': function(block, direction){
			_this.mouse.intent = 'resize';
			_this.mouse.target.resize = direction;
			_this.mouse.target.index = block;
			_this.container.className = "gantron resize";
		}
	}
	


	this.cleanup = function(){

		if(this.mouse.isDown)
			return

		var gridSize = Math.round(_this.size[0]/_this.divisions);
		
		// remove boxes with 0 width
		for(var block = 0; block < _this.blocks.length; block++){
		
			var _block = _this.blocks[block];
			
			if(_block.location[0] < 0){_block.location[0] = 0;}
			if(_block.location[1] > _this.divisions){_block.location[1] = _this.divisions;}
			
			var blockLocation = _block.location
			var start = blockLocation[0];
			var end = blockLocation[1];
			var width = end - start;
			
			if(width < 1){
				_this.blocks.splice(block, 1);
				continue
			}

			if(_block.location[0] > _block.location[1]){
				_this.blocks.splice(block, 1);
			}
			
		}
	
	} 

	





	/*
		██████╗ ██████╗  █████╗ ██╗    ██╗
		██╔══██╗██╔══██╗██╔══██╗██║    ██║
		██║  ██║██████╔╝███████║██║ █╗ ██║
		██║  ██║██╔══██╗██╔══██║██║███╗██║
		██████╔╝██║  ██║██║  ██║╚███╔███╔╝
		╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ 
	*/
	this.draw = function(){
		
		_this.resize();
		_this.updateIntent();
		_this.ctx.clearRect(0,0,_this.size[0],_this.size[1]);
		_this.drawLines();
		_this.drawBlocks();
		_this.drawCursor();
		_this.sortBlocks();
		_this.collisionHandler();
		_this.cleanup();
		_this.positionPop();

		window.setTimeout(this.draw.bind(this),1000 / this.fps)
	}

	this.drawLines = function(){
		
		_this.ctx.beginPath();
		_this.ctx.strokeStyle = "rgba(0,0,0,.25)";
		_this.ctx.lineWidth = 1;
		
		for(var i = 1; i < _this.divisions; i++){
			var x = _this.gridToLocation([i,0])[0];
			_this.ctx.moveTo(x-.5, 6);
			_this.ctx.lineTo(x-.5, _this.size[1] - 6);
		}
		
		_this.ctx.stroke();
	}
	
	this.drawBlock = function(block){

			var margin = 8;
			var location = _this.gridToLocation(block.location);
			var start = location[0] + margin;
			var end = location[1] - margin;
			var width = (start < end)? end - start:start - end;

			_this.ctx.strokeStyle = "rgba(0,0,0,.25)";
			_this.ctx.lineWidth = 1;

			block.color = (block.color)?block.color : _this.getColor(0);
			_this.ctx.fillStyle = block.color;
			

			_this.ctx.closePath()
			_this.ctx.beginPath()
			_this.roundRect(_this.ctx,.5+start, .5+margin, width, _this.size[1] - (margin * 2) - 1);

			if(_this.blocks[_this.mouse.target.index] === block || _this.activeBlock === block){

				_this.ctx.lineWidth = 1; 
				_this.ctx.strokeStyle = "rgba(0,100,255,1)"; 
				_this.ctx.stroke()
			}

			// if(width < 200)
			// 	return

			var text = "";
			text = (block.label)?block.label:text;

			var fontSize = Math.round((width * 1.5) / text.length);
			fontSize = (fontSize > 22)?22:fontSize;
			fontSize = (fontSize < 6)?0:fontSize;
			_this.ctx.font = "100 "+fontSize+"px FuturaBook, Verdana";

			var textWidth = _this.ctx.measureText(text).width;
			var textX = location[0] + ((width * .5) - (textWidth * .5)) + margin;
			var textY = (_this.size[1] * .5) + (fontSize * .5);

			_this.ctx.fillStyle = "#fff";
			_this.ctx.fillText(text, textX, textY, width)
	}

	this.drawBlocks = function(){
		// draw blocks
	 	var gridSize = Math.round(_this.size[0]/_this.divisions);
		
		for(var block = 0; block < _this.blocks.length; block++){
			this.drawBlock(_this.blocks[block])
		}

	};
	
	this.drawCursor = function(){
	
		if(_this.mouse.isOver === false)
			return
		
		var x = _this.snapLocation(_this.mouse.location)[0];

		
		// draw cursor / stretch new blocks
		if(_this.mouse.isDown === false && _this.mouse.intent === 'create'){
			_this.ctx.beginPath();
			_this.ctx.strokeStyle = "rgba(0, 119, 255, 1)";
			_this.ctx.lineWidth = 1;
			
			_this.ctx.moveTo(x-.5, +4);
			_this.ctx.lineTo(x-.5, _this.size[1] - 8);
			_this.ctx.stroke();
			return;
		}
		
		if(
			_this.mouse.isDown === true 
			&& _this.mouse.intent === 'creating'
		){
			_this.ctx.save();
			_this.ctx.fillStyle = "rgba(0,0,0,.1)";
			_this.ctx.fillRect(_this.mouse.down[0], 0, _this.mouse.delta[0] * -1, _this.size[1]);
			_this.ctx.restore();
		}		
	};
	
	this.roundRect = function(ctx, x, y, width, height, radius, fill, stroke) {

		if (typeof stroke == "undefined" ) {
			stroke = true;
		}

		if (typeof radius === "undefined") {
			radius = 4;
		}

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();

	    ctx.shadowColor = 'rgba(0,0,0,.20)';
	    ctx.shadowBlur = 4
	    ctx.shadowOffsetX = 0;
	    ctx.shadowOffsetY = 4;
		ctx.fill();
	    
	    ctx.strokeStyle = 'rgba(0,0,0,0)';
	    ctx.shadowColor = 'rgba(0,0,0,0)';
		ctx.stroke();
		ctx.clip();
		ctx.restore();
	}

	this.collisionHandler = function(){
		var itterations = 16;

		if(_this.blocks.length > 0){

			while(itterations--){

				for(var b = 0; b < _this.blocks.length; b++){
					var block = _this.blocks[b];
					var leftNeighbor = (b === 0)? null:_this.blocks[b-1];
					var rightNeighbor = (b === _this.blocks.length-1)? null:_this.blocks[b+1];
					
					if(leftNeighbor !== null && _this.mouse.delta[0] > 0){
						if(leftNeighbor.location[1] > block.location[0]){
							leftNeighbor.location[0]--;
							leftNeighbor.location[1]--;
						}
					}
					
					if(rightNeighbor !== null && _this.mouse.delta[0] < 0){
						if(rightNeighbor.location[0] < block.location[1]){
							rightNeighbor.location[0]++;
							rightNeighbor.location[1]++;
						}
					}
					
				}
			}
		}
	}
	
	this.generateCreateGradient = function(base){
		var base = (base)? base : "#bbbbbb";
		var grab = _this.ctx.createLinearGradient(0,0,0,_this.size[1]);
		grab.addColorStop(0,"#cccccc");
		grab.addColorStop(1,base);
		return grab;
	}
	
	this.generateGrabGradient = function(){
		// console.log(_this.mouse.location[0])
		var grab = _this.ctx.createRadialGradient(_this.mouse.location[0],_this.mouse.location[1],5,_this.mouse.location[0],_this.mouse.location[1],250);
		grab.addColorStop(0,"#cccccc");
		grab.addColorStop(1,"#cccccc");
		return grab;
	}
	
	this.generateResizeGradient = function(){
		var resize = _this.ctx.createRadialGradient(_this.mouse.location[0],_this.mouse.location[1],5,_this.mouse.location[0],_this.mouse.location[1],100);
		resize.addColorStop(0,"#eaeaff");
		resize.addColorStop(.1,"#bbbbbb");
		resize.addColorStop(1,"#bbbbbb");
		return resize;
	}
	
	this.resize = function(){

		var rect = _this.canvas.getBoundingClientRect();
		_this.b = rect;

		_this.size[0] = rect.width;
		_this.size[1] = rect.height;
		
		_this.canvas.width = _this.size[0];		
		_this.canvas.height = _this.size[1];
		
		_this.mouse.snapSize = _this.b.width/_this.divisions;
		
		
	}
	
	this.initStyle = function(){ 
	}
	
	this.sortBlocks = function(){
		_this.blocks.sort(function(a, b){
		
			var x= a.location[0];
			var y= b.location[0];
			
			var r = 0;
			
			if(x > y){
				r = 1;
			}
			
			if(x < y || x === y){
				r - 1
			}
			
			return r;
			
		});		
	}
	







	/*
		██╗███╗   ██╗██████╗ ██╗   ██╗████████╗███████╗
		██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝
		██║██╔██╗ ██║██████╔╝██║   ██║   ██║   ███████╗
		██║██║╚██╗██║██╔═══╝ ██║   ██║   ██║   ╚════██║
		██║██║ ╚████║██║     ╚██████╔╝   ██║   ███████║
		╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝   ╚══════╝
	*/
	this.fireChange = function(){

		if(options.oninput){
			for(var b in _this.blocks){
				_this.validateInputs(_this.blocks[b].inputs)
				options.oninput.bind(_this, _this.blocks[b])()
			}
		}

		if(options.onchange){
			options.onchange.bind(this)()
		}
	}

	/*
		Wrapper. Just pass in an input object and you'll get a fully built HTML element.
	*/
this.generateInput = function(input){
		if(Array.isArray(input))
			return ele(this.generateInputs(input))
		
		if(!input)
			return console.warn("Gantron.generateInput 'input' is undefined!", input);

		if(!input.type)
			return console.warn("Gantron.generateInput 'input.type' is undefined!", input);

		if(!input.name)
			return console.warn("Inputs must have a name atribute.", input);

		if(!input.label)
			input.label = input.label

		return _this.generateElementsByType[input.type](input)
	}

	this.generateInputs = function(inputs){
		console.log(inputs)
		var _inputs = [];
		for(var i = 0; i < inputs.length; i++){
			_inputs.push(_this.generateInput(inputs[i]))
		}
		return _inputs;
	}

	/*
		Input generators / event handlers by type
	*/

	this.inputEventsByType = {
		'select' : {
			'onclick' : function(e, input, nestedInputWrap){


				if(e.target === this.childNodes[0] && e.target === this.childNodes[2])
					return


				// decrement else increment
				if(input.selected < 0){
					input.selected = 0;
				}

				if(e.target === this.childNodes[0]){
					input.selected = (input.selected > 0)? input.selected-1 : input.options.length - 1;
				}else{
					input.selected = (input.selected === (input.options.length - 1))? 0 : input.selected+1;
				}

				input.value = input.options[input.selected];
				this.childNodes[1].innerHTML = input.value;


				/*
					Handle Nested Inputs
				*/

				nestedInputWrap.innerHTML = "";

				if(typeof input.inputs === "object"){

					if(input.inputs[input.selected]){

						nestedInputWrap.appendChild(_this.generateInput(input.inputs[input.selected]))
						
						var newHeight = 0;
						
						for(var i = 0; i < nestedInputWrap.childNodes.length; i++)
							newHeight += nestedInputWrap.childNodes[i].getBoundingClientRect().height

						nestedInputWrap.style.height = newHeight+"px";
					}

				}

				if(typeof options.oninput === 'function')
					options.oninput.bind(_this)(_this.activeBlock)

				window.setTimeout(function(){
					_this.positionPop()
					if(nestedInputWrap)
						nestedInputWrap.style.height = "auto"
				},150)
			}
		},
		'text' : {
			'oninput' : function(inputObject){
				inputObject.value = this.innerHTML;
				if(typeof options.oninput === 'function')
					options.oninput.bind(_this)(_this.activeBlock)
			},
			'onchange' : function(inputObject){
			},
			'onfocus' : function(inputObject){
			}
		},
		'range' : {
			oninput : function(inputObject){
				inputObject.value = this.value;
				if(typeof options.oninput === 'function')
					options.oninput.bind(_this)(_this.activeBlock)
			}
		}
	}

	this.validateInputs = function(inputs){

		for(var i in inputs){

			if(Array.isArray(inputs[i])){
				_this.validateInputs(inputs[i]);
				continue
			}

			if(!_this.validateInputByType[inputs[i].type](inputs[i]))
				return false
		}

		return true
	}

	this.validateInputByType = {
		'range' : function(input){return true},
		'text' : function(input){return true},
		'select' : function(input){

			if(!input.options){	
				console.warn("A select input with no options detected. Fix it and try again.", input);
				return false
			}
			
			if(!input.options.length === 0){	
				console.warn("A select input with no options detected. Fix it and try again.", input);
				return false
			}

			if(typeof input.selected != 'number')
				input.selected = 0;

			if(input.selected < 0)
				// input.value = false

			if(input.selected > (input.options.length - 1))
				input.selected = (input.options.length - 1);

			if(!input.value && input.value !== false)
				input.value = input.options[input.selected];
			
			if(!input.value && input.value !== false){
				console.warn("Unable to set the initial value of a select input.", input);
				return false
			}

			if(input.inputs)
				return _this.validateInputs(input.inputs)

			return true
		}
	}

	this.generateElementsByType = {
		'select' : function(input){

			// Validate the select input
			//----------------------------------
			if(!_this.validateInputByType.select(input))
				return 'div:error'

			// label
			var label = ele('label:'+input.label);

			// input
			var inputWrap = ele(".gantron-select-input-wrap");

			var html = input.value;

			inputWrap.appendChild(ele([
				ele(".gantron-increment:<"),
				ele(":"+html),
				ele(".gantron-decrement:>")
			]))

			var nestedInputWrap = ele(".gantron-nested-input-row");

			for(var eventHandler in _this.inputEventsByType[input.type]){
				inputWrap[eventHandler] = function(e){
					_this.inputEventsByType[input.type][eventHandler].bind(inputWrap, e, input, nestedInputWrap)();
				};
			}
			if(input.inputs){
				console.log(nestedInputWrap)
				if(Array.isArray(input.inputs[input.selected]))
					nestedInputWrap.appendChild(ele(_this.generateInputs(input.inputs[input.selected])))
				else if(typeof input.inputs[input.selected] === 'object')
					nestedInputWrap.appendChild(_this.generateInput(input.inputs[input.selected]))

			}

			/*
				Assemble the above and return the resulting document fragment
			*/
			var structure = ele([
				{
					".gantron-input-row" : 
					[
						{".gantron-input-column": label},
						{".gantron-input-column": inputWrap}
					]
				},
				nestedInputWrap
			]);

			return structure;
		},
		'text' : function(input){

			var inputElement = ele("div(contenteditable='true')");
			inputElement.innerHTML = input.value;

			for(var eventHandler in _this.inputEventsByType[input.type]){
				inputElement[eventHandler] = _this.inputEventsByType[input.type][eventHandler].bind(inputElement, input);
			}

			/*
				Assemble the above and return the resulting document fragment
			*/
			var structure = ele({
				".gantron-input-row" : [
					".gantron-input-column:"+input.label,
					{".gantron-input-column": inputElement}
				]
			});

			return structure;
		},
		'range' : function(input){
			var max = (input.max)?input.max:1;
			var min = (input.min)?input.min:0;
			var step = (input.step)?input.step:.01;
			var inputElement = ele("input(type='range' min='"+min+"' max='"+max+"'  step='"+step+"')");
			inputElement.value = input.value;

			for(var eventHandler in _this.inputEventsByType[input.type]){
				inputElement[eventHandler] = _this.inputEventsByType[input.type][eventHandler].bind(inputElement, input);
			}

			/*
				Assemble the above and return the resulting document fragment
			*/
			var structure = ele({
				".gantron-input-row" : [
					".gantron-input-column:"+input.label,
					{".gantron-input-column": inputElement}
				]
			});

			return structure;
		}
	}










	/*
		██████╗  ██████╗ ██████╗ 
		██╔══██╗██╔═══██╗██╔══██╗
		██████╔╝██║   ██║██████╔╝
		██╔═══╝ ██║   ██║██╔═══╝ 
		██║     ╚██████╔╝██║     
		╚═╝      ╚═════╝ ╚═╝     
	*/
	this.activePop = null;
	this.destroyPop = function(callback){
		_this.activePop = null;
		_this.activeBlock = null;
		var similar = document.querySelectorAll('.gantron-pop');
		for(var i = 0; i < similar.length; i++){
			similar[i].parentNode.removeChild(similar[i])
		}
	};
	
	this.positionPop = function(block){
		
		if(!block)
			var block = _this.activeBlock;

		if(!block)
			return
		
		block = (typeof block === 'number')?_this.blocks[block]: block;

		// find the top, left, and width of the block
		var location = _this.gridToLocation(block.location);
		var blockWidth = location[1] - location[0];
		
		var popRect = _this.activePop.getBoundingClientRect();
		var popWidth = popRect.width;
		var popHeight = popRect.height;
		
		var containerOffset = _this.container.getBoundingClientRect();

		var pushLeft = (blockWidth * .5) - (popWidth * .5);
		var pushTop = (_this.b.height * .5) - (popHeight * .5);

		// var top = containerOffset.top + pushTop;
		var top = containerOffset.top - popHeight - 4 + document.body.scrollTop;
		var left = location[0]+containerOffset.left + pushLeft;

		_this.activePop.style.top = top+'px';
		_this.activePop.style.left = left+'px';	
	};

	this.formatPopHeader = function(n){
		n = (n+1)
		var hours = Math.floor(n / 4);
		var minutes = n - hours * 4;
		hours = (hours > 12)? hours - 12: hours;
		return hours+":"+(minutes * 15);
	};

	this.openPop = function(block){

		/* create an input element for each input */
		var inputs = _this.generateInputs(block.inputs)

		var pop = ele('.gantron-pop');
		var closeButton = ele(".gantron-delete-block");
		closeButton.onclick = function(){
				_this.destroyPop()
		}
		var popContents = ele([
			{
				'.gantron-pop-header' : 
					[
						": ",
						": ",
						": ",
						{
							"div" :  
							[
								closeButton
							]
						}
					]
			},
			inputs,
			".gantron-triangle-stroke",
			".gantron-triangle",
		])

		pop.appendChild(popContents)

		/* Set Flag */
		_this.activePop = pop;
		_this.activeBlock = block;
		document.body.appendChild(pop);
		_this.positionPop(block);
		window.setTimeout(function(){
			pop.className = pop.className+" gantron-transition-all"
		}, 250);
	};





	/*
        ██╗███╗   ██╗██╗████████╗       
        ██║████╗  ██║██║╚══██╔══╝       
        ██║██╔██╗ ██║██║   ██║          
        ██║██║╚██╗██║██║   ██║          
        ██║██║ ╚████║██║   ██║          
        ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝          
	*/
	 
	 this.init = function(newOptions){
	
		if(newOptions.container){
			_this.container = newOptions.container;
		}

		_this.container.className = _this.container.className + "gantron";
		_this.canvas = ele("canvas(style='height:100%;width:100%;')");
		_this.ctx = this.canvas.getContext("2d");
		_this.setIntent['idle']();
		_this.mouse.isOver = false;
		

		_this.container.ondblclick = function(e){
			if(_this.mouse.target.index !== null){
				_this.openPop(_this.blocks[_this.mouse.target.index]);
			}
		}
	
		_this.container.addEventListener('mouseenter', function(e){
			_this.fps = _this.activeFps;
			_this.setIntent['create']();
			_this.mouse.isOver = true;
		})
		
		_this.container.addEventListener('mouseleave', function(e){
			_this.fps = _this.idleFps;
			_this.setIntent['idle']();
			_this.mouse.isOver = false;
		})
		
		_this.container.addEventListener('mousemove', function(e){
		
			var offset = getPosition(_this.container);
			var location = [e.clientX - offset.x, e.clientY - offset.y];
			_this.mouse.location = location;

			if(_this.mouse.isDown === true){
			
				_this.mouse.delta[0] = Math.round(_this.mouse.down[0]) - _this.mouse.location[0];
				
				if(_this.mouse.intent === 'grab'){
					return _this.dragTargetBlock();
				}
				
				if(_this.mouse.intent === 'resize'){
					return _this.resizeTargetBlock();
				}
				
				
				return;
			}
			
			
			
		})
		
		document.body.addEventListener('mouseup', function(e){


			var offset = getPosition(_this.container);
			var location = [e.clientX - offset.x, e.clientY - offset.y];
			
			_this.mouse.up = _this.snapLocation(location);
			
			if(_this.mouse.intent === 'idle')
				return

			if(Math.abs(_this.mouse.delta[0]) > 8 && _this.mouse.intent === 'creating'){

				var start = (_this.mouse.down[0] < _this.mouse.location[0])? _this.mouse.down[0] : _this.mouse.location[0];
				var end = (_this.mouse.down[0] < _this.mouse.location[0])? _this.mouse.location[0] : _this.mouse.down[0];
				var blockLocation = _this.locationToGrid([start, end]);
				_this.createBlock(blockLocation);
				_this.setIntent['create']();
			}

			_this.mouse.isDown = false;
			_this.fireChange()
		})
		
		_this.container.oncontextmenu = function(e){
			e.preventDefault()
			if(options.oninput){
				options.oninput.bind(_this, _this.blocks[_this.mouse.target.index])()
			}
			_this.fireChange();
			_this.blocks.splice(_this.mouse.target.index, 1);
		}

		_this.container.addEventListener('mousedown', function(e){
			e.preventDefault();
			
			_this.destroyPop();
			
			var offset = getPosition(_this.container);
			var location = [e.clientX - offset.x, e.clientY - offset.y];
			_this.mouse.down = _this.snapLocation(location);
			
			if(_this.mouse.intent === 'grab' || _this.mouse.intent === 'resize'){
				_this.mouse.target.tmp = [_this.blocks[_this.mouse.target.index].location[0],_this.blocks[_this.mouse.target.index].location[1]];
			}

			if(_this.mouse.intent === 'create'){
				_this.setIntent['creating']()
			}
			
			_this.mouse.isDown = true;
			
		})
		
		/*
			Closes all gantron popups on click if the click was not in a pop
		*/
		document.body.addEventListener('click', function(e){
			if(_this.activePop === null)
				return

			var element = e.target;
			
			while(element){

				if(element.className === 'gantron-pop')
					return console.log("clicked inside a pop. returning")
				
				element = element.parentNode;
			}

			/* Keep this MF from firing before the above while loop is running..... */
			// window.setTimeout(_this.destroyPop, 100)
		});
		
		window.addEventListener('resize', function(){
			_this.resize();
		});
		
		_this.container.appendChild(_this.canvas);
		_this.draw()
		
	}
	this.initStyle();
	this.init({});

}