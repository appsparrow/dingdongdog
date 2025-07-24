# Icon Setup Instructions

To use the custom icons in the app, please add the following icon files to the `public` directory:

## Required Icon Files

Place these files in the `public` folder of your project:

1. **fed-empty.png** - Empty food bowl icon (for pending feed activities)
2. **fed-full.png** - Full food bowl icon (for completed feed activities)
3. **poop-empty.png** - Empty poop icon (for pending let out activities)
4. **poop-full.png** - Full poop icon (for completed let out activities)
5. **walk-empty.png** - Empty walk icon (for pending walk activities)
6. **walk-full.png** - Full walk icon (for completed walk activities)

## File Structure

Your `public` directory should look like this:

```
public/
├── fed-empty.png
├── fed-full.png
├── poop-empty.png
├── poop-full.png
├── walk-empty.png
├── walk-full.png
└── ... (other files)
```

## Icon Usage

- **Empty icons** are used for pending activities (grayed out)
- **Full icons** are used for completed activities (colored)
- The app will automatically fallback to emojis if the image files are not found

## Icon Specifications

- Recommended size: 32x32 pixels or larger
- Format: PNG with transparency
- Style: Consistent with the app's design language

The app is now configured to use these icons in:
- Schedule progress indicators
- Quick Actions buttons
- Activity displays 