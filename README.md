# Encrypted Browser-Based Secure Clipboard for Sensitive Data

## Overview

The **Encrypted Browser-Based Secure Clipboard for Sensitive Data** is a web-based security project designed to securely store, manage, and copy sensitive information such as passwords, OTPs, API keys, and confidential text. The application uses **client-side encryption** to ensure that all sensitive data is encrypted within the user's browser before it is stored or displayed, preventing unauthorized access and data leakage.

## Features

* Client-side AES-GCM encryption using the WebCrypto API
* Secure storage of passwords, OTPs, API keys, and confidential text
* Zero-knowledge architecture (no backend server required)
* Secure clipboard management
* Automatic clearing of sensitive data after a configurable timeout
* Temporary encrypted storage using browser memory or IndexedDB
* Responsive user interface built with HTML, CSS, and JavaScript

## Technologies Used

* HTML5
* CSS3
* JavaScript (ES6)
* WebCrypto API
* IndexedDB

## Project Modules

1. User Interface Module
2. Encryption Module
3. Clipboard Management Module
4. Storage Module
5. Auto-Clear and Security Module

## Security Features

* AES-GCM encryption
* Client-side processing
* No plaintext stored on the device
* Automatic deletion of encryption keys
* Protection against clipboard monitoring and accidental data exposure

## How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   ```

2. Open the project folder.

3. Launch `index.html` in a modern web browser such as Google Chrome, Microsoft Edge, or Mozilla Firefox.

## Future Enhancements

* Multi-user authentication
* Cloud synchronization with end-to-end encryption
* Browser extension support
* Secure password generator
* Dark mode and accessibility improvements
