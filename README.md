# AidCraft

AidCraft is a global development finance simulation game where you take on the role of a Finance Ministry Official managing debt repayment, political influence, environmental concerns, and diplomatic relations.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Seth-arc/aidcraft.git
   ```
2. Navigate to the project directory:
   ```bash
   cd aidcraft
   ```
3. Open the `index.html` file in your preferred web browser to start the game.

## Game Overview

In AidCraft, you will navigate complex financial and political scenarios to achieve your mission objectives. The game includes various interactive elements such as action cards, stakeholder details, documents, and notifications, all managed through JavaScript and styled with CSS.

### Game Flow

1. **Splash Screen**: The game starts with a splash screen introducing the game.
2. **Mission Selection**: Select a mission from the mission selection drawer.
3. **Main Game UI**: Manage your resources, make decisions, and interact with stakeholders to achieve your mission objectives.
4. **End Game Modal**: Submit your final recommendation at the end of the mission.
5. **Prime Minister's Verdict**: Receive the Prime Minister's verdict based on your performance.
6. **Final Result**: View the final game result and your performance metrics.

### Key Features

- **Interactive Elements**: Action cards, stakeholder details, documents, and notifications.
- **Game State Management**: JavaScript logic to manage game state, modals, actions, stakeholders, and events.
- **Responsive Design**: CSS styles for various game elements, including loading screen, splash screen, mission selection, buttons, modals, animations, and more.

## Enhanced Loading Functionality

### Loading Screen

The loading screen in AidCraft has been enhanced to provide a more dynamic and informative experience. It now includes a progress bar that updates in real-time as the game loads. This helps players understand the loading progress and provides a smoother transition into the game.

### Customizing the Loading Screen

You can customize the loading screen by modifying the following elements in the `index.html` file:

- `loadingScreen`: The main container for the loading screen.
- `loadingText`: The text displayed during loading.
- `loadingBar`: The progress bar that fills up as the game loads.

To update the loading progress dynamically, the `updateLoadingProgress` function in the `script.js` file is used. This function updates the width of the `loadingBar` and the text of the `loadingText` based on the current loading progress.

## Developer Notes

- The `index.html` file contains the main structure and content for the AidCraft game.
- The `script.js` file includes the main JavaScript logic for the game.
- The `styles.css` file defines the styles for the game.
- The game allows users to fully demo it from the splash screen to getting their result at the end of the game.

## Deploying to GitHub Pages

To deploy the project to GitHub Pages, follow these steps:

1. Ensure that you have the necessary permissions to deploy to GitHub Pages.
2. Push your changes to the `main` branch of the repository.
3. The GitHub Actions workflow will automatically build and deploy the site to GitHub Pages.

## License

This project is licensed under the MIT License.
