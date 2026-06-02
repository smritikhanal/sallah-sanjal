# Logo Fill Preloader - Implementation Guide

## 🎨 Overview

A beautiful, animated logo fill preloader component that uses the Sallah Sanjal logo with smooth gradient fill animations, shimmer effects, and rotating rings. Perfect for app initialization, data loading, or authentication screens.

## 📁 Files Created

### Component Files
- `frontend/src/components/LogoPreloader.jsx` - Main React component
- `frontend/src/components/LogoPreloader.css` - Styling and animations
- `frontend/src/components/LogoPreloaderExample.jsx` - Usage examples and documentation

## ✨ Features

✓ **Fill Animation** - Smooth bottom-to-top gradient fill effect
✓ **Shimmer Effect** - Reflective shimmer passes across the logo
✓ **Pulsing Ring** - Outer pulsing ring animation
✓ **Rotating Border** - Spinning border with gradient colors
✓ **Responsive** - Works perfectly on all screen sizes
✓ **Customizable** - Three size options (small, medium, large)
✓ **Loading Text** - Optional animated loading text with fade effect
✓ **Drop Shadows** - Depth and visual hierarchy
✓ **Fixed Positioning** - Stays in place while scrolling
✓ **High Z-Index** - Appears above all content (z-index: 9999)

## 🚀 Quick Start

### 1. Import the Component

```jsx
import LogoPreloader from './components/LogoPreloader';
```

### 2. Basic Usage

```jsx
<LogoPreloader 
  isLoading={isLoading}
  size="medium"
  text="Loading..."
/>
```

### 3. Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | boolean | true | Controls visibility |
| `size` | string | 'medium' | 'small' \| 'medium' \| 'large' |
| `text` | string | 'Loading...' | Custom loading text |

## 💻 Complete Example

### In App.jsx

```jsx
import React, { useState, useEffect } from 'react';
import LogoPreloader from './components/LogoPreloader';
import MainContent from './pages/MainContent';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Your initialization logic here
        await fetchUser();
        await fetchSettings();
        setIsLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  return (
    <>
      <LogoPreloader 
        isLoading={isLoading}
        size="medium"
        text="Preparing your experience..."
      />
      {!isLoading && <MainContent />}
    </>
  );
}

export default App;
```

## 🎯 Size Options

### Small (100x100px)
```jsx
<LogoPreloader isLoading={true} size="small" />
```

### Medium (200x200px) - Default
```jsx
<LogoPreloader isLoading={true} size="medium" />
```

### Large (300x300px)
```jsx
<LogoPreloader isLoading={true} size="large" />
```

## 🎬 Animation Variants

The component includes several animation styles you can use by modifying the CSS:

### 1. Default (Bottom-to-Top Fill)
Current implementation with smooth gradient fill from bottom to top.

### 2. Vertical Scale
```css
/* Uncomment in LogoPreloader.css */
.logo-preloader--vertical .logo-preloader__fill-rect {
  animation: fillAnimationVertical 3s ease-in-out infinite;
}
```

### 3. Wave/Slide
```css
/* Uncomment in LogoPreloader.css */
.logo-preloader--wave .logo-preloader__fill-rect {
  animation: fillAnimationWave 3s ease-in-out infinite;
}
```

## 🎨 Customization

### Change Colors

Edit `LogoPreloader.css` and modify these values:

```css
/* Current colors */
#d97706  /* Primary Orange */
#fc7404  /* Bright Orange */
#fb7508  /* Medium Orange */

/* In linearGradient */
<stop offset="0%" stopColor="#FC7404" />
<stop offset="50%" stopColor="#d97706" />
```

### Adjust Animation Speed

Modify the animation duration in the CSS keyframes:

```css
/* Default: 3s */
animation: fillAnimation 3s ease-in-out infinite;

/* Change to 2s for faster animation */
animation: fillAnimation 2s ease-in-out infinite;
```

### Change Preloader Size

Add custom size in CSS:

```css
.logo-preloader--extra-large {
  width: 400px;
  height: 400px;
}
```

Then use in JSX:
```jsx
<LogoPreloader isLoading={true} size="extra-large" />
```

## 🔧 Advanced Integration

### With Authentication

```jsx
import { useAuth } from './context/AuthContext';
import LogoPreloader from './components/LogoPreloader';

function ProtectedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <LogoPreloader 
        isLoading={isLoading}
        text={isLoading ? 'Verifying credentials...' : ''}
      />
      {isAuthenticated && <Dashboard />}
    </>
  );
}
```

### With Data Fetching

```jsx
import LogoPreloader from './components/LogoPreloader';
import { fetchData } from './services/api';

function DataView() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData()
      .then(response => {
        setData(response);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <LogoPreloader isLoading={isLoading} size="medium" />
      {data && <Content data={data} />}
    </>
  );
}
```

## 📱 Responsive Behavior

The preloader automatically adjusts for different screen sizes:

- **Desktop (1024px+)**: Full-size preloader
- **Tablet (768px-1023px)**: Medium size
- **Mobile (480px-767px)**: Small to medium size
- **Small Mobile (<480px)**: Extra small with adjusted text

No additional configuration needed - it's built in!

## 🎭 Animation Properties

### Fill Animation
- **Duration**: 3 seconds
- **Timing**: ease-in-out
- **Direction**: Bottom to top
- **Loop**: Infinite

### Shimmer Effect
- **Duration**: 2 seconds
- **Direction**: Left to right
- **Opacity**: Fades in and out

### Pulsing Ring
- **Duration**: 2 seconds
- **Effect**: Grows outward with fade
- **Color**: Orange with transparency

### Rotating Border
- **Duration**: 3 seconds
- **Direction**: Clockwise
- **Speed**: Linear

## 🚫 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## 📝 Notes

1. **High Z-Index**: The preloader has `z-index: 9999` to appear above all content
2. **Fixed Positioning**: Uses `position: fixed` to stay in place
3. **Logo Path**: Uses `/images/logo/logo.svg` from public folder
4. **SVG Clipping**: Uses SVG clipPath for smooth mask effect
5. **CSS Animations**: Uses hardware-accelerated animations for smooth performance

## 🐛 Troubleshooting

### Preloader not showing
- Ensure `isLoading` prop is `true`
- Check z-index of other elements
- Verify logo.svg path is correct

### Animation looks choppy
- Check browser performance
- Disable other animations temporarily
- Try reducing animation duration

### Text not appearing
- Ensure `text` prop is provided and not empty string
- Check text color contrast with background
- Verify font size in CSS

### Sizing issues
- Use predefined sizes: 'small', 'medium', 'large'
- Or create custom CSS class with specific dimensions

## 📞 Support

For issues or questions, refer to the usage examples in `LogoPreloaderExample.jsx` or review the CSS animations in `LogoPreloader.css`.

---

**Version**: 1.0.0
**Last Updated**: April 30, 2026
**Component Status**: Production Ready ✓
