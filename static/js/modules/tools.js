import { API } from '../api.js';
import { TTS } from './tts.js';

export const Tools = {
    init() {
        this.bindForm('crop-calendar-form', this.handleCalendar);
        this.bindForm('irrigation-guide-form', this.handleIrrigation);
        this.bindForm('market-prices-form', this.handleMarket);
    },

    bindForm(id, handler) {
        const form = document.getElementById(id);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handler.call(this); // Bind 'this' context
            });
        }
    },

    async handleCalendar() {
        const crop = document.getElementById('crop-type').value;
        const div = document.getElementById('calendar-result');
        div.innerHTML = '<div class="spinner-border text-success"></div> Generating...';

        try {
            const result = await API.askCalendar(crop);
            div.innerHTML = `
                <div class="p-3 bg-light border rounded result-with-tts">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong>Crop Calendar</strong>
                        ${TTS.getButtonHTML()}
                    </div>
                    <pre class="mb-0" style="white-space: pre-wrap">${result}</pre>
                </div>`;
            TTS.bindToContainer(div, result);
            this.saveHistory('calendar', { crop: crop });
        } catch (e) {
            div.innerHTML = `<div class="alert alert-warning">Error: ${e.message}</div>`;
        }
    },

    async handleIrrigation() {
        const crop = document.getElementById('irrigation-crop').value;
        const soil = document.getElementById('soil-type').value;
        const div = document.getElementById('irrigation-result');
        div.innerHTML = '<div class="spinner-border text-primary"></div> Calculating...';

        try {
            const result = await API.askIrrigation(crop, "", soil);
            div.innerHTML = `
                <div class="p-3 bg-light border rounded result-with-tts">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong>Irrigation Guide</strong>
                        ${TTS.getButtonHTML()}
                    </div>
                    <pre class="mb-0" style="white-space: pre-wrap">${result}</pre>
                </div>`;
            TTS.bindToContainer(div, result);
            this.saveHistory('irrigation', { crop: crop });
        } catch (e) {
            div.innerHTML = `<div class="alert alert-warning">Error: ${e.message}</div>`;
        }
    },

    async handleMarket() {
        const crop = document.getElementById('market-crop').value;
        const district = document.getElementById('district').value;
        const div = document.getElementById('market-result');
        div.innerHTML = '<div class="spinner-border text-success"></div> Fetching...';

        try {
            const result = await API.askMarket(crop, "", district);
            div.innerHTML = `
                <div class="p-3 bg-light border rounded result-with-tts">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong>Market Prices</strong>
                        ${TTS.getButtonHTML()}
                    </div>
                    <pre class="mb-0" style="white-space: pre-wrap">${result}</pre>
                </div>`;
            TTS.bindToContainer(div, result);
            this.saveHistory('market', { crop: crop, district: district });
        } catch (e) {
            div.innerHTML = `<div class="alert alert-warning">Error: ${e.message}</div>`;
        }
    },

    saveHistory(type, data) {
        let history = JSON.parse(localStorage.getItem('chisa_history')) || [];
        history.unshift({ type: type, data: data, timestamp: new Date() });
        localStorage.setItem('chisa_history', JSON.stringify(history));
    }
};
