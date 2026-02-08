# Coffee Website - Responsive HTML, CSS & JavaScript with GSAP Animations

## 📋 Overview
A fully responsive coffee website with modern design, smooth GSAP animations, and interactive coffee variety cards.

## 🎨 Sections Included
1. **Hero Section** - Eye-catching landing with call-to-action buttons and animated entrance
2. **About Section** - Information about the coffee shop with scroll animations
3. **Coffee Varieties Section** - 6 premium coffee cards with detailed info, ratings, and prices
4. **Menu Section** - 6 categories of products with hover effects
5. **Testimonials Section** - Customer reviews with profile images
6. **Gallery Section** - 6 beautiful coffee images with hover effects
7. **Contact Section** - Contact form and business information
8. **Footer** - Quick links and social media

## 🚀 Features
- ✨ **GSAP Animations** - Professional scroll-triggered animations throughout
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- 🎯 **Interactive Cards** - Coffee variety cards with hover effects and animations
- 🔄 **Smooth Transitions** - Butter-smooth scrolling and page transitions
- 🎨 **Modern Design** - Contemporary UI with beautiful color scheme
- 🍃 **Floating Elements** - Subtle floating coffee bean background animation
- 📊 **Coffee Details** - Strength ratings, roast levels, and pricing
- 🎭 **Micro-interactions** - Button clicks, hover effects, and ripple animations

## 🎬 GSAP Animation Features
- Hero section entrance animation
- Scroll-triggered reveal animations
- Parallax scrolling effects
- Card hover animations
- Floating coffee bean background
- Interactive button effects with ripple
- Smooth form submission feedback
- **🌀 Morphing Effects:**
  - SVG blob morphing in hero background
  - Card background shape morphing
  - Text squash/stretch on hover
  - Button border radius morphing
  - Gallery image shape morphing (rectangle to circle)
  - Logo pulsing and color shifting
  - Image breathing/scaling effect

## 🌀 Morphing Effects Explained

### 1. **Hero Background Blobs**
- 3 animated SVG blobs that continuously morph shapes
- Float around the hero section
- Create dynamic, organic background

### 2. **Coffee Card Backgrounds**
- Each card has a unique morphing blob behind the product image
- Smooth shape transitions create visual interest
- Different animation speeds for variety

### 3. **Text Morphing**
- Section titles squash when you hover over them
- Bounce back with elastic effect
- Makes text feel interactive

### 4. **Button Morphing**
- Buttons change from rounded (30px) to sharp (5px) on hover
- Smooth border-radius animation
- Creates modern, fluid interaction

### 5. **Gallery Image Morphing**
- Images transform from rectangles to circles on hover
- Smooth border-radius transition
- Creates playful, interactive gallery

### 6. **Logo Effects**
- Continuous pulsing (scale 1 to 1.05)
- Color shifts between white and orange
- Subtle attention-grabbing animation

### 7. **Image Breathing**
- Product images subtly scale up and down
- Creates "alive" feeling
- Continuous smooth animation

### 8. **Card Glow Morphing**
- Hover cards pulse with glowing shadow
- Shadow intensity morphs from 20px to 40px
- Creates depth and focus

## 📁 File Structure
```
coffee-website/
├── index.html      (Main HTML file with all sections)
├── style.css       (Complete styling with card designs)
├── script.js       (GSAP animations and interactivity)
└── images/         (All images folder)
    ├── coffee-hero-section.png
    ├── about-image.jpg
    ├── hot-beverages.png
    ├── cold-beverages.png
    ├── refreshment.png
    ├── special-combo.png
    ├── desserts.png
    ├── burger-frenchfries.png
    ├── user-1.jpg to user-5.jpg
    └── gallery-1.jpg to gallery-6.jpg
```

## 💻 How to Use
1. Download all files
2. Keep the folder structure intact (images folder should be in the same directory as HTML file)
3. Open `index.html` in your browser
4. **Note:** GSAP libraries are loaded from CDN, so an internet connection is required for animations

## 🎯 Customization
- **Colors**: Edit CSS variables in `:root` section of `style.css`
- **Content**: Modify text directly in `index.html`
- **Images**: Replace images in the `images/` folder (keep the same names)
- **Animations**: Adjust GSAP timeline values in `script.js`
- **Coffee Prices**: Update pricing in the variety cards

## 📱 Responsive Breakpoints
- Desktop: 1024px and above
- Tablet: 768px - 1023px
- Mobile: Below 768px

## 🌟 Key CSS Variables
```css
--primary-color: #3b141c;      /* Dark brown */
--secondary-color: #f3961c;    /* Orange/Gold */
--white-color: #fff;
--dark-color: #252525;
--light-pink-color: #faf4f5;
```

## ✨ JavaScript Features
- Mobile menu toggle with smooth animation
- Smooth scroll navigation
- Active navigation highlighting
- GSAP scroll-triggered animations
- Interactive card hover effects
- Form submission with animated feedback
- Parallax scrolling
- Floating background elements
- Button ripple effects

## 🎨 Coffee Variety Cards Features
Each card includes:
- ☕ Coffee name and origin
- 📸 Beautiful product image
- ⭐ Strength rating (1-5 stars)
- 🔥 Roast level indication
- 📝 Detailed description
- 💰 Pricing
- 🎯 "Order Now" interactive button
- 🏷️ Badge (Popular, Best Seller, New, etc.)

## 📞 Contact Form
The contact form includes animated success message. To make it fully functional:
1. Add backend API endpoint
2. Or use services like FormSpree, EmailJS, or Netlify Forms

## 🎨 Fonts Used
- **Primary Font**: Poppins (Google Fonts)
- **Accent Font**: Miniver (Google Fonts)

## 📚 Libraries Used
- **GSAP 3.12.5** - Animation library
- **ScrollTrigger** - Scroll-based animations

## 🎭 Animation Timeline
1. **Page Load**: Hero section elements animate in sequence
2. **Background**: SVG blobs morph continuously
3. **Scroll**: Sections reveal with stagger effects
4. **Hover**: Cards lift, images rotate, shapes morph
5. **Click**: Buttons show ripple effect
6. **Continuous**: Floating beans, morphing blobs, pulsing logo
7. **Gallery**: Image shapes morph on hover
8. **Text**: Titles squash/stretch on interaction

## 📌 Credits
Design inspired by modern coffee shop websites
GSAP by GreenSock
Images: Provided in the images folder

## 🔧 Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 📄 License
Free to use for personal and commercial projects

---
Enjoy your beautifully animated coffee website! ☕✨

## 💡 Tips
- Scroll slowly to enjoy all the animations
- Hover over coffee variety cards to see interactive effects
- Try clicking "Order Now" buttons for ripple effects
- Check it out on mobile for responsive design
