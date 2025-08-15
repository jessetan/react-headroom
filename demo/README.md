# React Headroom Demo

This demo app tests the React 18/19 compatibility of the migrated react-headroom component.

## Quick Start

```bash
# Install dependencies
cd demo
yarn

# Start the demo
yarn start
```

The demo will open at http://localhost:3000

## What to Test

### ✅ Basic Functionality

1. **Scroll down** - Header should hide after scrolling past it
2. **Scroll up** - Header should reappear
3. **Check console** - Pin/unpin events should log

### ⚙️ Interactive Controls

- Adjust **Up/Down Tolerance** sliders to change scroll sensitivity
- Set **Pin Start** to control when pinning behavior begins
- Toggle **Pin Header** to keep header always visible
- Toggle **Disable** to turn off headroom behavior entirely

### 🧪 React 19 Validation

- Demo runs on React 19.1.1 (shown in top-right corner)
- All props are reactive and update in real-time
- Component renders without warnings or errors
- Server-side rendering compatibility maintained

## Expected Behavior

- **Default state**: Header visible, relative positioning
- **Scroll down**: Header becomes fixed, then hides with smooth animation
- **Scroll up**: Header reappears with smooth animation
- **Tolerance settings**: Control sensitivity of show/hide triggers
- **Pin mode**: Header stays visible regardless of scroll
- **Disabled mode**: Header behaves like normal static element

## Technical Notes

This demo uses the built component from `../dist/index.js` which was compiled with:

- Babel 7 (modern build system)
- React 18/19 compatibility
- PropTypes removed
- All 31 tests passing

The demo itself uses React 19's new `createRoot` API to ensure full compatibility testing.
