import { API } from '../api.js';
import { TTS } from './tts.js';

export const Vision = {
    init() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('disease-file-input');
        const analyzeBtn = document.getElementById('analyze-btn');

        if (!fileInput) return;

        // Trigger file select
        uploadZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target !== fileInput) fileInput.click();
        });

        // Handle File Select
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) this.handlePreview(fileInput.files[0]);
        });

        if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.analyzeImage());
    },

    handlePreview(file) {
        const previewImg = document.getElementById('preview-img');
        const previewContainer = document.getElementById('image-preview-container');
        const placeholder = document.querySelector('.upload-content');

        if (previewImg) {
            previewImg.src = URL.createObjectURL(file);
            previewContainer.classList.remove('d-none');
            if (placeholder) placeholder.classList.add('d-none');
        }
    },

    async analyzeImage() {
        const fileInput = document.getElementById('disease-file-input');
        if (!fileInput.files[0]) {
            alert('Please select an image first.');
            return;
        }

        const resultDiv = document.getElementById('disease-result');
        resultDiv.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-success"></div><p>Analyzing Health with Groq Vision...</p></div>';

        try {
            const systemPrompt = "Analyze this plant image. Identify the plant and detect any diseases, pests, or health issues. Provide a confident diagnosis and treatment suggestions. Respond with Markdown.";
            const analysis = await API.askVision(fileInput.files[0], systemPrompt);

            // Save to History for Dashboard
            const isBad = analysis.toLowerCase().includes('disease') || analysis.toLowerCase().includes('pest') || analysis.toLowerCase().includes('unhealthy');
            this.saveHistory(isBad ? 'bad' : 'good');

            resultDiv.innerHTML = `
                <div class="p-3 result-with-tts">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="text-success m-0">Analysis Result</h5>
                        ${TTS.getButtonHTML()}
                    </div>
                    <div class="markdown-body">${marked.parse(analysis)}</div>
                </div>`;

            TTS.bindToContainer(resultDiv, analysis);

        } catch (e) {
            console.error(e);
            resultDiv.innerHTML = `<div class="alert alert-warning">Analysis Failed: ${e.message}.</div>`;
        }
    },

    saveHistory(status) {
        let history = JSON.parse(localStorage.getItem('chisa_history')) || [];
        history.unshift({ type: 'vision', data: { health: status }, timestamp: new Date() });
        if (history.length > 5) history.pop();
        localStorage.setItem('chisa_history', JSON.stringify(history));

        // Trigger Dashboard update if available in scope, or wait for refresh
        // Ideally we use a shared state or event bus, but reload works for MVP
    }
};
