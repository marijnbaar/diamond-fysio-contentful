# Managing the Website Popup

This guide explains how to manage the notification popup (e.g., for holiday closures) on the homepage via Contentful.

## Overview

The website features a "toast" style popup that appears in the bottom-right corner of the homepage. This popup can be toggled on/off and the text can be edited directly from Contentful, without needing code changes.

## How to Manage the Popup

The popup settings are part of the **Homepage Header** content model.

1.  **Log in to Contentful**.
2.  Navigate to the **Content** tab.
3.  Search for the entry named **"Homepage Header"** (Content Type: `HeaderHomepage`).
    - _Note: There is usually only one Homepage Header entry that controls the main header of the site._
4.  Open the entry to edit it.
5.  Scroll down to find the **Popup Settings** section (fields `showPopup` and `popupText`).

### Fields

- **Show Popup** (Boolean / Checkbox):
  - ✅ **Checked**: The popup will be visible on the live website.
  - ❌ **Unchecked**: The popup will be hidden.
- **Popup Text** (Text):
  - Enter the message you want to display (e.g., _"Fijne feestdagen! De praktijk is gesloten van..."_).
  - Keep it concise for the best look, but it can handle longer text.
- **Popup Email** (Text, optional):
  - Add an email address that will be displayed as a clickable mailto link in the popup.
  - Leave empty if no email link is needed.

### Publishing

After changing the settings:

1.  Click the green **Publish** button in the sidebar.
2.  The changes will be live on the website immediately (or within a few minutes depending on caching).

## How to Disable the Popup

To temporarily or permanently hide the popup:

1. Open the **Homepage Header** entry in Contentful
2. **Uncheck** the **Show Popup** checkbox
3. Click **Publish**

The popup will immediately disappear from the website (or within a few minutes depending on caching).

## Technical Details

- **Component**: `components/WebsitePopup.jsx`
- **Logic**: The `HomepageHeader.jsx` component checks for the `showPopup` flag. If true and `popupText` is provided, it renders the `WebsitePopup` component with the provided content and optional email link.
- **Styling**: The popup uses a fixed position (`bottom-4 right-4`), z-index `50`, and includes an entrance animation.
- **Note**: As of January 2026, all popup content is managed through Contentful. Previous hardcoded popup configurations have been removed.
