⏳ Time Capsule: Personal Organizer & Productivity Dashboard 

**Time Capsule** is a beautiful, cherry-blossom-themed web application designed to help you organize your life, manage tasks, and reflect on your personal journey. It’s a simple, elegant tool that combines task management with a journaling and timeline feature, helping you stay productive and mindful of your progress. This project was developed with a little help from Gemini, an AI assistant.

---

## ✨ Features

-   **Dashboard:** A central hub to view your progress, see upcoming deadlines, and quickly add new tasks or notes.
-   **Task Management:** Create, track, and manage your to-do list with titles, deadlines, and personal notes. Tasks can be marked as complete, and overdue items are highlighted.
-   **Notes:** Write notes to your future self, with the option to lock them until a specific date. This feature acts as a digital time capsule for your thoughts and memories.
-   **Checklist:** A simple, gamified checklist to track daily habits or recurring items.
-   **Calendar View:** Visualize your tasks and deadlines on an interactive monthly calendar.
-   **Progress Tracking:** The dashboard features a dynamic progress ring that shows your task completion percentage, providing a clear overview of your productivity.
-   **Data Visualization:** A dedicated "Graphs" section displays your task and checklist completion data using sleek, responsive charts (pie and bar graphs).
-   **Timeline:** A chronological view of your tasks and notes, allowing you to reflect on your journey over time.
-   **Gamification Badges:** Earn badges like "Completionist" and "Pro Achiever" as you complete a certain number of tasks.
-   **Voice-to-Text:** Use your microphone to effortlessly dictate notes and task details, making data entry quick and hands-free.
-   **User Profile:** Save your personal information (name, age, etc.) locally within the application.
-   **Local Storage:** All data is stored securely in your browser's local storage, ensuring your information remains private and accessible only to you.

---

## 🖥️ How It Works

Time Capsule is built using a single `index.html` file that leverages a combination of **HTML**, **CSS**, and **vanilla JavaScript**. It does not require a server or a backend, making it incredibly lightweight and easy to use.

-   **HTML:** Structures the application's layout, from the sidebar and top bar to the various content sections (dashboard, notes, calendar, etc.).
-   **CSS:** The styling is inspired by a "Cherry Blossom Theme" with a dark background (`--bg: #1a0f1b;`), a muted text color (`--text: #ffe9f6;`), and an accent color of blossom pink (`--accent: #ff80ab;`). It uses a modern, clean grid-based layout for responsiveness.
-   **JavaScript:** The core logic of the application. It handles all user interactions, including:
    -   **Data Persistence:** Uses `localStorage` to save and retrieve user data, including tasks, notes, and checklist items.
    -   **Dynamic Rendering:** Populates the UI elements (e.g., task lists, calendar days, timeline items) based on the data stored.
    -   **State Management:** Manages which section of the app is currently visible.
    -   **Charts:** Uses the popular **Chart.js** library to create beautiful and informative data visualizations.
    -   **Web Speech API:** Implements the voice-to-text functionality to transcribe spoken words into text inputs.

---

## 🚀 Getting Started

To run this project, simply download the `index.html` file and open it in any modern web browser. Since all the code is self-contained and uses local storage, you can use it offline without any setup.

### Development

If you want to contribute or modify the project, you only need to edit the `index.html` file. The CSS is embedded, and the JavaScript is located at the bottom of the file.

1.  Clone the repository:
    `git clone https://github.com/YOUR_USERNAME/time-capsule-app.git`
2.  Open `index.html` in your favorite code editor.
3.  Make your changes.
4.  Open the file in your browser to test.

---

## 🎨 Design & Theme

The design philosophy is centered around a calming and aesthetically pleasing user experience. The color palette is carefully chosen to create a serene and focused environment.

-   `--bg`: A deep purple-black for the background.
-   `--accent`: A vibrant "blossom pink" for highlights and key elements.
-   `--card`: A subtle, transparent white for card backgrounds, giving the interface a modern, frosted glass effect.

The use of an elegant `Inter` font and minimalist icons keeps the interface clean and easy to navigate.

---
