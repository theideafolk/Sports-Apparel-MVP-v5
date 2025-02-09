# 3D Product Designer Application

This React application provides a 3D product design interface for customizing jerseys and socks. Here's a breakdown of the project structure and file functionalities:

## Core Files

- `index.html`: Main HTML entry point
- `vite.config.ts`: Vite configuration file
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `eslint.config.js`: ESLint configuration

## Source Files

### Main Application Files

- `src/main.tsx`: Application entry point
- `src/App.tsx`: Root component with routing setup
- `src/index.css`: Global styles

### Components

#### Core Components
- `src/components/Canvas3D.tsx`: 3D canvas renderer using Three.js
- `src/components/DesignCanvas.tsx`: 2D canvas for design manipulation using Fabric.js
- `src/components/Cube.tsx`: 3D model renderer component

#### UI Components
- `src/components/Header.tsx`: Application header with navigation
- `src/components/Sidebar.tsx`: Tools sidebar for design controls
- `src/components/ColorPalette.tsx`: Color selection interface
- `src/components/DecorationsList.tsx`: List of applied decorations
- `src/components/TextControls.tsx`: Text editing controls
- `src/components/ImageControls.tsx`: Image editing controls
- `src/components/ImageUpload.tsx`: Image upload interface

#### Selection Components
- `src/components/DesignSelector.tsx`: Design template selector
- `src/components/ModelSelector.tsx`: 3D model selector
- `src/components/StyleSelector.tsx`: Product style selector

### Pages

- `src/pages/Designer.tsx`: Main design interface
- `src/pages/Cart.tsx`: Shopping cart page

### State Management

#### Store Configuration
- `src/store/store.ts`: Redux store configuration

#### Store Slices
- `src/store/cartSlice.ts`: Shopping cart state management
- `src/store/colorsSlice.ts`: Color management
- `src/store/decorationsSlice.ts`: Design decorations state
- `src/store/designsSlice.ts`: Design templates state
- `src/store/modelsSlice.ts`: 3D models state

## Assets

### 3D Models
- `/dist/assets/3DObjects/Jersey/`: Jersey 3D models
  - `jersey_1.obj`: Soccer jersey model
  - `RoundNeck.obj`: Round neck jersey model
  - `Softball.obj`: Softball jersey model

### Design Templates
- `/dist/assets/Designs/Jersey/`: Jersey design templates
  - Soccer Jersey designs
  - Round neck jersey designs
  - Softball jersey designs
- `/dist/assets/Designs/Sock/`: Sock design templates

## Key Features

1. **3D Visualization**
   - Real-time 3D model rendering
   - Interactive camera controls
   - Dynamic texture mapping

2. **Design Tools**
   - Text addition and customization
   - Image upload and placement
   - Color customization
   - Design template selection

3. **Product Customization**
   - Multiple product types (jerseys, socks)
   - Various model options
   - Different design templates

4. **Shopping Cart**
   - Design saving
   - Preview generation
   - Order management

## Technical Implementation

- Built with React and TypeScript
- Uses Three.js for 3D rendering
- Fabric.js for 2D canvas manipulation
- Redux for state management
- Tailwind CSS for styling
- Vite for development and building