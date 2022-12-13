export class LSystem {

    #axiom;
    #rules = {};
    #branchLen = 5;
    #branchLenVariance = 0;
    #angle = 30;
    // #generations = 2;
    currSentence = "";

    iterations = 3;
    theta = 20;
    thetaRandomness = 0;
    angle = 0;
    scale = 5;
    scaleRandomness = 0;
    constantWidth = true;
    deltarota = 300;

    background = "#000000";
    general = "#111faa";
    random = true;
    alpha = 0.8;

    constructor(rules, axiom) {
        this.#rules = rules;
        this.#axiom = axiom;
    }

    generate() {
        this.currSentence = this.#axiom;
        let newString = "";
        for (let n = 0; n < this.iterations; n++) {
            for (let i = 0; i < this.currSentence.length; i++) {
                const c = this.currSentence.charAt(i);
                if (this.#rules.hasOwnProperty(c)) {
                    newString += this.#rules[c];
                } else {
                    newString += c;
                }
            }
            this.currSentence = newString;
        }
    }

    /**
 * 
 * @param {*} geom 
 * @param {*} x_init 
 * @param {*} y_init 
 * @param {*} z_init 
 * @returns 
 */
    generateMesh(geom, x0, y0, z0) {
        // generateMesh2(geom, x_init, y_init, z_init) {
        let geometry = new THREE.Geometry();
        this.generate();
        let stackA = [];
        let stackV = [];

        let theta = this.theta * Math.PI / 180;
        let branchLen = this.scale;
        let angle = this.angle * Math.PI / 180;

        var axis_y = new THREE.Vector3(0, 1, 0);

        var startpoint = new THREE.Vector3(x0, y0, z0),
            endpoint = new THREE.Vector3();

        var vector_delta = new THREE.Vector3(branchLen, branchLen, 0);
        // let vector_delta = new THREE.Vector3(0.5, 1, 0);

        for (var j = 0; j < this.currSentence.length; j++) {
            if (this.scaleRandomness > 0) {
                branchLen = this.scale + (this.scaleRandomness * (Math.random() - 0.5))
                // vector_delta = new THREE.Vector3(branchLen, branchLen, 0);
            }
            var a = this.currSentence[j];
            switch (a) {
                case '+':
                    angle -= theta + (this.thetaRandomness * (Math.random() - 0.5) * 0.1);
                    break;
                case '-':
                    angle += theta + (this.thetaRandomness * (Math.random() - 0.5) * 0.1);;
                    break;
                case 'F':
                    var a = vector_delta.clone().applyAxisAngle(axis_y, angle);
                    // var a = vector_delta.clone().applyAxisAngle(axis_z, angle);
                    endpoint.addVectors(startpoint, a);

                    geometry.vertices.push(startpoint.clone());
                    geometry.vertices.push(endpoint.clone());

                    startpoint.copy(endpoint);
                    break;
                case '%':
                    break;
                case '[':
                    stackV.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));
                    stackA[stackA.length] = angle;
                    break;
                case ']':
                    let point = stackV.pop();
                    startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
                    angle = stackA.pop();
                    break;
            }
        }
        return geometry;
    }

    makeGeometry(x0, y0, z0) {
        // generateMesh(geom, x0, y0, z0) {
        let geometry = new THREE.Geometry();
        this.generate();
        let stackA = [];
        let stackV = [];
        let currentTransform = new THREE.Vector3(x0, y0, z0);
        let currentUp = new THREE.Vector3(0, 1, 0);
        // let currentUp = THREE.Vector4(0, 1, 0, 0);
        const x_axis = new THREE.Vector3(1, 0, 0);
        const y_axis = new THREE.Vector3(0, 1, 0);
        const z_axis = new THREE.Vector3(0, 0, 1);
        let thetaR = this.theta * Math.PI / 180;

        let currentYawMat = new THREE.Matrix3();
        let currentPitchMat = new THREE.Matrix3();
        let currentRollMat = new THREE.Matrix3();

        for (let j = 0; j < this.currSentence.length; j++) {
            let branchLen = this.scale + (this.scaleRandomness * (Math.random() - 0.5))
            // let transform_axis = new THREE.Vector3(branchLen, branchLen, 0);
            let a = this.currSentence[j];
            console.log(a);
            switch (a) {
                case 'F': {
                    let startPos = currentTransform.clone();
                    let trans = currentUp.normalize() * branchLen;
                    // currentTransform.add(trans);
                    // let endPos = currentTransform.clone();
                    let endPos = currentTransform.add(trans);
                    geometry.vertices.push(startPos);
                    geometry.vertices.push(endPos);
                    break;
                }
                case '+': {
                    currentUp.applyMatrix3(this.#generateYawMatrix(thetaR));
                    break;
                }
                case '-': {
                    currentUp.applyMatrix3(this.#generateYawMatrix(-thetaR));
                    break;
                }
                case '&': {
                    currentUp.applyMatrix3(this.#generatePitchMatrix(-thetaR));
                    break;
                }
                case '^': {
                    currentUp.applyMatrix3(this.#generatePitchMatrix(thetaR));
                    break;
                }
                case '/': {
                    currentUp.applyMatrix3(this.#generateRollMatrix(thetaR));
                    break;
                }
                case '\\': {
                    currentUp.applyMatrix3(this.#generateRollMatrix(-thetaR));
                    break;
                }
                case '|': {
                    currentUp.applyMatrix3(this.#generateYawMatrix(180));
                    break;
                }
                case '[': {
                    stackA[stackA.length] = currentUp;
                    stackV.push(new THREE.Vector3(currentTransform.x, currentTransform.y, currentTransform.z));
                    break;
                }
                case ']': {
                    var point = stackV.pop();
                    currentTransform.copy(new THREE.Vector3(point.x, point.y, point.z));
                    currentUp = stackA.pop();
                    break;
                }
                default:
                    break;
            }
        }
        return geometry;
    }

    #degrees_to_radians = (deg) => (deg * Math.PI) / 180.0;

    #generateYawMatrix(a) {
        // const a = this.#degrees_to_radians(theta);
        const cos_a = Math.cos(a);
        const sin_a = Math.sin(a);
        const m = new THREE.Matrix3();
        m.set(cos_a, sin_a, 0,
            -sin_a, cos_a, 0,
            0, 0, 1,);
        return m;
    }

    #generatePitchMatrix(a) {
        // const a = this.#degrees_to_radians(theta);
        const cos_a = Math.cos(a);
        const sin_a = Math.sin(a);
        const m = new THREE.Matrix3();
        m.set(cos_a, 0, -sin_a,
            0, 1, 0,
            sin_a, 0, cos_a);
        return m;
    }

    #generateRollMatrix(a) {
        // const a = this.#degrees_to_radians(theta);
        const cos_a = Math.cos(a);
        const sin_a = Math.sin(a);
        const m = new THREE.Matrix3();
        m.set(1, 0, 0,
            0, cos_a, -sin_a,
            0, sin_a, cos_a);
        return m;
    }

    // generateMeshOLD(geom, x_init, y_init, z_init) {
    //     // generateMesh2(geom, x_init, y_init, z_init) {
    //     let geometry = geom;
    //     this.generate();
    //     let stackX = []; let stackY = []; let stackZ = []; let stackA = [];
    //     let stackV = []; let stackAxis = [];

    //     let theta = this.theta * Math.PI / 180;
    //     let branchLen = this.scale;
    //     let angle = this.angle * Math.PI / 180;

    //     var x0 = x_init; var y0 = y_init; var z0 = z_init;
    //     var x; var y; var z;
    //     var rota = 0, rota2 = 0,
    //         deltarota = 18 * Math.PI / 180;
    //     var newbranch = false;
    //     var axis_x = new THREE.Vector3(1, 0, 0);
    //     var axis_y = new THREE.Vector3(0, 1, 0);
    //     var axis_z = new THREE.Vector3(0, 0, 1);
    //     var zero = new THREE.Vector3(0, 0, 0);
    //     var axis_delta = new THREE.Vector3(0, 1, 0),
    //         prev_startpoint = new THREE.Vector3();

    //     var startpoint = new THREE.Vector3(x0, y0, z0),
    //         endpoint = new THREE.Vector3();
    //     var bush_mark;
    //     var vector_delta = new THREE.Vector3(branchLen, branchLen, 0);
    //     // let vector_delta = new THREE.Vector3(0.5, 1, 0);

    //     for (var j = 0; j < this.currSentence.length; j++) {
    //         if (this.scaleRandomness > 0) {
    //             branchLen = this.scale + (this.scaleRandomness * (Math.random() - 0.5))
    //             // vector_delta = new THREE.Vector3(branchLen, branchLen, 0);
    //         }
    //         var a = this.currSentence[j];
    //         switch (a) {
    //             case '+':
    //                 angle -= theta + (this.thetaRandomness * (Math.random() - 0.5) * 0.1);
    //                 break;
    //             case '-':
    //                 angle += theta + (this.thetaRandomness * (Math.random() - 0.5) * 0.1);;
    //                 break;
    //             case 'F':
    //                 var a = vector_delta.clone().applyAxisAngle(axis_y, angle);
    //                 // var a = vector_delta.clone().applyAxisAngle(axis_z, angle);
    //                 endpoint.addVectors(startpoint, a);

    //                 geometry.vertices.push(startpoint.clone());
    //                 geometry.vertices.push(endpoint.clone());

    //                 // prev_startpoint.copy(startpoint);
    //                 startpoint.copy(endpoint);
    //                 axis_delta = new THREE.Vector3().copy(a).normalize();
    //                 rota += deltarota;// + (5.0 - Math.random()*10.0);
    //                 break;
    //             case 'L':
    //                 endpoint.copy(startpoint);
    //                 endpoint.add(new THREE.Vector3(0, branchLen * 1.5, 0));
    //                 var vector_delta2 = new THREE.Vector3().subVectors(endpoint, startpoint);
    //                 vector_delta2.applyAxisAngle(axis_delta, rota2);
    //                 endpoint.addVectors(startpoint, vector_delta2);

    //                 geometry.vertices.push(startpoint.clone());
    //                 geometry.vertices.push(endpoint.clone());

    //                 rota2 += 45 * Math.PI / 180;
    //                 break;
    //             case '%':
    //                 break;
    //             case '[':
    //                 stackV.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));
    //                 stackA[stackA.length] = angle;
    //                 break;
    //             case ']':
    //                 var point = stackV.pop();
    //                 startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
    //                 angle = stackA.pop();
    //                 break;
    //         }
    //         // bush_mark = a;
    //     }
    //     return geometry;
    // }
}
