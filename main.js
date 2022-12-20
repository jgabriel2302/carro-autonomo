(function(){
    const CAR_COLOR = "#6107e8";
    const TRAFFIC_COLOR = ["00487c","267ebd","4bb3fd","458dbf","3e6680","217ec0","0496ff","0389e7","0382db","027bce","dbd3d4","d6c9c9","cad1da","c7d3dd","9fc5e4","77b6ea","577892","37393a","494b4c","5a5b5c","ea526f","e95f72","e76b74","df8d72","db9e71","d9a771","d7af70","c6a36d","b5966a","937d64"];

    const LANE_WIDTH = 70;
    const CAR_MAX_WIDTH = LANE_WIDTH * 0.42857142857;
    const CAR_MAX_HEIGHT = CAR_MAX_WIDTH * 1.666;
    let CANVAS_WIDTH = 500;

    let isPlaying = false;
    let isSetted = false;

    const play_btn = document.getElementById("play_btn")
    const save_btn = document.getElementById("save_btn")
    const discard_btn = document.getElementById("discard_btn")
    const reset_btn = document.getElementById("reset_btn")
    const brain_btn = document.getElementById("brain_btn")
    const config_btn = document.getElementById("config_btn")
    const config_dialog = document.getElementById("config_dialog")

    const margin = 10;
    const canvas = document.getElementById('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');

    const visualizer = document.getElementById('visualizer');
    visualizer.width = Math.min(window.innerWidth - canvas.width - margin, window.innerWidth / 2);
    visualizer.height = window.innerHeight;
    let isVisualizerShown = true;

    const visualizer_ctx = visualizer.getContext('2d');
    
    let road = null;
    let traffic = [];
    let cars = [];
    let bestCar = null;

    let configOptions = {
        carCount: 1,
        carSensorCount: 5,
        carSensorGap: 4,
        laneCount: 3,
        trafficCount: 7,
        selfTraining: 0
    }

    let showUpdates = true

    function config(carCount = 1, laneCount = 3, trafficCount = 7, carSensorCount = 5, sensorGap = 2){
        if(isPlaying) return;
        if(isSetted) return;

        CANVAS_WIDTH = LANE_WIDTH * laneCount;
        canvas.width = CANVAS_WIDTH;
        visualizer.width = Math.min(window.innerWidth - canvas.width - margin, window.innerWidth / 2);

        road = new Road(canvas.width/2,canvas.width*0.9, laneCount);
        traffic = new Array(trafficCount).fill(0).map(x=>
            Math.random() > 0.5?
            new Car(
                road.getLaneCenter(rand(0, laneCount - 1)),
                rand(-canvas.height * trafficCount, canvas.height / 2),
                CAR_MAX_WIDTH,
                CAR_MAX_HEIGHT,
                Controls.controlTypes.DUMMY,
                rand(1, 8),
                "#"+randArray(TRAFFIC_COLOR)
            ):
            new SimulationObject(
                road.getLaneCenter(rand(0, laneCount - 1)),
                rand(-canvas.height * trafficCount, canvas.height / 2),
                rand(CAR_MAX_WIDTH / 2, CAR_MAX_WIDTH),
                rand(CAR_MAX_WIDTH / 2, CAR_MAX_WIDTH),
                randArray(["#444", "#777", "#aaa"])
            )
        )
        
        traffic.push()
        
        cars = generateCars(carCount, laneCount, carSensorCount, sensorGap);
        bestCar = cars[0];
        if(localStorage.getItem("bestBrain")){
            for(let i=0;i<cars.length;i++){
                cars[i].brain=JSON.parse(
                    localStorage.getItem("bestBrain"));
                if(i!=0){
                    NeuralNetwork.mutate(cars[i].brain,0.1);
                }
            }
        }
        isSetted = true;
    }

    function save(){
        localStorage.setItem("bestBrain",
            JSON.stringify(bestCar.brain));
    }
    
    function discard(){
        localStorage.removeItem("bestBrain");
    }
    
    function generateCars(N = 1, laneCount = 3, carSensorCount = 5, sensorGap = 2){
        const cars=[];
        for(let i=1;i<=N;i++){
            cars.push(new Car(
                //road.getLaneCenter(rand(0, laneCount - 1)), 
                road.getLaneCenter(Math.floor(laneCount / 2)),
                100,
                CAR_MAX_WIDTH,
                CAR_MAX_HEIGHT,
                Controls.controlTypes.AI,
                10,
                CAR_COLOR,
                carSensorCount,
                sensorGap)
            );
        }
        return cars;
    }

    function animate(time){
        const nearTraffic = traffic.filter(c=>( Math.abs(c.y) - Math.abs(bestCar.y) ) < canvas.height * 2);

        for(let i=0;i<nearTraffic.length;i++){
            nearTraffic[i].update(road.borders, []);
        }

        for(let i=0;i<cars.length;i++){
            if(!cars[i].damaged)
                cars[i].update(road.borders,nearTraffic);
        }

        bestCar = cars.find(
            c=>c.y==Math.min(
                ...cars.map(c=>c.y)
            ) && !c.damaged);

        if(bestCar===undefined) bestCar = cars.find(
            c=>c.y==Math.min(
                ...cars.map(c=>c.y)
            ));

        canvas.width = CANVAS_WIDTH;
        canvas.height = window.innerHeight;

        ctx.save();
        ctx.translate(0, -bestCar.y + canvas.height/1.5);

        if(showUpdates) road.draw(ctx);

        for(let i=0;i<nearTraffic.length;i++){
            if(showUpdates) nearTraffic[i].draw(ctx);
        }

        ctx.globalAlpha=0.2;
        for(let i=0;i<cars.length;i++){
            if(( Math.abs(cars[i].y) - Math.abs(bestCar.y) ) > canvas.height  && !cars[i].damaged) {
                cars[i].setDemageState(true);
            }

            if(!cars[i].damaged && showUpdates)
                cars[i].draw(ctx);
            
        }

        ctx.globalAlpha=1;
        if(showUpdates) bestCar.draw(ctx, true);

        ctx.restore();


        visualizer.width = Math.min(window.innerWidth - canvas.width - margin, window.innerWidth / 2);
        visualizer.height = window.innerHeight;

        visualizer_ctx.lineDashOffset=-time/50;

        if(showUpdates) Visualizer.drawNetwork(visualizer_ctx, bestCar.brain);

        if(isPlaying)
            requestAnimationFrame(animate)

        if(!cars.some(x=>x.damaged===false)) {
            pause();
            showUpdates = true;
            if(configOptions.selfTraining === 1) {
                save();
                reset();
                play();
            }
        }
    }

    function play(){
        updateConfig();
        if(!isPlaying) {
            isPlaying = true;
            animate();
            play_btn.innerHTML = "⏸"
        } else {
            isPlaying = false;
            play_btn.innerHTML = "▶"
        }
    }

    function pause(){
        if(isPlaying) {
            isPlaying = false;
            play_btn.innerHTML = "▶"
        }
    }

    function reset(){
        const wasPlayingBefore = isPlaying? true: false;
        isPlaying = false;
        isSetted = false;
        play_btn.innerHTML = "▶"
        updateConfig();
        if(wasPlayingBefore) play();
    }

    function updateConfig(){
        config(configOptions.carCount, configOptions.laneCount, configOptions.trafficCount, configOptions.carSensorCount, 7-configOptions.carSensorGap);
    }


    
    save_btn.onclick = ()=>save();
    discard_btn.onclick = ()=>discard();
    play_btn.onclick = ()=>play();
    reset_btn.onclick = ()=>reset();
    brain_btn.onclick = ()=>{
        if(isVisualizerShown){
            isVisualizerShown = false;
            visualizer.style.display = 'none';
        } else {
            isVisualizerShown = true;
            visualizer.style.display = 'initial';
        }
    }

    config_btn.onclick = ()=>{
        pause()
        config_dialog.showModal();
    }

    config_dialog.addEventListener('close', () => {
        if(config_dialog.returnValue==="cancel") return;

        const data = new FormData(config_dialog.querySelector('form'));

        const value = treatObjectValues(Object.fromEntries(data.entries()));

        configOptions = value;

        reset()
    });

    config_dialog.showModal();
})()