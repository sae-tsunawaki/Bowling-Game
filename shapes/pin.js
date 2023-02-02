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
const {
  Cube,
  Axis_Arrows,
  Textured_Phong,
  Phong_Shader,
  Basic_Shader,
  Subdivision_Sphere,
  Tetrahedron,
  Surface_Of_Revolution,
} = defs;
import {
  Color_Phong_Shader,
  Shadow_Textured_Phong_Shader,
  Depth_Texture_Shader_2D,
  Buffered_Texture,
  LIGHT_DEPTH_TEX_SIZE,
} from "../examples/shadow-demo-shaders.js";


const Pin = class Pin extends Shape {
  // Build a donut shape.  An example of a surface of revolution.
  constructor(
    columns,
    texture_range = [
      [0, 1],
      [0, 1],
    ]
  ) {
    super("position", "normal", "texture_coord");
    //heights and diameters of 10-pin bowling pin (in inches but we can scale later?)
    this.heights = [
      0,
      0.125,
      0.75,
      2.25,
      3.375,
      4.5,
      5.875,
      7.25,
      8.625,
      9.375,
      10.0,
      10.875,
      11.75,
      12.625,
      13.5, //official bowling pin measurements
      14.25,
      14.75,
      14.95,
      15.0,
    ]; //nice values to round top
    this.diameters = [
      2.031,
      2.25,
      2.828,
      3.906,
      4.51,
      4.75,
      4.563,
      3.703,
      2.472,
      1.965,
      1.797,
      1.87,
      2.094,
      2.406,
      2.547, //official bowling pin measurements
      2.206,
      1.274,
      0.659,
      0,
    ]; //nice values to round top
	
	this.radius = Math.max(...this.diameters) / 2;
	this.height = this.heights[this.heights.length-1];
	
    let circle_points = [];
    for (let i = 0; i < this.diameters.length; i++) {
      circle_points.push(vec3(this.diameters[i] / 2, 0, 0));
    }
    for (let i = 0; i < circle_points.length; i++) {
      circle_points[i] = Mat4.translation(0, 0, this.heights[i])
        .times(circle_points[i].to4(1))
        .to3();
    }
    defs.Surface_Of_Revolution.insert_transformed_copy_into(this, [
      this.heights.length,
      columns,
      circle_points,
      texture_range,
    ]);
    //add flat bottom
    defs.Regular_2D_Polygon.insert_transformed_copy_into(
      this,
      [1, columns],
      Mat4.scale(
        this.diameters[0] / 2,
        this.diameters[0] / 2,
        this.diameters[0] / 2
      )
    );
	// pin texture
	  this.material = new Material(new Textured_Phong(), {
		color: color(0, 0, 0, 1),
		ambient: 0.75,
		diffusivity: 1,
		specularitiy: 1,
		texture: new Texture("../assets/pin.png", 'NEAREST'),
	  });
	  
	  
	  
  }
  
  
  
    render(context, program_state, model_transform){
		this.draw(context, program_state, model_transform, this.material);
	} 
  
};

export default Pin;