# Water Toy Game

Uses Cannon Physics inside of a React Three Fiber scene to emulate the classic Water Toy game. 

The app is made up of a Scene created with Blender along with a few components:

**app:** sets up physical world, dynamic gravity  
**tank:** the scene with named geometry used to initialize the world colliders  
**actuators:** kinematic rigid bodies that push the rings up (one on each side)  
**rings:** rigid bodies made up of interlocked spheres (allows them to get "hooked")  
**gyroCamera:** camera handler based on accelerometer  

