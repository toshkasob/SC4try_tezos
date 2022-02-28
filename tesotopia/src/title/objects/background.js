const canvas = document.getElementById("canvas3D");
const context = canvas.getContext("2d");

var img = new Image();
img.src = "../src/title/images/planets/stars.jpg";
console.log(img);

img.onload = function() {
    var pattern = context.createPattern(img, "repeat");
    context.fillStyle = pattern;
    context.fillRect(10, 10, canvas.width, canvas.height);
    context.strokeRect(10, 10, canvas.width, canvas.height);
}







