// 队列数组
var queueArr = [];
// 可拖动对象数组
var draggers = [];
// 是否在被拖动
var isDragging = false;
// 鼠标是否在某个拖动上按下
var isMouseDown = false;
// 被拖动的对象
var dragger = null;
// 刚开始拖动时的鼠标横坐标
var mouseX;
// 刚开始拖动时的鼠标纵坐标
var mouseY;
// 刚开始拖动时的拖动对象横坐标
var draggerLeft;
// 刚开始拖动时的拖动对象纵坐标
var draggerTop;
// 当前拖动对象的一个克隆，跟着鼠标移到
var clone = null;
// 拖动到灵敏度
var DRAG_THRESHOLD = 5;
// 包含所有队列的容器
var queueContainer;
// 队列选中时的border
var queueActive = {'border': '1px solid #e85032'};
// 队列未选中时的border
var queueUnActive = {'border': '1px solid #2db9c7'};

var registerDrag = function(container){
	queueContainer = container;
	$.each(container.find('.drag-box'), function(index, value){

		queueArr[index] = $(value);
		draggers[index] = [];
		elements = $(value).find('.drag-item');
		$.each(elements, function(_index, _value){
			draggers[index][_index] = $(_value);
		});
	});
	for(var i=0;i<draggers.length;i++)
		for(var j=0;j<draggers[i].length;j++){
			draggers[i][j].on('mousedown', dragStart);
		}
	$(document).on('mousemove', dragMove);
	$(document).on('mouseup', dragEnd);
}

var dragStart = function(e){
	e.stopPropagation();

	isMouseDown = true;
	mouseX = e.clientX;
	mouseY = e.clientY;
	dragger = $(this);
}

var dragMove = function(e){
	e.stopPropagation();

	if(!isMouseDown) return;

	var dx = e.clientX - mouseX;
	var dy = e.clientY - mouseY;
	if(isDragging){
		clone.css({left: draggerLeft + dx, top: draggerTop + dy});
		arrangeDragger();
	}else if(Math.abs(dx)>DRAG_THRESHOLD || Math.abs(dy)>DRAG_THRESHOLD){
		clone = makeClone(dragger);
		draggerLeft = dragger.offset().left - parseInt(dragger.css('margin-left')) - parseInt(dragger.css('padding-left'));
		draggerTop = dragger.offset().top - parseInt(dragger.css('margin-top')) - parseInt(dragger.css('padding-top'));
		clone.css({left: draggerLeft, top: draggerTop});
		queueContainer.append(clone);
		dragger.css('visibility', 'hidden');
		isDragging = true;
	}
}

var dragEnd = function(e){
	e.stopPropagation();
	if(isDragging){
		isDragging = false;
		clone.remove();
		dragger.css('visibility', 'visible');
	}
	for(var i=0;i<queueArr.length;i++)
		queueArr[i].css(queueUnActive);
	isMouseDown = false;
}

var makeClone = function(source){
	var res = source.clone();
	res.css({position: 'absolute', 'z-index': 100000});
	return res;
}

var arrangeDragger = function(){
	for(var i=0;i<queueArr.length;i++)
		queueArr[i].css(queueUnActive);
	var queueIn = findQueue();
	if(queueIn != -1)
		queueArr[queueIn].css(queueActive);
	var hover = findHover(queueIn);
	if(hover == null)
		return;
	var _hover = hover.hover;
	var _insert = hover.insert;
	var queueIdOriginal, drggerIdOriginal;
	var queueIdHover, drggerIdHover;
	for(var i=0;i<draggers.length;i++)
		for(var j=0;j<draggers[i].length;j++){
			if(draggers[i][j][0] == dragger[0]){
				queueIdOriginal = i;
				drggerIdOriginal = j;
			}
		}
	draggers[queueIdOriginal].splice(drggerIdOriginal, 1);
	if(_hover){
		for(var i=0;i<draggers.length;i++)
			for(var j=0;j<draggers[i].length;j++){
				if(_hover && draggers[i][j][0] == _hover[0]){
					queueIdHover = i;
					drggerIdHover = j;
				}
			}
		if(_insert == 'left'){
			_hover.before(dragger);
			draggers[queueIdHover].splice(drggerIdHover, 0, dragger);
		}
		else{
			_hover.after(dragger);
			draggers[queueIdHover].splice(drggerIdHover + 1, 0, dragger);
		}
	}else{
		draggers[queueIn].push(dragger);
		queueArr[queueIn].append(dragger);
	}
	console.log('******************');
	for(var i=0;i<draggers.length;i++)
		for(var j=0;j<draggers[i].length;j++)
			console.log(draggers[i][j][0]);
	console.log('******************');
}

var findQueue = function(){
	var mx=-1,pos=-1;
	var cloneTop = clone.offset().top;
	var cloneHeight = clone.height();
	for(var i=0;i<queueArr.length;i++){
		var queueTop = queueArr[i].offset().top;
		var queueHeight = queueArr[i].height();
		var val = Math.min(queueTop + queueHeight, cloneTop + cloneHeight) - Math.max(queueTop, cloneTop);
		if(val > mx){
			mx = val;
			pos = i;
		}
	}
	return pos;
}

var findHover = function(queueIn){
	if(queueIn == -1)
		return null;
	var mx=-1,pos=null;
	var cloneTop = clone.offset().top;
	var cloneHeight = clone.height();
	var cloneLeft = clone.offset().left;
	var cloneWidth = clone.width();
	var isOwn = false;
	for(var i=0;i<draggers[queueIn].length;i++){

		var _draggerTop = draggers[queueIn][i].offset().top;
		var _draggerHeight = draggers[queueIn][i].height();
		var vertical = Math.min(_draggerTop + _draggerHeight, cloneTop + cloneHeight) - Math.max(_draggerTop, cloneTop);

		var _draggerLeft = draggers[queueIn][i].offset().left;
		var _draggerWidth = draggers[queueIn][i].width();
		var horizontal = Math.min(_draggerLeft + _draggerWidth, cloneLeft + cloneWidth) - Math.max(_draggerLeft, cloneLeft);

		if(vertical <= 0 || horizontal <=0) continue;
		var s = vertical * horizontal;
		if(s <= cloneHeight * cloneWidth /3)
			continue;
		if(draggers[queueIn][i][0] == dragger[0]){
			isOwn = true;
			continue;
		}
		if(s > mx){
			mx = s;
			pos = draggers[queueIn][i];
		}
	}
	if(mx < 0){
		if(isOwn) return null;
		if(draggers[queueIn].length == 0){
			return {'hover': null};
		}else{
			var last,index=draggers[queueIn].length - 1;
			while(index>=0 && draggers[queueIn][index][0] == dragger[0])
				index--;
			if(index >= 0)
				last = draggers[queueIn][index];
			else
				return {'hover': null};
			if(cloneLeft >= last.offset().left + last.width())
				return {'hover': last, 'insert': 'right'};
			else
				return null;
		}
	}
	else{
		var posMid = (2* pos.offset().left + pos.width())/2;
		var cloneMid = (2* clone.offset().left + clone.width())/2;
		if(posMid > cloneMid)
			return {'hover': pos, 'insert': 'left'};
		else
			return {'hover': pos, 'insert': 'right'};
	}
}