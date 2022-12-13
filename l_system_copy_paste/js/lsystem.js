import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import { BufferGeometryUtils } from "//cdn.skypack.dev/three@0.130.1/examples/jsm/utils/BufferGeometryUtils.js";

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

    getPointInBetweenByLen(pointA, pointB, length) {

        var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
        return pointA.clone().add(dir);

    }

    /**
 * 
 * @param {*} geom 
 * @param {*} x_init 
 * @param {*} y_init 
 * @param {*} z_init 
 * @returns 
 */
    generateMesh(x0, y0, z0) {
        // generateMesh2(geom, x_init, y_init, z_init) {
        // let geometry = new THREE.Geometry();
        let geom = new THREE.BufferGeometry();
        let cylinders = [];
        this.generate();
        let directionStack = [];
        let vertexStack = [];

        let theta = this.theta * Math.PI / 180;
        let branchLen = this.scale;

        const x_axis = new THREE.Vector3(1, 0, 0);
        const y_axis = new THREE.Vector3(0, 1, 0);
        const z_axis = new THREE.Vector3(0, 0, 1);

        let startpoint = new THREE.Vector3(x0, y0, z0),
            endpoint = new THREE.Vector3();

        let currentUp = new THREE.Vector3(0, 1, 0);

        for (let i = 0; i < this.currSentence.length; i++) {
            if (this.scaleRandomness > 0) {
                //TODO: only need to calculate in certain places
                branchLen = this.scale + (this.scaleRandomness * (Math.random() - 0.5));
            }
            // theta = this.theta + (this.thetaRandomness * (Math.random() - 0.5));
            let a = this.currSentence[i];
            switch (a) {
                case 'F':
                    let a = currentUp.clone().multiplyScalar(branchLen);
                    endpoint.addVectors(startpoint, a);

                    // geometry.vertices.push(startpoint.clone());
                    // geometry.vertices.push(endpoint.clone());
                    const segment = new THREE.CylinderGeometry(1, 1, branchLen, 5);
                    const position = this.getPointInBetweenByLen(startpoint, endpoint, branchLen / 2);
                    const quaternion = new THREE.Quaternion()
                    const cylinderUpAxis = new THREE.Vector3(0, 1, 0)
                    quaternion.setFromUnitVectors(cylinderUpAxis, currentUp)
                    segment.applyQuaternion(quaternion)
                    // segment.lookAt(currentUp);
                    // segment.rotateX(currentUp.x);
                    // segment.rotateX(currentUp.y);
                    // segment.rotateZ(currentUp.z);
                    segment.translate(position.x, position.y, position.z);


                    cylinders.push(segment);
                    startpoint.copy(endpoint);
                    break;
                case '+':
                    currentUp = currentUp.clone()
                        .applyAxisAngle(z_axis, -theta).normalize()
                    break;
                case '-':
                    currentUp = currentUp.clone()
                        .applyAxisAngle(z_axis, theta).normalize()
                    break;
                case '&': {
                    currentUp = currentUp.clone()
                        .applyAxisAngle(x_axis, theta).normalize() //TODO: CHECK IF NEGATIVE
                    break;
                }
                case '^': {
                    currentUp = currentUp = currentUp.clone()
                        .applyAxisAngle(x_axis, -theta).normalize()
                    break;
                }
                case '>': {
                    currentUp = currentUp = currentUp.clone()
                        .applyAxisAngle(y_axis, theta).normalize()
                    break;
                }
                case '<': {
                    currentUp = currentUp = currentUp.clone()
                        .applyAxisAngle(y_axis, -theta).normalize()
                    break;
                }
                case '[':
                    vertexStack.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));
                    directionStack[directionStack.length] = currentUp.clone();
                    break;
                case ']':
                    let point = vertexStack.pop();
                    startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
                    currentUp = directionStack.pop();
                    break;
            }
        }
        // return geometry;
        geom = BufferGeometryUtils.mergeBufferGeometries(cylinders, false);
        // geom.computeBoundingBox();
        return geom;
        // return cylinders;
    }
}