import axios from 'axios';

// The ECS backend URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in every request
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

// Add interceptor to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Get all evidence/compliance records
  getEvidence: async () => {
    const response = await apiClient.get('/evidence');
    return response.data;
  },

  // Upload an evidence file
  uploadEvidence: async (formData) => {
    // We use multipart/form-data for file uploads
    const response = await apiClient.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Submit evidence purely as text (simulating an agent)
  submitAgentEvidence: async (payload) => {
    const response = await apiClient.post('/agent/submit', payload);
    return response.data;
  },
  
  // Dummy endpoint for Controls 
  // (Assuming backend doesn't have a dedicated /controls endpoint yet, we mock it)
  getControls: async () => {
    return [
      { id: 'CTL-001', framework: 'PCI DSS 8.2', description: 'Strong authentication must be enforced', status: 'COMPLIANT' },
      { id: 'CTL-002', framework: 'ISO 27001 A.9', description: 'Network access control policy', status: 'NON-COMPLIANT' },
      { id: 'CTL-003', framework: 'RBI Cyber Sec', description: 'Patch management process', status: 'NEEDS REVIEW' },
      { id: 'CTL-004', framework: 'PCI DSS 3.4', description: 'Data encryption at rest', status: 'COMPLIANT' },
    ];
  },

  // Mark evidence as verified
  verifyEvidence: async (evidenceId) => {
    const response = await apiClient.post(`/evidence/${evidenceId}/verify`);
    return response.data;
  },
  
  // Generate an AI remediation plan for non-compliant evidence
  generateRemediation: async (evidenceId) => {
    const response = await apiClient.post(`/evidence/${evidenceId}/remediate`);
    return response.data;
  },

  // Simulate applying the AI-generated remediation
  applyRemediation: async (evidenceId) => {
    const response = await apiClient.post(`/evidence/${evidenceId}/apply-fix`);
    return response.data;
  }
};
