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
- [**Website Popup Guide**](./docs/WEBSITE-POPUP-GUIDE.md) - How to manage the homepage notification popup.
- [**Testing Guide**](./docs/TESTING-GUIDE.md) - How to run tests.

## Getting Started

### Prerequisites

This project uses [Bun](https://bun.sh) as its package manager. Install Bun first:

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# or via Homebrew
brew install oven-sh/bun/bun
```

### Setup

1.  **Install dependencies**:

    ```bash
    bun install
    ```

2.  **Run development server**:

    ```bash
    bun run dev
    ```

3.  **Build for production**:
    ```bash
    bun run build
    ```

> See [.claude/bun.md](./.claude/bun.md) for detailed Bun usage and commands.

## Project Structure

- `app/`: Next.js App Router (new routes).
- `pages/`: Next.js Pages Router (legacy routes).
- `components/`: React components.
- `lib/`: Utility functions and Contentful queries.
- `scripts/`: Automation scripts (translations, alt text, etc.).
- `public/`: Static assets.
