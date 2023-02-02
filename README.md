# CS174A_Bowling

## Final Group Project for Computer Graphics Course CS174A

## Usage:

On Windows:  
1. cd to project directory in command prompt  
2. python server.py  
3. visit localhost:8000 in a browser (chrome has been tested).  
4. Knock down some bowling pins  

## Controls
Q - Start/Replay
Y - Check scoreboard
E - Reset Aim
T - Toggle Mouse Aim
A - Move/Pivot Left  
D - Move/Pivot Right  
W - Toggle between Move/Pivot Modes  
Click and Drag - Throw and Spin Ball  
  

## What to Expect  

- Ball will throw in the direction of the camera upon completing a Click and Drag  
- Ball will spin in the direction of the Click and Drag  
- Ball spin speed will increase with faster Click and Drags  
- Ball throw direction and spin direction will converge over time  
- Ball on Pin and Pin on Pin collision will result in the collidee Pin falling over in 
the direction away from the collider  
