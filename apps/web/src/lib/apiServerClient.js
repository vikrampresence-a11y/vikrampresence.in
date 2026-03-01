// Since we are now using a PHP backend hosted in the same Hostinger environment,
// the production base URL is just the root relative path.
const API_SERVER_URL = import.meta.env.DEV ? "http://localhost:3001" : "";

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(API_SERVER_URL + url, options);
    }
};

export default apiServerClient;
export { apiServerClient };
