function lerp(A,B,t){
    return A+(B-A)*t;
}

function getIntersection(A,B,C,D){ 
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);
    
    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t
            }
        }
    }

    return null;
}

function polysIntersect(poly1, poly2){
    for(let i=0;i<poly1.length;i++){
        for(let j=0;j<poly2.length;j++){
            const touch=getIntersection(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if(touch){
                return true;
            }
        }
    }
    return false;
}

function getRGBA(value){
    const alpha = Math.abs(value);
    const R = value<0?0:Math.floor(alpha*200) + 55 - 30;
    const G = Math.floor(R*4);
    const B = Math.floor(R/2);
    return "rgba("+R+","+G+","+B+","+1+")";
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randArray(arr) {
    return arr[rand(0, arr.length - 1)];
}

function treatObjectValues(object){
    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
            const v = object[key];
            if(/\d/g.test(v)){
                object[key] = Number(object[key]);
            }
        }
    }
    return object;
}