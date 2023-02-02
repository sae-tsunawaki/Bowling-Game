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

const transformToVec3 = function(t) {
    return vec3(t[0][3], t[1][3], t[2][3]);
};


const Ball = class Ball {
    // Draw Lane using given transform as offset
    constructor(lane_length, lane_width, lane_height) {
        this.lane_length = lane_length;
        this.lane_width = lane_width;
        this.lane_height = lane_height;

        this.radius = 4.25;

        this.reset_transform = Mat4.identity().times(
            Mat4.translation(
                0,
                this.radius + lane_height / 2,
                lane_length + this.radius
            )
        );

        this.transform = this.reset_transform;

        this.shape = new Subdivision_Sphere(6);

        this.material = new Material(new Textured_Phong(), {
            color: color(0, 0, 0, 1),
            ambient: 1,
            diffusivity: 1,
            specularitiy: 1,
            texture: new Texture("assets/ball.png", "NEAREST"),
        });
        this.throw_dir = vec3(0, 0, 0);
        this.spin_dir = vec3(0, 0, -1);
        this.throw_speed = 0;
        this.spin_speed = 0;
        this.x_angle = 0;
        this.thrown = false;
        this.completed_throw = false;
    }

    reset_ball() {
        this.transform = this.reset_transform;
        this.throw_dir = vec3(0, 0, 0);
        this.spin_dir = vec3(0, 0, -1);
        this.throw_speed = 0;
        this.spin_speed = 0;
        this.x_angle = 0;
        this.thrown = false;
    }

    move(a) {
        this.transform = this.transform.times(Mat4.translation(a[0], a[1], a[2]));
        this.reset_transform = this.transform;
    }

    move_exact(a) {
        if (!this.thrown) {
            this.transform = this.reset_transform;
            this.transform = Mat4.translation(a[0], a[1], a[2]).times(this.transform);
        }
    }

    start_throw(throw_dir, throw_speed, spin_dir, spin_speed) {
        if (this.thrown) return;
        this.thrown = true;
        this.throw_dir = vec3(throw_dir[0], 0, throw_dir[2]).normalized();
        this.spin_dir = vec3(spin_dir[0], 0, spin_dir[2]).normalized();
        this.throw_speed = throw_speed;
        this.spin_speed = spin_speed;
    }

    update(dt) {
        if (!this.thrown) return;
        //if gutter freeze x moves
        let position = transformToVec3(this.transform);

        if (position[0] > 25.25 || position[0] < -25.25) {
            this.throw_dir[0] = 0;
            this.spin_dir[0] = 0;
        }
        // if out the back
        // wait some time before resetting and setting throw complete flag
        if (position[2] < -this.radius) {
            position[1] = 1000;
        }
        if (position[2] < -this.radius - 750) {
            this.completed_throw = true;
            this.reset_ball();
            return;
        }

        //set next position and rotation
        position = position.plus(this.throw_dir.times(dt * this.throw_speed));
        let da = (this.spin_speed / 1000) * (Math.PI * 2 * 10 * dt);
        //console.log(da);
        this.x_angle += da;
        if (this.x_angle > Math.PI * 2) {
            this.x_angle -= Math.PI * 2;
        }

        //set transform
        this.transform = Mat4.identity().times(
            Mat4.translation(position[0], position[1], position[2])
        );
        //angle to get z axis to spin direction (rotate about y)
        let cos = this.spin_dir.normalized().dot(vec3(0, 0, -1));
        if (cos) {
            let angle = Math.acos(cos);
            if (this.spin_dir[0] > 0) {
                angle *= -1;
            }
            this.transform = this.transform.times(Mat4.rotation(angle, 0, 1, 0));
        }

        //set spin angle (x rotation)
        this.transform = this.transform.times(
            Mat4.rotation(this.x_angle, -1, 0, 0)
        );

        //add small part of spin direction to throw direction
        this.throw_dir = this.throw_dir.plus(
            this.spin_dir.times(this.spin_dir.norm() * 0.0005)
        );

        //add small part of throw direction to spin direction
        this.spin_dir = this.spin_dir.plus(
            this.throw_dir.times(this.throw_dir.norm() * 0.005)
        );

        //reduce throw and spin speed a bit (friction)
        //this.throw_dir = this.throw_dir.times(0.9999);
        //this.spin_dir = this.spin_dir.times(0.9999);
    }

    render(context, program_state) {
        this.shape.draw(
            context,
            program_state,
            this.transform.times(Mat4.scale(this.radius, this.radius, this.radius)),
            this.material
        );
    }
};

export default Ball;