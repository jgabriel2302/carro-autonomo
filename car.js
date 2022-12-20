class Car {
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
    damaged = false
    useBrain = false
    constructor(x = 0, y = 0, width = 0, height = 0, controlType = Controls.controlTypes.DUMMY, maxSpeed = 10, color, sensorCount = 5, sensorGap = 2){
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.useBrain=controlType=="AI";

        this.controls = new Controls(controlType);
        if(controlType !== Controls.controlTypes.DUMMY){
            this.sensor = new Sensor(this, sensorCount, sensorGap);
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount, 12, 6, 4]
            );
        }
        this.maxSpeed = maxSpeed;

        this.img=new Image();
        this.img.src="cars/tile00" + rand(0, 5) + ".png"

        this.mask=document.createElement("canvas");
        this.mask.width=width;
        this.mask.height=height;

        const maskCtx=this.mask.getContext("2d");
        this.img.onload=()=>{
            maskCtx.fillStyle= color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
    }

    setDemageState(state = false){
        this.damaged = state;
    }

    #assessDamage(roadBorders = [], traffic = []){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let i=0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
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

    #move(){
        if(this.controls.forward)
            this.speed += this.acceleration;
        if(this.controls.reverse)
            this.speed -= this.acceleration;
        
        if(this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if(this.speed < -this.maxSpeed/2) this.speed = -this.maxSpeed/2;

        if(this.speed > 0) this.speed -= this.friction;
        if(this.speed < 0) this.speed += this.friction;

        if(Math.abs(this.speed) < this.friction) this.speed = 0;

        if(this.speed !== 0){
            const flip = this.speed > 0 ? 1: -1;
            if(this.controls.left)
                this.angle += this.steer*flip
            if(this.controls.right)
                this.angle -= this.steer*flip
        }

        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    update(roadBorders = [], traffic = []){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);

            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }

    // draw(ctx, color, drawSensor=false){
        
    //     if(this.sensor && drawSensor){
    //         this.sensor.draw(ctx);
    //     }

    //     if(this.damaged){
    //         ctx.fillStyle="#ff5";
    //     }else{
    //         ctx.fillStyle=color;
    //     }
    //     ctx.beginPath();
    //     ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
    //     for(let i=1;i<this.polygon.length;i++){
    //         ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
    //     }
    //     ctx.fill();

    // }

    draw(ctx, drawSensor=false){
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();

    }
}