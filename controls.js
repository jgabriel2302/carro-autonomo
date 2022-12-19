class Controls {
    static controlTypes = { DUMMY: "DUMMY", KEYS: "KEYS", AI: "AI" };
    forward = false
    left = false
    right = false
    reverse = false
    constructor(type){
        switch(type){
            case Controls.controlTypes.KEYS:
                this.#addKeyboardListeners();
                break;
            case Controls.controlTypes.DUMMY:
                this.forward=true;
                break;
        }
    }

    #addKeyboardListeners(){
        document.addEventListener("keydown", e=>{
            switch (e.key.toUpperCase()) {
                case "ARROWLEFT":
                case "A":
                    this.left = true;
                    break;
                case "ARROWRIGHT":
                case "D":
                    this.right = true;
                    break;
                case "ARROWUP":
                case "W":
                    this.forward = true;
                    break;
                case "ARROWDOWN":
                case "S":
                    this.reverse = true;
                    break;
            }
        });
        document.addEventListener("keyup", e=>{
            switch (e.key.toUpperCase()) {
                case "ARROWLEFT":
                case "A":
                    this.left = false;
                    break;
                case "ARROWRIGHT":
                case "D":
                    this.right = false;
                    break;
                case "ARROWUP":
                case "W":
                    this.forward = false;
                    break;
                case "ARROWDOWN":
                case "S":
                    this.reverse = false;
                    break;
            }          
        });
    }
}