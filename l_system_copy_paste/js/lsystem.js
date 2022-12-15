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
    thickness = 1;
    thicknessDecay = 0.9;
    wiggleRandomness = 0;
    lenDecay = 1;
    leafSize = 1;
    leafDecay = false;
    pivot = 90;
    deltarota = 300;

    trunkColor = 0xffffff;
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
        for (let n = 0; n < this.iterations; n++) {
            let newString = "";
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
        let leaves = [];
        let directionStack = [];
        let vertexStack = [];
        let thicknessStack = [];
        let lenStack = [];

        let theta = this.theta * Math.PI / 180;
        let branchLen = this.scale;

        const x_axis = new THREE.Vector3(1, 0, 0);
        const y_axis = new THREE.Vector3(0, 1, 0);
        const z_axis = new THREE.Vector3(0, 0, 1);

        let startpoint = new THREE.Vector3(x0, y0, z0),
            endpoint = new THREE.Vector3();

        let currentUp = new THREE.Vector3(0, 1, 0);
        let currentThickness = 1;
        let lenMultiplier = 1;

        for (let i = 0; i < this.currSentence.length; i++) {
            // if (this.scaleRandomness > 0) {
            //TODO: only need to calculate in certain places
            branchLen = lenMultiplier
                * (this.scale + (this.scaleRandomness * (Math.random() - 0.5)));
            // }
            const randomizedXUp = currentUp.x
                + (this.wiggleRandomness * (Math.random() - 0.5));
            const randomizedYUp = currentUp.y
                + (this.wiggleRandomness * (Math.random() - 0.5));
            const randomizedZUp = currentUp.z
                + (this.wiggleRandomness * (Math.random() - 0.5));

            currentUp = new THREE.Vector3(randomizedXUp, randomizedYUp, randomizedZUp).normalize();
            // theta = this.theta + (this.thetaRandomness * (Math.random() - 0.5));
            let a = this.currSentence[i];
            switch (a) {
                case 'F':
                    let a = currentUp.clone().multiplyScalar(branchLen);
                    endpoint.addVectors(startpoint, a);

                    // geometry.vertices.push(startpoint.clone());
                    // geometry.vertices.push(endpoint.clone());
                    let baseThickness = this.thickness * currentThickness;
                    currentThickness *= this.thicknessDecay;
                    let tipThickness = this.thickness * currentThickness;

                    // tipThickness = this.thickness;
                    // baseThickness = this.thickness;

                    const segment = new THREE.CylinderGeometry(tipThickness,
                        baseThickness, branchLen, 16);
                    const position = this.getPointInBetweenByLen(startpoint, endpoint, branchLen / 2);
                    const quaternion = new THREE.Quaternion()
                    // const cylinderUpAxis = new THREE.Vector3(0, 1, 0)
                    quaternion.setFromUnitVectors(y_axis, currentUp)
                    segment.applyQuaternion(quaternion)
                    // segment.lookAt(currentUp);
                    // segment.rotateX(currentUp.x);
                    // segment.rotateX(currentUp.y);
                    // segment.rotateZ(currentUp.z);
                    segment.translate(position.x, position.y, position.z);

                    cylinders.push(segment);

                    const elbow = new THREE.SphereGeometry(tipThickness, 16, 16);
                    elbow.translate(endpoint.x, endpoint.y, endpoint.z);
                    cylinders.push(elbow);
                    startpoint.copy(endpoint);
                    lenMultiplier *= this.lenDecay;
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
                case '[': {
                    vertexStack.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));
                    directionStack[directionStack.length] = currentUp.clone();
                    lenStack.push(lenMultiplier);
                    thicknessStack.push(currentThickness);
                    break;
                }
                case ']': {
                    let point = vertexStack.pop();
                    startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
                    currentUp = directionStack.pop();
                    lenMultiplier = lenStack.pop();
                    currentThickness = thicknessStack.pop();
                    break;
                }
                case 'R': {
                    const leafScale = this.leafDecay ? currentThickness * 10 : 1;
                    const leaf = new THREE.CircleGeometry(
                        this.leafSize * leafScale, 16);
                    const quaternion = new THREE.Quaternion()
                    quaternion.setFromUnitVectors(y_axis, currentUp)
                    leaf.applyQuaternion(quaternion)
                    leaf.lookAt(currentUp);
                    leaf.translate(endpoint.x, endpoint.y, endpoint.z);
                    leaves.push(leaf);
                    break;
                }
            }
        }
        // return geometry;
        geom = BufferGeometryUtils.mergeBufferGeometries(cylinders, false);
        // geom.computeBoundingBox();
        return [geom, leaves];
        // return cylinders;
    }
}
