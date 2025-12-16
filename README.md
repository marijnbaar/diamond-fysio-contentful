# Diamond Fysio Contentful

This is the Next.js project for Diamond Fysio, integrated with Contentful CMS.

## Documentation

Documentation has been moved to the `docs/` folder:

- [**Setup Guide**](./docs/CONTENTFUL-SETUP-STEPS.md) - How to set up Contentful and the project.
- [**BotID Setup**](./docs/BOTID-SETUP.md) - Setting up bot protection.
- [**Instagram Token Refresh**](./docs/INSTAGRAM-REFRESH.md) - How the automated Instagram token refresh works.
- [**AI Alt Text Generation**](./docs/AI-alt-text-guide.md) - Generating alt text for images using AI.
- [**Adding Team Members**](./docs/HOW-TO-ADD-TEAM-MEMBER.md) - Guide for adding new team members.
- [**Team Member Auto Page Setup**](./docs/TEAM-MEMBER-AUTO-PAGE-SETUP.md) - Automated page creation for team members.
- [**Testing Guide**](./docs/TESTING-GUIDE.md) - How to run tests.

## Getting Started

1.  **Install dependencies**:

    ```bash
    yarn install
    # or
    npm install
    ```

2.  **Run development server**:

    ```bash
    yarn dev
    # or
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    yarn build
    # or
    npm run build
    ```

## Project Structure

- `app/`: Next.js App Router (new routes).
- `pages/`: Next.js Pages Router (legacy routes).
- `components/`: React components.
- `lib/`: Utility functions and Contentful queries.
- `scripts/`: Automation scripts (translations, alt text, etc.).
- `public/`: Static assets.
