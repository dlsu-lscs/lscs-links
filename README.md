# LSCS Links

![LSCS | RND](https://img.shields.io/badge/LSCS-RND-brightgreen)

## Overview

This repository contains the **LSCS Links** system, a URL shortening service for the De La Salle University - Laguna Student Council Services (LSCS). It allows users to create, manage, and track short links with associated long URLs and additional metadata such as committee tags.

### Key Features
- **Link Shortening**: Convert long URLs into short, manageable links.
- **Custom Metadata**: Add committee tags to links for easier categorization and filtering.
- **Link Tracking**: Monitor the creation date and other useful data for each short link.

### Mongoose Model Structure

The core functionality is built around a Mongoose model (`linkModel`), which represents the structure of a link:
- **Short Link**: A unique short version of the original URL.
- **Long Link**: The original long-form URL.
- **Committee**: A tag used for filtering links based on the relevant committee.
- **Created At**: Timestamp to track when the link was created.

### Setup and Installation

1. Clone the repository:
   ```bash
     git clone https://github.com/dlsu-lscs/lscs-links.git
   ```
2. Install dependencies:
   ```bash
     npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
     MONGODB_URI=<your_mongodb_uri>
     PORT=<your_preferred_port>
   ```
4. Start the server:
   ```bash
     npm start
   ```

### Contribution Guidelines

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a pull request.

### License

This project is licensed under the MIT License. See the 'LICENSE' file for more details.

---

Maintained by La Salle Computer Society's Research and Development Committee.
