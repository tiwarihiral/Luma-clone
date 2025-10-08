# Animated Landing Page

This is an interactive landing page with smooth animations and transitions. The page features a sequence of animations triggered by scrolling and clicking events.

## Project Structure

```
├── index.html
├── styles.css
├── script.js
├── README.md
└── images/
    ├── background.jpg
    ├── girl.png
    ├── property1.jpg
    ├── property2.jpg
    ├── property3.jpg
    ├── property4.jpg
    ├── property5.jpg
    ├── property1/
    │   ├── image1.jpg
    │   ├── image2.jpg
    │   ├── image3.jpg
    │   ├── image4.jpg
    │   └── image5.jpg
    ├── property2/
    │   └── ...
    ├── property3/
    │   └── ...
    ├── property4/
    │   └── ...
    └── property5/
        └── ...
```

## Required Images

1. `background.jpg` - A background image that will zoom in
2. `girl.png` - A transparent PNG image of a girl that will overlay the background
3. `property1.jpg` through `property5.jpg` - Thumbnail images for each property
4. For each property (1-5), create a folder with 5 images named `image1.jpg` through `image5.jpg`

## Features

- Initial animation with 5 small images that disappear
- Background image zoom effect
- Girl image overlay with higher z-index
- Scroll-triggered animations
- Interactive property selection
- Smooth transitions between property image sets

## Setup

1. Create the `images` directory and its subdirectories
2. Add all required images to their respective directories
3. Open `index.html` in a web browser

## Browser Support

This page uses modern CSS and JavaScript features. It is recommended to use the latest version of Chrome, Firefox, Safari, or Edge. 