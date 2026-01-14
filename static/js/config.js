/**
 * Config Manager
 * Handles secure storage and retrieval of the OpenAI API Key.
 */

export const Config = {
    KEY_STORAGE_NAME: 'chisa_openai_key',

    getAPIKey() {
        return localStorage.getItem(this.KEY_STORAGE_NAME) || '';
    },

    setAPIKey(key) {
        if (!key.startsWith('sk-')) {
            throw new Error('Invalid Key format. Must start with sk-');
        }
        localStorage.setItem(this.KEY_STORAGE_NAME, key);
    },

    hasAPIKey() {
        const key = this.getAPIKey();
        return key && key.startsWith('sk-');
    },

    clearAPIKey() {
        localStorage.removeItem(this.KEY_STORAGE_NAME);
    }
};
