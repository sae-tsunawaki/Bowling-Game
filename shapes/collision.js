import { defs, tiny } from "../examples/common.js";
const {
  vec3,
  vec4,
  vec,
  Vector3,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Shader,
  Texture,
  Scene,
} = tiny;


import Pin from './pin.js';
import Gutter from './gutter.js';

const collision_info = function(index, hit_vector){
	this.pin_index = index;
	this.hit_vector = hit_vector;
}

const transformToVec3 = function(t){
	return vec3(t[0][3], t[1][3], t[2][3]);
}
  
  //vec3 distance squared in xz plane
const xzDistSquared = function(a,b){
	return (a[0]-b[0])**2 + (a[2]-b[2])**2;
}

const Collision = class Collision {
  // Draw Lane using given transform as offset
  constructor(pin_radius, pin_height, ball_radius) {
    this.pin_radius = pin_radius;
	this.pin_height = pin_height;
	
	this.ball_radius = ball_radius;
	
	this.collisions = [];//array of collision_info
	
  }
  
  
  
  get_collisions(ball_transform, pin_transforms){
	//reset collisions
	this.collisions = [];
	
	// ball-> pin collisions
	let ball_loc = transformToVec3(ball_transform);
	let ball_pin_rs = (this.ball_radius + this.pin_radius)**2;
	for(let i = 0; i < pin_transforms.length; i++){
		let pin_loc = transformToVec3(pin_transforms[i]);
		
		if(xzDistSquared(ball_loc, pin_loc) < ball_pin_rs){
			//xz plane circle collision
			let hit_vector = pin_loc.minus(ball_loc);
			this.collisions.push(new collision_info(i, hit_vector));
		}
	}
	
	// pin-> pin collisions
	let pin2_rs = (this.pin_radius + this.pin_radius)**2;
	for(let i = 0; i < pin_transforms.length; i++){
		let pin_top = pin_transforms[i].times(Mat4.translation(0,0,this.pin_height * 0.85));
		let pin_loc = transformToVec3(pin_top);
		//check every other pin against this pin top
		for(let j = 0; j < pin_transforms.length; j++){
			if(i == j)
				continue;
			let pin_loc2 = transformToVec3(pin_transforms[j]);
			if(xzDistSquared(pin_loc, pin_loc2) < pin2_rs){
				//xz plane circle collision
				let hit_vector = pin_loc2.minus(pin_loc);
				this.collisions.push(new collision_info(j, hit_vector));
			}
		}
	}
	
	return this.collisions;
	
  }  
  
};

export default Collision;