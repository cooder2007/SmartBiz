🚀 React + Vite Starter

A minimal and fast setup to build React apps using Vite, with Hot Module Replacement (HMR) and basic ESLint configuration.

📦 Features
⚡ Lightning-fast development with Vite
🔥 Hot Module Replacement (HMR)
🧹 Pre-configured ESLint rules
⚛️ React support out of the box
🔌 Available Plugins

You can use either of the official React plugins:

@vitejs/plugin-react

Uses Oxc for fast transformations
@vitejs/plugin-react-swc

Uses SWC for even faster builds
⚙️ React Compiler

The React Compiler is not enabled by default due to its impact on development and build performance.

👉 To enable it, follow the official guide:
https://react.dev/learn/react-compiler/installation

🧠 ESLint & TypeScript (Recommended)

For production-ready apps, it’s recommended to:

Use TypeScript
Enable type-aware linting

👉 Check the official template:
https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts

▶️ Getting Started

Follow these steps to run the project locally:

# 1. Open terminal / command prompt

# 2. Navigate to project folder
cd SmartBiz

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
📁 Project Structure (Basic)
SmartBiz/
├── src/
├── public/
├── package.json
├── vite.config.js
└── README.md
🛠️ Scripts
Command	Description
npm install	Install dependencies
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
💡 Notes
Make sure Node.js is installed (recommended: latest LTS)
If you face issues, try deleting node_modules and reinstalling
