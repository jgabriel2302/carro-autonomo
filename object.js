class SimulationObject {
    x = 0
    y = 0
    width = 0
    height = 0
    controls = null 
    speed = 0 
    acceleration = 0.09
    steer = 0.01
    maxSpeed = 10
    friction = 0.03
    angle = 0
    hasImage = false;
    constructor(x = 0, y = 0, width = 0, height = 0, color = "#000", imgsrc = null){
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.img = new Image();
        if(imgsrc != null) {
            this.img.src = imgsrc
            this.hasImage = true;
        }

        this.color = color;
    } 


    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }


    update(){
        this.polygon = this.#createPolygon();
    }

    draw(ctx){
        ctx.fillStyle=this.color;
        if(this.hasImage) {
            ctx.save();
            ctx.translate(this.x,this.y);
            ctx.rotate(-this.angle);
            ctx.drawImage(this.img,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
            for(let i=1;i<this.polygon.length;i++){
                ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
            }
            ctx.fill();
        }
    }
}