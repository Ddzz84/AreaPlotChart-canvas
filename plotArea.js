/**
 * Carpet Plot
 * Author: Davide Zorzan - by ICE-Flex
 * Create linear carpet plot in canvas
 * How to use: Coding canvas element with id, pass id to class and draw by data
 */

var Plot = function(id){
  var self = this;
  var ploterchart = {
    obj : {},
    canvas : {},
    rects:[],

    init:function(id){
      var self = this;
      this.obj =  $('#'+id).wrap('<div class="plotarea">')
      this.canvas = $('#'+id)[0].getContext('2d');
      this.canvas.moveTo(0,0);
      this.resize();
      // fix margin ghost
      this.obj.attr('width',this.obj.width() -15)
      return this;
    },
    resize: function(){
      this.obj.attr({'width':this.obj.width(), 'height':this.obj.height()});
    },
    rect : function(width, pos_x, color, index,data){
      this.canvas.beginPath()
      this.canvas.fillStyle= color;
      this.canvas.rect(pos_x, 0, width, this.obj.height() )
      this.canvas.fill();
      return { w:width, pos_x:pos_x, index, data: data.data };
    },
    draw : function(data){
      var total = parseFloat(data.reduce(function(a,b){ return a + b.w },0));
      var widthT = this.obj.width() / (total + data.length) ;
      this.canvas.clearRect(0,0,this.obj.width(),this.obj.height());
      var ww = 0;
      var pos = 0;
      //console.log(this.obj.width(),'total',widthT, total)
      for(var i=0; i < data.length; i++){
        ww = widthT * data[i].w ;
        //if(ww >= 1){
          this.rects.push( this.rect(
            ww,
            (!i ? 0 : pos ),
            data[i].color,
            i,data[i])
          );
          pos += ww;
        //}
      }//for
    }

  };

  self.ploterchart = ploterchart.init(id);

  self.draw = function(data){
    data = self.parseData(data) || data;
    ploterchart.draw(data)
    $(window).on('resize',function(){
    //  console.log(ploterchart,data)
      ploterchart.rects = [];
      ploterchart.resize();
      ploterchart.draw(data);
    });

  };
  self.returnObj = function(){ return ploterchart };
  if(self.eventmouse) self.eventmouse();

}

Plot.prototype.eventmouse = function(){
  var plotchar = this.returnObj();
  //console.log(plotchar)
  var popup = $('<div class="popup">').appendTo(plotchar.obj.parent()).hide();
  var offsetX = plotchar.obj.offset().left;

  plotchar.obj.parent().on('mouseleave',function(){ popup.hide(); });
  plotchar.obj.parent().on('mousemove', function(e){
    mouseX = parseFloat(e.clientX ) - offsetX;
    mouseY = parseFloat(e.clientY ) - (plotchar.obj.offset().top - $('html, body').scrollTop());

    //console.log(mouseX)

    popup.css({top:mouseY,left:mouseX}).show();
    if(mouseX < 90) popup.addClass('left-corner'); else popup.removeClass('left-corner');
    if(mouseX > (plotchar.obj.width()-90)) popup.addClass('right-corner'); else popup.removeClass('right-corner');
    var oo = {};
    for(var o in plotchar.rects){
      oo = plotchar.rects[parseInt(o)];
      if( mouseX > oo.pos_x && mouseX < (oo.pos_x+oo.w) ){
        popup.html(
          '<div><span style="background-color:'+oo.data.color+'"></span>'+oo.data.ts_start+' <> '+oo.data.ts_end+'</div><div>'+oo.data.name+'</div>');
        break;
      }
    }

  });

}//endeventmouse

Plot.prototype.parseData = function(data_origin){
  var data = []
  var format_date = function(now){
    return [  now.getDate(), now.getMonth() + 1, now.getFullYear() ].join('-')+' '+
            [ now.getHours(), (now.getMinutes()<10?'0':'')+now.getMinutes(), +now.getSeconds() ].join(':') };

  for(var i=1;i < data_origin.ts.length; i++){

    data.push({
      w: parseInt(data_origin.ts[i] - data_origin.ts[i-1]),
      color:data_origin.color[i-1],
      data:{
        name:data_origin.name[i-1],
        ts_start:format_date(data_origin.ts[i-1]),
        ts_end:format_date(data_origin.ts[i]),
        color:data_origin.color[i-1]
      }})

    }

  return data;
};


/*
plot = new Plot('chart');
plot.draw(data);
*/
