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

// 2D shape, to display the texture buffer
const Square = class Square extends tiny.Vertex_Buffer {
  constructor() {
    super("position", "normal", "texture_coord");
    this.arrays.position = [
      vec3(0, 0, 0),
      vec3(1, 0, 0),
      vec3(0, 1, 0),
      vec3(1, 1, 0),
      vec3(1, 0, 0),
      vec3(0, 1, 0),
    ];
    this.arrays.normal = [
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
    ];
    this.arrays.texture_coord = [
      vec(0, 0),
      vec(1, 0),
      vec(0, 1),
      vec(1, 1),
      vec(1, 0),
      vec(0, 1),
    ];
	
	this.material = new Material(new Depth_Texture_Shader_2D(), {
      color: color(0, 0, 0.0, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
      texture: null, // TODO: import Light Texture?
    });
	
  }
  
  render(context, program_state, model_transform){
		this.draw(context, program_state, model_transform, this.material);
	} 
};

export default Square;