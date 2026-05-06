// 📁 api/testService.js
import axios from 'axios';

const API_URL = 'https://localhost:7057/api/TestBlanc';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const testService = {
    // ==================== CANDIDAT - PASSER UN TEST ====================
    
    /**
     * Démarrer un nouveau test blanc
     * @param {number} contratId - ID du contrat du candidat
     * @param {number} testBlancId - ID du test blanc à passer
     */
    async demarrerTest(contratId, testBlancId) {
        try {
            // IMPORTANT: Envoyer un objet avec les bonnes propriétés
            const response = await apiClient.post('/demarrer', {
                contratId: contratId,
                testBlancId: testBlancId
            });
            return response.data;
        } catch (error) {
            console.error('Erreur demarrerTest:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Répondre à une question
     * @param {number} testCandidateId - ID de la session de test
     * @param {number} questionId - ID de la question
     * @param {number} optionId - ID de l'option choisie
     */
    async repondreQuestion(testCandidateId, questionId, optionId) {
        try {
            const response = await apiClient.post(`/repondre/${testCandidateId}`, {
                questionId: questionId,
                optionId: optionId
            });
            return response.data;
        } catch (error) {
            console.error('Erreur repondreQuestion:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Terminer le test
     * @param {number} testCandidateId - ID de la session de test
     */
    async terminerTest(testCandidateId) {
        try {
            const response = await apiClient.post(`/terminer/${testCandidateId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur terminerTest:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Obtenir les résultats d'un test terminé
     * @param {number} testCandidateId - ID de la session de test
     */
    async getResultats(testCandidateId) {
        try {
            const response = await apiClient.get(`/resultats/${testCandidateId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getResultats:', error.response?.data || error.message);
            throw error;
        }
    },

    // ==================== CANDIDAT - HISTORIQUE ET PROGRESSION ====================

    /**
     * Obtenir l'historique des tests d'un candidat
     * @param {number} contratId - ID du contrat
     */
    async getHistorique(contratId) {
        try {
            const response = await apiClient.get(`/historique/${contratId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getHistorique:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Obtenir la progression d'un candidat
     * @param {number} contratId - ID du contrat
     */
    async getProgression(contratId) {
        try {
            const response = await apiClient.get(`/progression/${contratId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getProgression:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Obtenir toutes les questions d'un test blanc
     * @param {number} testBlancId - ID du test blanc
     */
    async getQuestionsByTest(testBlancId) {
        try {
            const response = await apiClient.get(`/testblanc/${testBlancId}/questions`);
            return response.data;
        } catch (error) {
            console.error('Erreur getQuestionsByTest:', error.response?.data || error.message);
            throw error;
        }
    },

    // ==================== SECRETAIRE - CRUD TESTBLANC ====================

    async getAllTests() {
        try {
            const response = await apiClient.get('/');
            return response.data;
        } catch (error) {
            console.error('Erreur getAllTests:', error.response?.data || error.message);
            throw error;
        }
    },

    async getTestById(id) {
        try {
            const response = await apiClient.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getTestById:', error.response?.data || error.message);
            throw error;
        }
    },

    async createTest(data) {
        try {
            const response = await apiClient.post('/', data);
            return response.data;
        } catch (error) {
            console.error('Erreur createTest:', error.response?.data || error.message);
            throw error;
        }
    },

    async updateTest(id, data) {
        try {
            const response = await apiClient.put(`/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Erreur updateTest:', error.response?.data || error.message);
            throw error;
        }
    },

    async deleteTest(id) {
        try {
            const response = await apiClient.delete(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur deleteTest:', error.response?.data || error.message);
            throw error;
        }
    },

    // ==================== SECRETAIRE - CRUD QUESTIONS ====================

    async createQuestion(testBlancId, data) {
        try {
            const response = await apiClient.post(`/questions/${testBlancId}`, data);
            return response.data;
        } catch (error) {
            console.error('Erreur createQuestion:', error.response?.data || error.message);
            throw error;
        }
    },

    async updateQuestion(questionId, data) {
        try {
            const response = await apiClient.put(`/questions/${questionId}`, data);
            return response.data;
        } catch (error) {
            console.error('Erreur updateQuestion:', error.response?.data || error.message);
            throw error;
        }
    },

    async deleteQuestion(questionId) {
        try {
            const response = await apiClient.delete(`/questions/${questionId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur deleteQuestion:', error.response?.data || error.message);
            throw error;
        }
    },

    async getAllQuestionsByTestBlanc(testBlancId) {
        try {
            const response = await apiClient.get(`/questions/testblanc/${testBlancId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur getAllQuestionsByTestBlanc:', error.response?.data || error.message);
            throw error;
        }
    },

    // ==================== SECRETAIRE - STATISTIQUES ====================

    async getStatistiquesGlobales() {
        try {
            const response = await apiClient.get('/statistiques/globales');
            return response.data;
        } catch (error) {
            console.error('Erreur getStatistiquesGlobales:', error.response?.data || error.message);
            throw error;
        }
    },

    async getStatistiquesParTheme(startDate, endDate) {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const response = await apiClient.get('/statistiques/themes', { params });
            return response.data;
        } catch (error) {
            console.error('Erreur getStatistiquesParTheme:', error.response?.data || error.message);
            throw error;
        }
    },

    async reactiverTest(id) {
        try {
            const response = await apiClient.post(`/reactiver/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur reactiverTest:', error.response?.data || error.message);
            throw error;
        }
    },

    async reactiverQuestion(questionId) {
        try {
            const response = await apiClient.post(`/questions/reactiver/${questionId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur reactiverQuestion:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default testService;