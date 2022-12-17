# The Garden
Created by Sebby's Little Helpers (Sebastian Park, Joel Manasseh, and Josh Hill)

The aim of our project was to make a simulation of natural elements and make it as pretty as possible. We resolved to make a cherry blossom scene with a pond and render it to look like it was hand painted. The main three components that went into the project were:

- Tree Simulation
- Water Simulation
- Stylization

# Code (Try me!)
We used THREE.js with HTML, CSS, and JS to create our website. 

****Please try it out!**** To run our code, you can open it with VSCode live server or visit it online at [cherryblossomgarden.netlify.app](https://cherryblossomgarden.netlify.app/).

## Tree and scene overview
The tree was generated using Stochastic, 3D Lindenmayer Systems and is adaptable for any given ruleset. The ruleset we used was based off of a cherry blossom tree. The user can freely customize and finetune the tree to their liking by adjusting the `Tree Settings` and `Leaf Settings` (e.g. lengthening/heightening the tree, thickening the tree, adjusting how much the tree tapers, etc.). They can create increasingly complex branching structures by increasing the "age" of the tree (the number of L-System iterations) and can introduce randomness by adjusting the `Stochasticity Settings`. We looked at [this example](https://codepen.io/mikkamikka/pen/DrdzVK) of L-Systems in ThreeJS for inspiration, but we realized that code was a 3D adaption of 2D L-Systems and was not extendable to 3D, so we had to look elsewhere, both for implementation guidance and ideas for different branching structures. The vocabulary for our L-Systems is universal (as it is taken from the Turtle Graphics Library) but we learned it from [this paper](https://www.bioquest.org/products/files/13157_Real-time%203D%20Plant%20Structure%20Modeling%20by%20L-System.pdf). The viewer can look at the tree from different angles by dragging around the camera and zooming in and out with the scroll wheel (or with two fingers on the trackpad). 

## Water
The water comes with ambient droplets periodically falling into the pond, but the user can also directly interact with the water by hovering their mouse over the mesh and causing ripples that not only interact with the mouse but also interact with each other and bounce against the rocks. The user can also "make a wish" and throw a penny at a random point the pond to create a ripple effect by pressing the space bar (the user also contributes to the hypothetical PondTree Fund). Water simulation inspired by [martinRenou](https://github.com/martinRenou/threejs-water).

## Stylization
The garden uses multiple render passes in order to achieve its painting-like visuals. Each mesh in the scene (including the tree and the water) is first rendered with cel-shading to give it a hand-shaded look. Then, certain meshes are duplicated and rendered completely black in a separate pass in order to render the outlines of objects. Then, noise is added to certain objects to make the paint look splotchy in appropriate areas. This effect is especially noticeable when the user looks at the blood moon in the background. Finally, a wrinkled paper texture is added on top of the entire scene along with some overall noise in order to make the scene look like it was painted on a surface. 

## Usage
- Press paint to start interacting with the scene
- Click and drag with one finger to rotate around the tree
- Scroll with two fingers to zoom (you have to zoom out to see the moon)
- Right click + drag or click and drag with two fingers to pan around the scene
- Play with the parameters to mess with the growth of your tree
  - Tree Settings messes specifically with how the tree is generated
  - Leaf Settings messes with the flowers
  - Stochasticity Settings introduces more randomness
- Hover your mouse over the pond to create ripples
- Press spacebar to throw a coin into the pond and make a wish

## Suggestions to make a pretty-looking scene
1. Increase the length to ~13
2. Increase thickness to ~7
3. Increase leaf size to ~4
4. Increase age to 4
5. Zoom out and pan upwards (by clicking and dragging upwards), drag with two fingers to adjust centerpoint

And you can get something like:

<img width="400" alt="Screen Shot 2022-12-15 at 2 34 32 AM" src="https://user-images.githubusercontent.com/51029066/207800156-b6a0814b-7214-41f0-a3e9-4b8cc6f6827a.png">

Here are some other shots that we enjoy:

<img width="400" alt="PNG image" src="https://user-images.githubusercontent.com/51029066/207800265-a964a5fd-f5df-4b67-9cf7-029ee9f0200f.png">

<img width="400" alt="IMG_5087" src="https://user-images.githubusercontent.com/51029066/207800314-aa00fa36-2d63-43ef-b199-38b053ab3c0c.png">

<img width="400" alt="PNG image" src="https://user-images.githubusercontent.com/51029066/207800424-c0d58e02-d40a-4a5b-8823-0db1d34108b8.png">


Just play around with the editor to your taste!
