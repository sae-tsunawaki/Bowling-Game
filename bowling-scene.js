import { defs, tiny } from "./examples/common.js";

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

import Lane from "./shapes/lane.js";
import Collision from "./shapes/collision.js";
import Ball from "./shapes/ball.js";
// import FrameState from '/game.js';
import ScoreBoard from "./scoreboard.js";
import Text_Line from "./examples/text-demo.js";

import { Game, GameState } from "./game.js ";
import { BowlingState } from "./game.js";

// The scene
export class Bowling_Scene_Shadow extends Scene {
  constructor() {
    super();
    this.lane = new Lane(Mat4.identity()); //center lane for game actions
    this.lanes = [
      new Lane(
        Mat4.identity().times(Mat4.translation(-1 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(-2 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(-3 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(-4 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(1 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(2 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(3 * this.lane.width, 0, 0))
      ),
      new Lane(
        Mat4.identity().times(Mat4.translation(4 * this.lane.width, 0, 0))
      ),
    ]; //static lanes for appearance

    this.ball = new Ball(
      this.lane.lane_len,
      this.lane.width,
      this.lane.floor_height
    );

    this.collision = new Collision(
      this.lane.pin_radius,
      this.lane.pin_height,
      this.ball.radius
    );

    //input handling
    this.player_height = 20;
    this.player_dist = 820;
    this.player_pos = vec3(0, this.player_height, this.player_dist);
    this.player_look = vec3(0, this.player_height, 0);
    this.player_transform;
    this.turnMode = false;
    //mouse
    this.mouse_pos;
    this.swipe_start;
    this.mouse_aim_enable = true;

    // bowling game machine
    this.game = new Game();
    this.num_knocked = 0;
    this.previous_standing = 10;

    // scoreboard
    this.scoreboard = new ScoreBoard();
    this.see_scoreboard = false;
  }

  make_control_panel() {
    this.key_triggered_button("Start", ["q"], () => {
      if (
        this.game.state === GameState.Start ||
        this.game.state === GameState.End
      ) {
        this.game.advance_state();
        this.game.frame_state.show();
        this.lane.reset_pins();
        this.previous_standing = 10;
      }
    });
    this.key_triggered_button("Show scoreboard", ["y"], () => {
      if (!this.ball.thrown || this.see_scoreboard) {
        this.see_scoreboard = !this.see_scoreboard;
      }
    });
    // this.key_triggered_button("Reset Pins", ["q"], () =>
    //     this.lane.reset_pins()
    // );
    // this.new_line();
    this.new_line();
    this.key_triggered_button("Reset Aim", ["e"], () => {
      this.reset_aim();
    });
    this.key_triggered_button("Toggle Mouse Aim", ["t"], () => {
      this.toggle_mouse_aim();
    });
    this.new_line();
    this.key_triggered_button("Left", ["a"], () => this.moveLeft());
    this.key_triggered_button("Right", ["d"], () => this.moveRight());
    this.new_line();
    this.key_triggered_button(
      "Toggle Move/Pivot",
      ["w"],
      () => (this.turnMode = !this.turnMode)
    );
    this.new_line();
    this.key_triggered_button(
      "Click and Drag to Spin and Throw",
      ["Mouse1"],
      () => {}
    );
    this.new_line();
  }

  moveRight() {
    if (this.ball.thrown || this.player_pos[0] >= 20) return;

    if (!this.turnMode) {
      this.player_pos = this.player_pos.plus(vec3(1, 0, 0));
      this.ball.move(vec3(1, 0, 0));
    }
    this.player_look = this.player_look.plus(vec3(1, 0, 0));
  }

  moveLeft() {
    if (this.ball.thrown || this.player_pos[0] <= -20) return;
    if (!this.turnMode) {
      this.player_pos = this.player_pos.plus(vec3(-1, 0, 0));
      this.ball.move(vec3(-1, 0, 0));
    }
    this.player_look = this.player_look.plus(vec3(-1, 0, 0));
  }

  reset_aim() {
    this.ball.move_exact([0, 0, 0]);
    this.player_pos = vec3(0, this.player_height, this.player_dist);
    this.player_look = vec3(0, this.player_height, 0);
    this.player_transform = Mat4.look_at(
      this.player_pos,
      this.player_look,
      vec3(0, 1, 0)
    );

    program_state.set_camera(this.player_transform);
  }

  toggle_mouse_aim() {
    this.mouse_aim_enable = !this.mouse_aim_enable;
  }

  render_startscreen(context, program_state) {
    program_state.set_camera(
      Mat4.look_at(vec3(0, 20, 820), vec3(0, 20, 0), vec3(0, 1, 0))
    );

    let string = "BOWLING";

    let pos = Mat4.translation(-90, 100, 1);
    this.scoreboard.shapes.text.set_string(string, context.context);
    this.scoreboard.shapes.text.draw(
      context,
      program_state,
      pos.times(Mat4.scale(21, 21, 21)),
      this.scoreboard.text_image
    );

    let str = "Press q to start!";

    let postext = Mat4.translation(-175, 30, 1);
    this.scoreboard.shapes.text.set_string(str, context.context);
    this.scoreboard.shapes.text.draw(
      context,
      program_state,
      postext.times(Mat4.scale(15, 15, 15)),
      this.scoreboard.text_image
    );
    postext.post_multiply(Mat4.translation(0, -0.06, 0));
  }

  render_scoreboard(context, program_state, display_endscreen = false) {
    program_state.set_camera(
      Mat4.look_at(vec3(0, 20, 820), vec3(0, 20, 0), vec3(0, 1, 0))
    );

    let string = "Score Board";

    let pos = Mat4.translation(-90, 160, 1);
    this.scoreboard.shapes.text.set_string(string, context.context);
    this.scoreboard.shapes.text.draw(
      context,
      program_state,
      pos.times(Mat4.scale(10, 10, 10)),
      this.scoreboard.text_image
    );
    pos.post_multiply(Mat4.translation(-300, -50, 0));

    let throwstr = "1    2    3    4    5    6    7    8    9    10     TOTAL";

    let g = this.game;

    // let num_pos = Mat4.translation(-230, 110, 1);
    this.scoreboard.shapes.text.set_string(throwstr, context.context);
    this.scoreboard.shapes.text.draw(
      context,
      program_state,
      pos.times(Mat4.scale(10, 10, 10)),
      this.scoreboard.text_image
    );
    pos.post_multiply(Mat4.translation(0, -50, 0));

    // add subscore
    let subScore = [];
    for (let i = 0; i < 10; i++) {
      // for (let j = 0; j < 2; j++) {
      subScore.push(g.frame_state.frames[i].join(" ").toString());
      // }
      // if (i == 9)
      //     subScore.push(g.frame_state.frames[i][2].toString());
    }
    subScore = subScore.join("  ");

    // let subScorePos = Mat4.translation(-240, 60, 1);
    this.scoreboard.shapes.text.set_string(subScore, context.context);
    this.scoreboard.shapes.text.draw(
      context,
      program_state,
      pos.times(Mat4.scale(10, 10, 10)),
      this.scoreboard.text_image
    );
    pos.post_multiply(Mat4.translation(0, -50, 0));

    // add score
    let score = [];
    for (let i = 0; i < 10; i++) {
      score.push(g.frame_state.shown_scores[i].toString().padEnd(4));
    }
    // push the final total score
    score.push(g.frame_state.shown_scores[9].toString());
    score = score.join("");

    this.scoreboard.shapes.text.set_string(score, context.context);
    this.scoreboard.shapes.text.draw(
      context,
      program_state,
      pos.times(Mat4.scale(13, 13, 13)),
      this.scoreboard.text_image
    );
    pos.post_multiply(Mat4.translation(200, -100, 0));

    if (display_endscreen) {
      let str = "Press q to play again.";

      // let postext = Mat4.translation(-220, 30, 1);
      this.scoreboard.shapes.text.set_string(str, context.context);
      this.scoreboard.shapes.text.draw(
        context,
        program_state,
        pos.times(Mat4.scale(12, 12, 12)),
        this.scoreboard.text_image
      );
    }
  }

  render_scene(context, program_state) {
    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;
    //get current ball and pin transforms
    let pin_transforms = this.lane.get_pin_transforms();
    let ball_transform = this.ball.transform;

    //get collisions for current positions
    let collisions = this.collision.get_collisions(
      ball_transform,
      pin_transforms
    );

    //resolve collisions in lane
    this.lane.resolve_collisions(collisions);

    //draw main lane
    this.lane.render(context, program_state);
    //draw other lanes
    for (let i = 0; i < this.lanes.length; i++) {
      this.lanes[i].render(context, program_state);
    }

    this.ball.update(dt);
    this.ball.render(context, program_state);
  }

  update_game() {
    if (this.ball.completed_throw) {
      console.log("Completed a throw.");

      let knocked = this.previous_standing - this.lane.count_standing_pins();
      let standing = this.lane.count_standing_pins();
      this.previous_standing = this.lane.count_standing_pins();

      this.game.advance_state(knocked);
      // this.lane.hide_fallen_pins();

      if (standing == 0 || this.game.frame_state.state == BowlingState.First) {
        // made a spare or strike in second shot of tenth frame
        // this.lane.reset_pins();
        this.reset = true;
        this.previous_standing = 10;
      }

      this.game.show();
      this.ball.completed_throw = false;
    }
  }

  display_scene(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      // Locate the camera here
      this.player_transform = Mat4.look_at(
        this.player_pos,
        this.player_look,
        vec3(0, 1, 0)
      );

      program_state.set_camera(this.player_transform);

      //this.input_manager.init(context, program_state);
      let canvas = context.canvas;
      canvas.addEventListener(
        "mousedown",
        function (a) {
          this.mouse_pos = vec3(a.clientX, 0, a.clientY);
          this.swipe_start = program_state.animation_time;
        }.bind(this),
        !1
      );

      canvas.addEventListener(
        "mouseup",
        function (a) {
          let new_mouse_pos = vec3(a.clientX, 0, a.clientY);
          let spin_speed = Math.max(
            333,
            1000 - (program_state.animation_time - this.swipe_start)
          );
          let spin_dir = new_mouse_pos.minus(this.mouse_pos);
          //console.log(spin_dir.norm());
          let dz = new_mouse_pos[2] - this.mouse_pos[2];
          let dx = (new_mouse_pos[0] - this.mouse_pos[0]) / 25;
          dx = Math.min(Math.max(-30, dx), 30);
          if (spin_dir.norm() != 0 && dz < 0)
            this.ball.start_throw(
              vec3(dx, 0, dz) /*this.player_look.minus(this.player_pos)*/,
              Math.min(
                Math.max(100, this.mouse_pos[2] - new_mouse_pos[2]),
                300
              ),
              new_mouse_pos.minus(this.mouse_pos),
              spin_speed
            );
        }.bind(this),
        !1
      );

      const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
        vec(
          (e.clientX - (rect.left + rect.right) / 2) /
            ((rect.right - rect.left) / 2),
          (e.clientY - (rect.bottom + rect.top) / 2) /
            ((rect.top - rect.bottom) / 2)
        );

      canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        /*
                // testing
                console.log("e.clientX: " + e.clientX);
                console.log("e.clientX - rect.left: " + (e.clientX - rect.left));
                console.log("e.clientY: " + e.clientY);
                console.log("e.clientY - rect.top: " + (e.clientY - rect.top));
                console.log("mouse_position(e): " + mouse_position(e));
                */
        if (this.mouse_aim_enable) {
          let mouseX = mouse_position(e)[0] * 15;
          this.ball.move_exact([mouseX, 0, 0]);
        }
      });
    }

    let ball_pos =
      this.ball.lane_length + this.ball.radius - this.ball.transform[2][3];
    // camera reset condition
    if (this.ball.transform[2][3] < -this.ball.radius) {
      setTimeout(() => {
        this.player_pos[2] = this.player_dist;
        this.player_transform = this.player_transform = Mat4.look_at(
          this.player_pos,
          this.player_look,
          vec3(0, 1, 0)
        );
        if (this.reset) {
          this.lane.reset_pins();
          this.reset = false;
        }
        this.lane.hide_fallen_pins();
      }, 3000);
    }
    // make camera track ball if ball is rolling in alley
    else if (this.ball.thrown) {
      this.player_transform = Mat4.look_at(
        this.player_pos.minus(vec3(0, 0, Math.min(650, ball_pos))),
        this.player_look,
        vec3(0, 1, 0)
      );
    }

    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    //Code for adding a light
    const light_position = vec4(-5, 5, -5, 1);
    // The parameters of the Light are: position, color, size
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    program_state.set_camera(this.player_transform);

    this.render_scene(context, program_state);
  }

  display(context, program_state) {
    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    //Code for adding a light
    const light_position = vec4(-5, 5, -5, 1);
    // The parameters of the Light are: position, color, size
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    switch (this.game.state) {
      case GameState.Start:
        // this.display_scene(context, program_state);
        // this.render_scoreboard(context, program_state, false);
        this.render_startscreen(context, program_state);
        break;
      case GameState.Bowling:
        if (this.see_scoreboard) {
          this.render_scoreboard(context, program_state);
        } else {
          this.display_scene(context, program_state);
        }
        this.update_game();
        break;
      case GameState.End:
        this.render_scoreboard(context, program_state, true);
        break;
    }
  }
}
