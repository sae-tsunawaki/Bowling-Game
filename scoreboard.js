import { defs, tiny } from "./examples/common.js";
import { Text_Line } from "./examples/text-demo.js";
// Pull these names into this module's scope for convenience:
const {
    vec3,
    vec4,
    vec,
    Vector,
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

export class ScoreBoard { // Text_Demo is a scene with a cube, for demonstrating the Text_Line utility Shape.
    constructor() {
        this.shapes = { board: new defs.Square(), text: new Text_Line(100) };
        // Don't create any DOM elements to control this scene:
        this.widget_options = { make_controls: false };
        const texture = new defs.Textured_Phong(1);

        // To show text you need a Material like this one:
        this.text_image = new Material(texture, {
            ambient: 1,
            diffusivity: 0,
            specularity: 0,
            texture: new Texture("assets/text.png"),
        });
    }
}

export default ScoreBoard;