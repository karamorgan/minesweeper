# Minesweeper

This project is a pirate-themed reskin of classic Minesweeper. Dig strategically around the map to help a forgetful captain find their buried treasure, but be careful to avoid the mines protecting the loot.

This is adapted from code I originally wrote when first learning JavaScript, before I got to CSS and HTML. The coding environment I was using at the time included the p5.js library, which is based on the HTML5 Canvas API. Rather than embedding p5 in my code (or using a hosted version), I've since converted this project to vanilla Canvas. I've also refactored the structure using the Revealing Module Design Pattern, to be more organized and maintainable.

This project was an exercise in object-oriented programming. Game data is encapsulated using private properties and methods of classes, and game logic is encapsulated using private variables, methods, and closures in IIFE modules. Future versions may explore deeper into abstraction, inheritance, and polymorphism by extending the gameboard class to additional classes of games beyond Minesweeper.

**Check out the demo [here](https://karamorgan.github.io/minesweeper/)!**

---

## Technical Overview

This project was built using HTML, CSS, and vanilla JavaScript. Game structure includes two classes to instantiate each gameboard and each tile, and two module objects to handle game logic and canvas operations.

The window load event calls an initialization task in the canvas module, which loads all images from the assets folder. Promise fulfillment ensures that no attempts to draw tiles are made before images have completed loading. A new gameboard is then instantiated according to user-selected difficulty level, a canvas of appropriate size is drawn, and the draw method called for each tile. The first click calls a method on the gameboard object, which places mines randomly (not within one tile from the first click).

Click events are handled by the game logic module, which flips tiles and assesses win or lose conditions. A flood fill algorithm employing breadth-first search and a queue for storage is used to flip all empty tiles connected to a clicked tile. Because click events are detected on a canvas element representing the entire gameboard, rather than individual elements for each tile, the target tile is determined based on cursor location and gameboard dimensions. The gameboard instance, which stores tile information in a private array, can then be queried for the relevant tile info, encapsulating game data while facilitating interaction between different objects/modules in the program.

---

## Forward Work

### Extend the Gameboard Class
I've posted a couple of simple game projects, including Minesweeper and a [memory matching game](https://github.com/karamorgan/matching-game). Although they each involve differing mechanics, they also largely reuse the same structure of gameboard class. In the future, I plan to integrate these into a larger project that uses one gameboard class with all of the common game setup mechanics such as sizing the board and generating tiles. This class can then be extended to classes with methods unique to each game, providing further practice in abstraction, inheritance, and polymorphism.

### Imrovements in Responsive Design
This version does currently include some elements of responsive design, including media queries to resize text, a function to redraw the gameboard on a window resize event, and a function to adjust canvas resolution based on device pixel ratio. But while tile size is dynamically adjusted based on the user-selected level and the dimensions of their viewport, the webpage layout is currently fixed. Contents will get squished once viewport aspect ratio drops below around ~1.2:1, meaning this game is not yet optimized for mobile.

### Optimize for Mobile
This will require reworking the webpage layout, likely converting the toolbar from the vertical to a horizontal orientation and relocating it above or below the gameboard. Some fairly involved media query styling will need to be implemented in the CSS, detecting the user's device type and/or screen aspect ratio. 

### Verify Browser Compatibility
I developed this code using Firefox, and I have superficially tested it in Chrome and Safari. All major browser current versions now support Canvas API, but this game may not function on older browsers.

### Optimize Asset Handling
Not a major concern for such a small project, but definitely a consideration if I were to scale up the project. One way to optimize asset handling may be to replace the PNG images with SVG files, which are lighter weight and infinitely scalable. Additionally, large production-level applications would use a CDN to handle images, rather than a local repository. This was not an option I considered for this small personal project, but it would optimize image delivery for size, format, and quality.

---

## Skills Practiced
* Revealing Module Pattern
* Object-Oriented Programming
    * Class elements: methods and fields, public and private, static and instance
    * Encapsulation, abstraction

---

## Challenges Encountered (and Solved)
* Asynchronicity of loading images, program attempting to draw before loading complete
* Blurry canvas due to high pixel density of retina display (Canvas API does not discern between "physical" and "virtual" pixels as CSS does)
* Variable scope and privacy (passing needed data between modules while otherwise limiting exposure)

---

## More on drawing with Canvas API vs. CSS styling

I used Canvas API for this project because I wanted to represent tiles as object instances for practice with OOP concepts, and draw to the canvas based on the properties of those objects. Were that not my goal, I could have instead represented the tiles as individual HTML elements that require DOM manipulation and CSS styling. There are advantages and disadvantages to both approaches. Here are some additional factors to consider in other circumstances:

### Shape Complexity
If you're trying to use Canvas to draw any shape more complex than a rectangle, it can be a pain. But if you're trying to use HTML elements and CSS styling to draw complex shapes, it can get way uglier, requiring many rules to control border radii, pseudo-selectors, and transforms. This version only requires drawing rectangles, but my first cut originally drew the mines and flags too, until I found a good source for the icons as PNGs (see credits). In that circumstance, and any others where complex shapes are required, Canvas API was far easier to use than CSS styling.

### Performance
Manipulating the DOM is inefficient and resource-intensive because the browser has to reflow the content after every change. It is not optimized for creating dynamic user interfaces. In this particular application, it probably wouldn't be a big deal, given that there wouldn't be high traffic in creating and removing many elements, so it would mostly just involve event listeners and flip animations. But I tend to be reluctant to dynamically manipulate large quantities of DOM elements as part of my main functionality.

### Animations
If animation is required in your drawing, consider their complexity. Simple animations from a known State A to a known State B are a piece of cake with CSS. But when more control or flexibility is required for complex animations, CSS may not be up to the job.

### Accessibility
Because a canvas element is just a bitmap, content is not out-of-the-box compatible with accessibility tools like semantic HTML is. Pixels within a canvas element do not scale, and may become illegibly blurry with sceen magnification. Text is not compatible with screen readers by default, although workarounds to add alt text in other ways do exist.

---

## Credits

Images provided under CC BY 3.0 from https://game-icons.net by the following artists:
* Delapouite
* Lorc
* Skoll

Icons provided open-source from http://fontawesome.io by Dave Gandy

---

Thanks for taking the time to stop by! Please consider reaching out with any comments, questions, suggestions to improve my code, or good jokes.