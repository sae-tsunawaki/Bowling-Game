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


 


const Input_Manager = class Input_Manager {
  // Draw Lane using given transform as offset
  constructor() {
	 this.requestingMR = false;
	 this.requestingML = false;
	 this.requestingTR = false;
	 this.requestingTL = false;
	 this.swipe_vector = null;

	
  }
  
  init(context, program_state){
	let x, y, x1, y1;
    x = y = x1 = y1 = 0;
	let recordedTime = new Date().getTime();
    
	let canvas = context.canvas;
		canvas.addEventListener(
		  "mousedown",
		  function (a) {
			  console.log('d')
			
		  }.bind(this),
		  !1
		);
		
		canvas.addEventListener(
		  "mouseup",
		  function (a) {
			  console.log('upp')
			if(a.key == "a" || a.key == "A"){
				this.requestingML = false;
			}
		  }.bind(this),
		  !1
		);
	//canvas.addEventListener(
    //  "mousedown",
    //  function (a) {
    //    //this.moveEnable = false; // prevent ball movement while mouse held down
    //    50 < new Date().getTime() - recordedTime &&
    //      ((x = a.clientX),
    //      (y = a.clientY),
    //      (recordedTime = new Date().getTime()));
    //  }.bind(this),
    //  !1
    //);
    //canvas.addEventListener(
    //  "mouseup",
    //  function (a) {
    //    //this.moveEnable = true;
    //    x1 = x;
    //    y1 = y;
    //    x = a.clientX;
    //    y = a.clientY;
    //    const velos = dir(x, x1, y, y1);
    //    //if (this.throwEnable) {
    //      this.dz = Math.max(Math.min(-velos[2], 300), 150); // 150 <= dz <= 300
    //      this.dx = (7 / 120) * Math.min(velos[0], 0.6 * this.dz);
    //      recordedTime = new Date().getTime();
    //      this.startTime = program_state.animation_time;
    //    //}
    //  }.bind(this),
    //  !1
    //);
  }
  
  //detectSwipe(context, program_state) {
  //  const THRESHOLD = 15;
  //  let x, y, x1, y1;
  //  x = y = x1 = y1 = 0;
  //  
	//function dir(x, x1, y, y1) {
	//  let a = x - x1;
	//  let b = y - y1;
	//  if (!(parseInt(Math.sqrt(a * a + b * b), 10) < THRESHOLD)) {
	//	return vec3(a, 0, b);
	//	/* 
	//	// testing, good idea to try this
	//	if (x1 - x > Math.abs(y - y1)) {
	//	  return "left";
	//	}
	//	if (x - x1 > Math.abs(y - y1)) {
	//	  return "right";
	//	}
	//	if (y1 - y > Math.abs(x - x1)) {
	//	  return "up";
	//	}
	//	if (y - y1 > Math.abs(x - x1)) {
	//	  return "down";
	//	}
	//  } else {
	//	return "none";
	//	*/
	//	// filter out non-upward swipes
	//	//if (y - y1 < 0) {
	//	//  // probably need to scale this for more realistic speeds
	//	//  
	//	//}
	//  }
	//}
  //
  //
  //  let recordedTime = new Date().getTime();
  //  let canvas = context.canvas;
  //  canvas.addEventListener(
  //    "touchstart",
  //    function (a) {
  //      50 < new Date().getTime() - recordedTime &&
  //        ((x = parseInt(a.changedTouches[0].pageX, 10)),
  //        (y = parseInt(a.changedTouches[0].pageY, 10)),
  //        (recordedTime = new Date().getTime()));
  //    },
  //    !1
  //  );
  //  canvas.addEventListener(
  //    "touchend",
  //    function (a) {
  //      x1 = x;
  //      y1 = y;
  //      x = parseInt(a.changedTouches[0].pageX, 10);
  //      y = parseInt(a.changedTouches[0].pageY, 10);
  //      const velos = dir(x, x1, y, y1);
  //      this.dx = velos[0];
  //      this.dz = velos[2];
  //      recordedTime = new Date().getTime();
  //    }.bind(this),
  //    !1
  //  );
  //  
  //}
  
};

export default Input_Manager;