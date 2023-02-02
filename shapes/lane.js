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

import Pin from './pin.js';
import Gutter from './gutter.js';

const Pin_Info = function(index, initial_transform) {
    this.transform = initial_transform;
    this.index = index;
    this.should_render = true;
    this.is_standing = true;
    this.hit_vector = null;
    this.tip_angle = 0;
}

const Lane = class Lane {
    // Draw Lane using given transform as offset
    constructor(model_transform) {
        this.offset_transform = model_transform;
        this.shapes = {
            sphere: new Subdivision_Sphere(6),
            cube: new Cube(),
            //square_2d: new Square(),
            pin: new Pin(25),
            gutter: new Gutter(20, 20),
        };
        this.materials = {
            hardwood: new Material(new Textured_Phong(), {
                color: color(0, 0, 0, 1),
                ambient: 0.5,
                diffusivity: 1,
                specularitiy: 1,
                texture: new Texture("assets/hardwood.png", 'NEAREST'),
            }),
            ucla: new Material(new Textured_Phong(), {
                color: color(0, 0, 0, 1),
                ambient: 0.5,
                diffusivity: 1,
                specularitiy: 1,
                texture: new Texture("assets/ucla.png", 'NEAREST'),
            }),
        };
        //TODO remove hard coded constants
        this.pin_radius = this.shapes.pin.radius;
        this.pin_height = this.shapes.pin.height;
        this.lane_len = 63 * 12; // 60 ft foul line to pin, 3ft for pins
        this.box_len = 3 * 12; // 3 ft to cover pins
        this.box_h = this.pin_height * 1.5; // see what looks good
        this.top_box_h = this.box_h * 2; // see what looks good
        this.top_box_len = 4 * 12; //4 ft hang over box sides 1 ft?
        this.floor_len = 30;
        this.floor_height = 1;

        this.width = 32 * 2;



        //using official pin numbering 
        // 1 in front, then left to right going back
        this.pin_default_transforms = [
            this.offset_transform //1
            .times(Mat4.translation(0, this.floor_height / 2, 18 * 3 ** 0.5 + this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //2
            .times(Mat4.translation(12 * 1 - 18, this.floor_height / 2, 12 * 3 ** 0.5 + this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //3
            .times(Mat4.translation(12 * 2 - 18, this.floor_height / 2, 12 * 3 ** 0.5 + this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //4
            .times(Mat4.translation(6 + 12 * 0 - 18, this.floor_height / 2, 6 * 3 ** 0.5 + this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //5
            .times(Mat4.translation(6 + 12 * 1 - 18, this.floor_height / 2, 6 * 3 ** 0.5 + this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //6
            .times(Mat4.translation(6 + 12 * 2 - 18, this.floor_height / 2, 6 * 3 ** 0.5 + this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //7
            .times(Mat4.translation(12 * 0 - 18, this.floor_height / 2, this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //8
            .times(Mat4.translation(12 * 1 - 18, this.floor_height / 2, this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //9
            .times(Mat4.translation(12 * 2 - 18, this.floor_height / 2, this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),
            this.offset_transform //10
            .times(Mat4.translation(12 * 3 - 18, this.floor_height / 2, this.pin_radius))
            .times(Mat4.rotation(Math.PI / 2, -1, 0, 0)),

        ];

        this.pin_info = [
            new Pin_Info(0, this.pin_default_transforms[0]),
            new Pin_Info(1, this.pin_default_transforms[1]),
            new Pin_Info(2, this.pin_default_transforms[2]),
            new Pin_Info(3, this.pin_default_transforms[3]),
            new Pin_Info(4, this.pin_default_transforms[4]),
            new Pin_Info(5, this.pin_default_transforms[5]),
            new Pin_Info(6, this.pin_default_transforms[6]),
            new Pin_Info(7, this.pin_default_transforms[7]),
            new Pin_Info(8, this.pin_default_transforms[8]),
            new Pin_Info(9, this.pin_default_transforms[9]),
        ];

        this.static_transforms = {
            lane: this.offset_transform
                .times(Mat4.translation(0, 0, this.lane_len / 2))
                .times(Mat4.scale(21, this.floor_height / 2, this.lane_len / 2)),

            floor: this.offset_transform
                .times(Mat4.translation(0, 0, this.lane_len + this.floor_len / 2))
                .times(Mat4.scale(32, this.floor_height / 2, this.floor_len / 2)),

            ceiling: this.offset_transform
                .times(Mat4.translation(0, this.box_h + this.top_box_h + 0.5, (this.lane_len + this.floor_len - this.top_box_len) / 2 + this.top_box_len))
                .times(Mat4.scale(32, this.floor_height / 2, (this.lane_len + this.floor_len - this.top_box_len) / 2)),

            box_left: this.offset_transform
                .times(Mat4.translation(-31, this.box_h / 2, this.box_len / 2))
                .times(Mat4.scale(0.5, this.box_h / 2, this.box_len / 2)),

            box_right: this.offset_transform
                .times(Mat4.translation(31, this.box_h / 2, this.box_len / 2))
                .times(Mat4.scale(0.5, this.box_h / 2, this.box_len / 2)),

            wall_left: this.offset_transform
                .times(Mat4.translation(-31, 1, this.lane_len / 2))
                .times(Mat4.scale(1, 2, this.lane_len / 2)),

            wall_right: this.offset_transform
                .times(Mat4.translation(31, 1, this.lane_len / 2))
                .times(Mat4.scale(1, 2, this.lane_len / 2)),

            gutter_left: this.offset_transform
                .times(Mat4.translation(-25.25, 0, this.lane_len / 2))
                .times(Mat4.scale(4.25, -1, this.lane_len)),

            gutter_right: this.offset_transform
                .times(Mat4.translation(25.25, 0, this.lane_len / 2))
                .times(Mat4.scale(4.25, -1, this.lane_len)),

            box_top: this.offset_transform
                .times(Mat4.translation(0, this.box_h + (this.top_box_h / 2), this.top_box_len / 2))
                .times(Mat4.scale(32, this.top_box_h / 2, this.top_box_len / 2)),
        }
    }

    count_standing_pins() {
        let sum = 0;
        for (let p of this.pin_info) {
            if (p.is_standing) {
                sum++;
            }
        }
        return sum;
    }

    reset_pins() {
        for (let i = 0; i < this.pin_info.length; i++) {
            this.pin_info[i] = new Pin_Info(i, this.pin_default_transforms[i]);
        }
    }

    hide_fallen_pins() {
        for (let i = 0; i < this.pin_info.length; i++) {
            if (!this.pin_info[i].is_standing) {
                this.pin_info[i].should_render = false;
            }
        }
    }

    get_pin_transforms() {
        let transforms = [];
        for (let i = 0; i < this.pin_info.length; i++) {
            transforms[i] = this.pin_info[i].transform;
        }
        return transforms;
    }

    resolve_collisions(collisions) {
        for (let i = 0; i < collisions.length; i++) {
            this.hit_pin(collisions[i].pin_index, collisions[i].hit_vector);
        }
    }

    hit_pin(index, hit_vector) {

        if (!this.pin_info[index].is_standing)
            return;
        let hv = vec3(hit_vector[0], 0, hit_vector[2]);
        this.pin_info[index].is_standing = false;
        this.pin_info[index].hit_vector = hit_vector;

        //transform such that pin y-axis (pointing straight back of alley) is aligned with hit vector
        //this requires a z axis rotation
        //pin y-axis at start has global vector (0,0,-1)

        let cos = hv.normalized().dot(vec3(1, 0, 0));
        let angle = Math.acos(cos);
        this.pin_info[index].transform = this.pin_info[index].transform
            .times(Mat4.rotation(angle, 0, 0, 1));

    }

    render_pins(context, program_state) {
        //apply rotation to falling pins up to 90 degrees
        const t = program_state.animation_time / 1000,
            dt = program_state.animation_delta_time / 1000;
        for (let i = 0; i < this.pin_info.length; i++) {
            if (!this.pin_info[i].is_standing &&
                this.pin_info[i].tip_angle < Math.PI / 2 + Math.PI / 32) {

                //increment angle
                let delta_angle = dt;
                this.pin_info[i].tip_angle += delta_angle;

                //rotate by delta angle about point about one pin radius away in y direction

                this.pin_info[i].transform = this.pin_info[i].transform
                    .times(Mat4.translation(0, this.pin_radius + 1, 0))
                    .times(Mat4.rotation(delta_angle, -1, 0, 0))
                    .times(Mat4.translation(0, -(this.pin_radius + 1), 0));

            }
        }


        for (let i = 0; i < this.pin_info.length; i++) {
            if (this.pin_info[i].should_render) {
                this.shapes.pin.render(context, program_state, this.pin_info[i].transform);
            }
        }
    }

    render_static(context, program_state) {
        //lane
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.lane,
            this.materials.hardwood
        );
        //left wall
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.wall_left,
            this.materials.hardwood
        );
        //right wall
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.wall_right,
            this.materials.hardwood
        );
        //left gutter Custom shape therefore use render and no need to pass material
        this.shapes.gutter.render(
            context,
            program_state,
            this.static_transforms.gutter_left
        );
        //right gutter Custom shape therefore use render and no need to pass material
        this.shapes.gutter.render(
            context,
            program_state,
            this.static_transforms.gutter_right
        );
        //floor
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.floor,
            this.materials.hardwood
        );
        //ceiling
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.ceiling,
            this.materials.hardwood
        );
        //box left
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.box_left,
            this.materials.hardwood
        );
        //box right
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.box_right,
            this.materials.hardwood
        );
        //box top
        this.shapes.cube.draw(
            context,
            program_state,
            this.static_transforms.box_top,
            this.materials.ucla
        );
    }

    render(context, program_state) {
        //render static shapes/parts
        this.render_static(context, program_state);
        this.render_pins(context, program_state);

    }



};

export default Lane;