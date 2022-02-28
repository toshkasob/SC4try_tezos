class Point3D {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class gamePlanet {
    /**
     * Конструктор
     * @param {*} name - наименование планеты
     * @param {*} r - радиус планеты
     * @param {*} pos - положение в пространстве
     */
    constructor(name,r,pos) {
        this.name = name;                /// Наименование игровой планеты
        this.r = r;                      /// Радиус планеты
        this.pos = pos;                  /// Положение в пространстве
        this.vertexBuffer;               /// Буфер вершин планеты
        this.indexBuffer;                /// Буфер индексов планеты
        this.textureCoordsBuffer;        /// Буфер координат текстуры планеты
        this.planetTexture;              /// Текстура планеты
    }

    /**
     * Установление текстуры планеты
     */
    setTexture(url) {
        this.planetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.planetTexture);
        var image = new Image();
    
        image.onload = () => {
            this.handleTextureLoaded(image);
        }

        image.crossOrigin = "";
        image.src = url;
    
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        gl.uniform1i(shaderProgram.samplerUniform, 0);
    }

    handleTextureLoaded(image) {
        gl.bindTexture(gl.TEXTURE_2D, this.planetTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * Инициализация буферов планеты
     */
    initBuffers() {
        var vertices = [];
        var indices = [];
        var textureCoords = [ ];

        var latitudeBands = 30;
        var longitudeBands = 30;
        var radius = this.r;

        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta + this.pos.x;
                var y = cosTheta + this.pos.y;
                var z = sinPhi * sinTheta + this.pos.z;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                
                textureCoords.push(u);
                textureCoords.push(v);

                vertices.push(radius * x);
                vertices.push(radius * y);
                vertices.push(radius * z);
            }
        }

        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);

                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }
     
        // установка буфера вершин
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
 
        // создание буфера индексов
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indexBuffer.numberOfItems = indices.length;    

        // Создание буфера координат текстуры
        this.textureCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        this.textureCoordsBuffer.itemSize=2;
    }

    /**
     * Отрисовка планеты
     */
    draw() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute,this.textureCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.planetTexture);
        gl.enable(gl.DEPTH_TEST);
        gl.drawElements(gl.TRIANGLES, this.indexBuffer.numberOfItems, gl.UNSIGNED_SHORT,0);
    }
}

var gl;
var shaderProgram;

var angleX = 0.0;     // угол поворота вокруг оси X
var angleY = 0.0;     // угол поворота вокруг оси Y
var scale = 1.0;      // масштаб
            
var mvMatrix = mat4.create(); 
var pMatrix = mat4.create();
            
// установка шейдеров
function initShaders() {
	var fragmentShader = getShader(gl.FRAGMENT_SHADER, 'shader-fs');
	var vertexShader = getShader(gl.VERTEX_SHADER, 'shader-vs');
 
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
            
    // создания переменных uniform для передачи матриц в шейдер
    shaderProgram.MVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.ProjMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
}   
 
function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.ProjMatrix,false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.MVMatrix, false, mvMatrix);  
} 
            
// Функция создания шейдера
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
            
function setupWebGL() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    mat4.perspective(pMatrix, 1.04, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix,[0, 0, 0]);
    mat4.rotate(pMatrix,pMatrix, angleX, [0,1,0]); 
    mat4.rotate(pMatrix,pMatrix,angleY,[1,0,0]);
}

function Resize() {
    var canvas = document.getElementById("canvas3D"); 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", Resize); 
  
window.onload=function() {
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
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
                    
        document.addEventListener('keydown', handleKeyDown, false);

        initShaders();

        var positions = [ 
            new Point3D(0.0, 0.0, 0.0),
            new Point3D(0.0, 0.0, 5.0),
            new Point3D(0.0, 5.0, 0.0),
            new Point3D(0.0, 0.0, -5.0),
            new Point3D(0.0, -5.0, 0.0),
            new Point3D(-5.0, 0.0, 0.0)
        ];

        var object = [
             new gamePlanet("background",  10.0, positions[0]),
             new gamePlanet("Alpha_7GM",   2.1,  positions[1]), 
             new gamePlanet("Beta_3PR_FS", 0.9,  positions[2]),
             new gamePlanet("Gamma_2TT",   0.8,  positions[3]),
             new gamePlanet("Theta_345",   0.7,  positions[4]),
             new gamePlanet("Aplha_65TM",  1.2,  positions[5])
     ];

        for (let i=0; i< object.length; i++) {
            object[i].initBuffers();
        }
        object[0].setTexture("./images/stars.jpg");
        object[1].setTexture("./images/planet_1.jpg");
        object[2].setTexture("./images/planet_2.jpg");
        object[3].setTexture("./images/planet_3.jpg");
        object[4].setTexture("./images/planet_4.jpg");
        object[5].setTexture("./images/planet_5.jpg");

        (function animloop() {
            setupWebGL();
            setMatrixUniforms();
            for (let i=0; i < object.length; i++) {
                object[i].draw();
            }
            requestAnimFrame(animloop,canvas);
        }) (); 
    }
}

function handleKeyDown(e){
    switch(e.keyCode) {
        case 39:  // стрелка вправо
            angleX+=0.1;
        break;
        case 37:  // стрелка влево
            angleX-=0.1;
        break;
        case 40:  // стрелка вниз
            angleY+=0.1;
        break;
        case 38:  // стрелка вверх
            angleY-=0.1;
        break;
    }
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

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.x;
    lastMouseY = event.y;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }

    var newX = event.x;
    var newY = event.y;

    var dX = newX - lastMouseX;
    var dY = newY - lastMouseY;

    angleX = degToRad(dX/10);
    angleY = degToRad(dY/10);

    lastMouseX = newX;
    lastMouseY = newY;
}

function degToRad(degress) {
    return degress * Math.PI / 180;
}
