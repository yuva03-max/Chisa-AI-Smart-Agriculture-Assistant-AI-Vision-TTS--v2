import { Config } from './config.js';
import { Dashboard } from './modules/dashboard.js';
import { Chat } from './modules/chat.js';
import { Vision } from './modules/vision.js';
import { Tools } from './modules/tools.js';

class ChisaApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('Chisa AI Initializing...');

        // 1. Initialize Components
        Dashboard.init();
        Chat.init();
        Vision.init();
        Tools.init();

        // 2. Setup Settings UI
        this.setupSettingsInternal();

        // 3. Theme Logic
        this.setupTheme();

        // 4. Update Time
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
    }

    setupSettingsInternal() {
        // We will attach this logic to the DOM elements we are about to create in index.html
        const saveBtn = document.getElementById('save-api-key');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const key = document.getElementById('api-key-input').value.trim();
                try {
                    Config.setAPIKey(key);
                    alert('API Key Saved Successfully!');
                    location.reload(); // Refresh to apply changes
                } catch (e) {
                    alert(e.message);
                }
            });
        }

        // Pre-fill if exists
        const input = document.getElementById('api-key-input');
        if (input && Config.hasAPIKey()) {
            input.value = Config.getAPIKey(); // Masking handled by input type="password"
        }
    }

    setupTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

            toggle.addEventListener('click', () => {
                const current = document.body.getAttribute('data-theme');
                const newTheme = current === 'dark' ? 'light' : 'dark';
                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            });
        }
    }

    updateTime() {
        const el = document.getElementById('current-date');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }
}

// Start App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChisaApp();
});
