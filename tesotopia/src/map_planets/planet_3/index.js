var gl;
var shaderProgram;
var vertexBuffer;
var indexBuffer;
var texture;
var textureCoordsBuffer;

function initShaders() {
   var fragmentShader = getShader(gl.FRAGMENT_SHADER, 'shader-fs-2d');
   var vertexShader = getShader(gl.VERTEX_SHADER, 'shader-vs-2d');

   shaderProgram = gl.createProgram();

   gl.attachShader(shaderProgram, vertexShader);
   gl.attachShader(shaderProgram, fragmentShader);

   gl.linkProgram(shaderProgram);
     
   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
       alert("Не удалось установить шейдеры");
   }
     
   gl.useProgram(shaderProgram);

   shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
   gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute); 
   shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "aVertexTextureCoords");
   gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);
}

function getShader(type,id) {
   var source = document.getElementById(id).innerHTML;
   var shader = gl.createShader(type);
   gl.shaderSource(shader, source);
   gl.compileShader(shader);
  
   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
       alert("Ошибка компиляции шейдера: " + gl.getShaderInfoLog(shader));
       gl.deleteShader(shader);   
       return null;
   }

   return shader;  
}

function initBuffers() {
   var vertices =[
      -1.0, -1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      1.0, -1.0, 0.0
   ];

   vertexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
   vertexBuffer.itemSize = 3;
 
   var indices = [0, 1, 2, 2, 3, 0];
   indexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
   indexBuffer.numberOfItems = indices.length; 

   // Координаты текстуры
   var textureCoords = [
      0.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0
   ];

   // Создание буфера координат текстуры
   textureCoordsBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
   textureCoordsBuffer.itemSize=2;
}

function draw() {    
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
   gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, textureCoordsBuffer.itemSize,  gl.FLOAT, false, 0, 0);
   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.drawElements(gl.TRIANGLES, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT,0);
}

function setupWebGL()
{
   var canvas = document.getElementById("canvas3D");
   canvas.onmousedown=function (ev) {
      click(ev,gl,canvas);
  };
   gl.clearColor(0.0, 0.0, 0.0, 1.0);  
   gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);         
   gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}

function setTextures(){
   texture = gl.createTexture();
   gl.bindTexture(gl.TEXTURE_2D, texture);
   var image = new Image();
 
   image.onload = function() {
      handleTextureLoaded(image, texture);
      setupWebGL();
      draw();
   }
   image.src = "./images/planet_3.jpg";
    
   shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
   gl.uniform1i(shaderProgram.samplerUniform, 0);
}

function handleTextureLoaded(image, textr) {
   gl.bindTexture(gl.TEXTURE_2D, textr);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   gl.bindTexture(gl.TEXTURE_2D, null);
}

function Resize() {
   var canvas = document.getElementById("canvas3D"); 
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
}

function GamePlanet3() {
   return (
      window.onload=function(){
 
         var canvas = document.getElementById("canvas3D");
         try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
         }
         catch(e) {}
        
         if (!gl) {
            alert("Ваш браузер не поддерживает WebGL");
         }
         if(gl){
            Resize();

            gl.viewportWidth = window.innerWidth;
            gl.viewportHeight = window.innerHeight;

            initShaders();
            initBuffers();

            (function animloop(){
               setTextures();
               window.requestAnimFrame(animloop,canvas);
            })();
         }
     }
   );
}

export {GamePlanet3}; 

let points = []; // массив точек мыши
 
function click(ev,gl,canvas) {
   let u_Draw = gl.getUniformLocation(shaderProgram, 'u_Draw');
   let u_colorDraw = gl.getUniformLocation(shaderProgram, 'u_colorDraw');
		
	gl.uniform1f(u_Draw, 1.0);
   gl.uniform4fv(u_colorDraw, [1.0, 0.0, 0.0, 1.0]); 

   let a_Position=gl.getAttribLocation(shaderProgram,'a_Position');
   
   // Экран системы координат в систему координат WebGL
   let x = ev.clientX; // X координата щелчка мышью
   let y = ev.clientY; // координата Y щелчка мыши

   let rect=ev.target.getBoundingClientRect();

   x = ((x-rect.left) -canvas.width / 2) / (canvas.width / 2); // Будьте осторожны, чтобы не использовать canvas.style.width
   y=(canvas.height/2-(y-rect.top))/(canvas.height/2);
   points.push(x);
   points.push(y);
   gl.clear (gl.COLOR_BUFFER_BIT); // Очистить точки, нарисованные ранее

   for(let i=0;i<points.length;i+=2){
      // Перерисовать точки
      gl.vertexAttrib3f(a_Position,points[i],points[i+1],0.0);
      gl.drawArrays(gl.POINTS,0,1)
   }

   gl.uniform1f(u_Draw, 0.0);
}


// настройка анимации
window.requestAnimFrame = (function() {
   return  window.requestAnimationFrame  || 
   window.webkitRequestAnimationFrame    || 
   window.mozRequestAnimationFrame       || 
   window.oRequestAnimationFrame         || 
   window.msRequestAnimationFrame        ||
   function(callback, element) {
       return window.setTimeout(callback, 1000/60);
   };
})();