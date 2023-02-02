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

const Gutter = class Gutter extends Surface_Of_Revolution {
  constructor(
    rows,
    columns,
    texture_range = [
      [0, 1],
      [0, 1],
    ]
  ) {
    super(
      rows,
      columns,
      Vector3.cast([1, 0, 0.5], [1, 0, -0.5]),
      texture_range,
      Math.PI
    );
	
	this.material = new Material(new defs.Phong_Shader(), {
        ambient: 0.2,
        diffusivity: 0.8,
        specularity: 0.8,
        color: color(0.4, 0.4, 0.4, 1),
      });
	
  }
  
  render(context, program_state, model_transform){
		this.draw(context, program_state, model_transform, this.material);
	} 
  
};

export default Gutter;