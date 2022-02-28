export default class gamePlanet {
    constructor(image,r,xPos,yPos,zPos) {
        this.xPos = xPos;           /// x-начальная позиция
        this.yPos = yPos;           /// y-начальная позиция
        this.zPos = zPos;           /// z-начальная позиция
        this.image = new Image();   /// Текстура поверхности
        this.image.src = image;     /// Источник текстуры поверхности 
        this.r = r;                 /// Радиус планеты
    }
}