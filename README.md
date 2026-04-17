# ⚡ HELLO Messaging - Frontend Terminal

A state-of-the-art, Cyberpunk Neon-themed messaging interface for the **HELLO** communication network. Built for speed, aesthetics, and fluid user interaction.

---

## 🌌 Aesthetics & UI

- **Cyberpunk Neon Design**: Deep space blacks with glowing fuchsia and cyan accents.
- **Glassmorphism**: Translucent, frosted-glass frames using `backdrop-blur-xl`.
- **Dynamic Micro-Animations**: Pulsing online indicators, glowing selection bars, and animated sticker rendering.
- **Modern Typography**: High-tech `Orbitron` display font combined with sleek `Inter` body text.

---

## ✨ Features

- **Real-Time Sync**: Instant message delivery and online status tracking.
- **Expressive Tools**:
  - **Emoji Panel**: Quick-access tray for 20+ custom emoticons.
  - **Sticker Protocols**: Fully animated "HELLO APPROVED" and "SYSTEM OVERRIDE" graphical decals.
- **Secure File Sharing**: Wait-validated upload system for flawless image and document transfers.
- **Responsive Layout**: Optimized for high-resolution desktop terminals and portable devices.

---

## 🛠️ Technology Stack

- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Communication**: WebSockets & Axios
- **State Management**: React Context API

---

## 📦 Setup & Installation

1. **Navigate to this directory**:
   ```bash
   cd client
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in this directory:
   ```env
   VITE_API_URL=http://localhost:4040
   VITE_WS_URL=ws://localhost:4040
   ```

4. **Launch the Terminal**:
   ```bash
   npm run dev
   ```

---

## 🎨 Asset Management

- **Logo**: The "HELLO" icon is a high-performance SVG located in `src/Logo.jsx`, designed for infinite scaling and neon glow effects.
- **Themes**: Global styles and Cyberpunk color tokens are defined in `src/index.css`.
