import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';

export class Coin {

	constructor() {
	  this.GRAV = .005;
	  const coinHeadMaterial = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('./img/heads.jpg')
	  });
	  const coinTailMaterial = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('./img/tails.jpg')
	  });
  
	  const materials = [
		coinHeadMaterial,
		coinHeadMaterial,
		coinTailMaterial
	  ]
	  const geometry = new THREE.CylinderGeometry(.125, .125, 0.01, 50);
	  this.mesh= new THREE.Mesh(geometry, materials);
	  this.mesh.position.set(0, -5, 0);
	  this.mesh.rotation.y = Math.PI / 2;
	}
  
	toss() {
		this.mesh.visible = true;
		this.mesh.position.set(0, 2, 8);
		this.vel = new THREE.Vector3(Math.random() * 0.025 - 0.0125, 0.2, Math.random() * 0.025 - 0.0125-0.1);

	}

	update() {
		
		if (this.mesh.position.y < -1) {
			this.mesh.visible = false;
		} else {
			this.mesh.visible = true;
			this.mesh.rotation.x -= Math.PI / 18;
			this.vel.y -= this.GRAV;
			this.mesh.position.set(this.mesh.position.x + this.vel.x, this.mesh.position.y + this.vel.y, this.mesh.position.z + this.vel.z);
			
			if (this.mesh.position.y <= 0 && this.mesh.position.y - this.vel.y + this.GRAV> 0)
				return this.mesh.position;
		}
		return false;
	}

	canToss() {
		return !this.mesh.visible;
	}
  }