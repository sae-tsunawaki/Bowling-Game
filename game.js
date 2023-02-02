export const GameState = {
  Start: "Start", // show title screen; ask to play?
  Bowling: "Bowling", // do the bowling; when this state is entered, begin the frame-state
  End: "End", // show score and conclusion; ask to play again?
};

export const BowlingState = {
  First: "First",
  Second: "Second",
  Third: "Third",
  Finish: "Finish",
};

const FRAME_COUNT = 10;
const PIN_COUNT = 10;

/*
 * 0 1 2 3
 *  4 5 6
 *   7 8
 *    9
 */

class FrameState {
  constructor() {
    this.reset();
  }

  reset() {
    // there are 10 frames; it goes from 0-9
    this.frame = 0;
    // each frame has 1-3 states (first and second); the tenth frame has potentially 3 if the player clears in two shots
    this.state = BowlingState.First;

    // each frame starts with 10 pins.
    this.standing_pins = 10;

    // each frame has information about what sort of shot was made at that point in time.
    // guide:
    // 0-9 is points, 'X' is strike and '-' is the empty slot after, '/' is spare. ' ' (space) is default
    //
    this.frames = [
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " "],
      [" ", " ", " "],
    ];

    // each frame has a score, which is calculated either instantly, or after the fact.
    this.frame_scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10
    // its full of undefined, because a frame has no score before getting a score; it's not 0.
    // a frame's score also includes the sum of the scores before it.

    // each frame has a score, but the sum of all prior frames' scores are added to it as well.
    this.shown_scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // the add_in_scores array holds how many points are queued up to be added. once frame i's add_in = 0, add add_in_scores[i] to frame_scores.
    this.add_in_scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10

    // in special circumstances, your score may need to add the points you earn from your next shots.
    // this is only 9 frames long, because this rule only applies for the first 9 frames.
    this.add_in = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 9
    // if you make a strike on add_in[this.frame], add 2 points to it; if you make a spare, add 1.
    // for every shot you take, sweep the add_in array and add your shot to that frame's score.  then subtract one from that frame's add_in.

    // in the tenth frame, getting a spare/strike gives you extra shots.
    this.extra_shots = false;
  }

  static new_game() {
    return new FrameState();
  }

  update_add_ins(n) {
    for (let i = 0; i != this.frame; i++) {
      if (this.add_in[i] > 0) {
        this.add_in[i] -= 1;
        this.add_in_scores[i] += n;
        if (this.add_in[i] == 0) {
          this.add_scores(i);
        }
      }
    }
  }

  add_scores(i) {
    this.frame_scores[i] = this.add_in_scores[i];
    this.shown_scores[i] =
      this.add_in_scores[i] + (i > 0 ? this.shown_scores[i - 1] : 0);
  }

  running_score(fr) {
    // if frame fr is being set, then all frames before fr are already set.
    let running_count = 0;
    for (let i = 0; i != fr; i++) {
      running_count += this.frame_scores[i];
    }
    return running_count;
  }

  next_frame() {
    this.frame++;
    this.standing_pins = PIN_COUNT;
  }

  // have: current frame and state
  // given: a score (how many pins were knocked down?)
  // yield: next frame/state
  advance(num_knocked) {
    // either the roll clears a frame, or it leaves it open.
    let next = false;
    this.standing_pins -= num_knocked;
    let cleared = this.standing_pins == 0;
    this.add_in_scores[this.frame] += num_knocked;
    if (this.frame != 9) {
      // it's not a special frame.  is it a spare or strike?
      switch (this.state) {
        case BowlingState.First:
          if (cleared) {
            this.frames[this.frame][0] = "X";
            this.frames[this.frame][1] = "_";

            this.add_in[this.frame] += 2;
            this.state = BowlingState.First;
            next = true;
          } else {
            this.frames[this.frame][0] = num_knocked.toString();
            this.state = BowlingState.Second;
          }
          break;
        case BowlingState.Second:
          if (cleared) {
            this.frames[this.frame][1] = "/";
            this.add_in[this.frame] += 1;
          } else {
            this.frames[this.frame][1] = num_knocked.toString();
            this.update_add_ins(num_knocked);
            this.add_scores(this.frame);
          }
          this.state = BowlingState.First;
          next = true;
          break;
      }
      this.update_add_ins(num_knocked);
      if (next) {
        this.next_frame();
      }
    } else {
      // tenth frame: is it a strike in first slot or spare in second?
      switch (this.state) {
        case BowlingState.First:
          // strike means you make two extra shots.
          if (cleared) {
            this.frames[this.frame][0] = "X";
            this.extra_shots = true;
          } else {
            this.frames[this.frame][0] = num_knocked.toString();
          }
          this.state = BowlingState.Second;
          break;
        case BowlingState.Second:
          // is a spare OR a strike. add the number knocked.
          if (this.extra_shots || cleared) {
            if (this.extra_shots && cleared) {
              // second strike
              this.frames[this.frame][1] = "X";
            } else if (cleared) {
              // spare
              this.frames[this.frame][1] = "/";
            }
            this.state = BowlingState.Third;
          } else {
            this.frames[this.frame][1] = num_knocked.toString();
            this.frames[this.frame][2] = " ";
            this.add_scores(this.frame);
            this.state = BowlingState.Finish;
          }
          break;
        case BowlingState.Third:
          if (cleared && num_knocked < 10) {
            // was a spare from the second shot
            this.frames[this.frame][2] = "/";
          } else if (cleared) {
            // is a strike
            this.frames[this.frame][2] = "X";
          } else {
            this.frames[this.frame][2] = num_knocked.toString();
          }
          this.add_scores(this.frame);
          this.state = BowlingState.Finish;
          break;
      }
      this.update_add_ins(num_knocked);
      if (cleared) {
        this.standing_pins = PIN_COUNT;
      }
    }
  }

  show() {
    console.log(
      `frame: ${this.frame}\n state: ${this.state}\n frames: ${this.frames}\n shown scores: ${this.shown_scores}\n frame scores: ${this.frame_scores}\n adds: ${this.add_in}\n add_scores: ${this.add_in_scores}`
    );
    if (this.state == BowlingState.Finish) {
      let sum = 0;
      for (let s of this.frame_scores) {
        sum += s;
      }
      console.log(`Total: ${sum}`);
    }
  }
}

export const Game = class Game {
  constructor() {
    this.state = GameState.Start;
    this.frame_state = undefined;
    // A game of Bowling has frames.  This frame state will keep track of score.
  }

  show() {
    this.frame_state.show();
  }

  advance_state(pins) {
    switch (this.state) {
      case GameState.Start:
        this.state = GameState.Bowling;
        this.frame_state = new FrameState();
        break;
      case GameState.Bowling:
        // pins is a number
        this.frame_state.advance(pins);
        if (this.frame_state.state == BowlingState.Finish) {
          // display score
          // take input - start again?
          this.state = GameState.End;
        }
        break;
      case GameState.End:
        this.state = GameState.Bowling;
        this.frame_state.reset();
        break;
    }
  }
};

// export default { Game, GameState, BowlingState }
