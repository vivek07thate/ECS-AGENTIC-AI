import React, { useState } from 'react';
import { api } from '../services/api';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function UploadEvidence() {
  const [formData, setFormData] = useState({
    agent_id: 'web-user-001',
    control: '',
    application_name: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const data = new FormData();
    data.append('agent_id', formData.agent_id);
    data.append('control', formData.control);
    data.append('application_name', formData.application_name);
    data.append('evidence_type', formData.evidence_type);
    data.append('file', file);

    try {
      const response = await api.uploadEvidence(data);
      setResult(response);
    } catch (err) {
      console.error("Upload failed", err);
      setError(err.response?.data?.detail || "Upload failed. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const applications = [
    "Core Banking",
    "Payment Gateway",
    "Customer Portal",
    "Mobile Banking App",
    "ATM Network"
  ];

  const evidenceTypes = [
    "PDF Document",
    "Screenshot",
    "Log File",
    "Configuration File",
    "Audit Report"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upload Compliance Evidence</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                <select
                  name="application_name"
                  value={formData.application_name}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                  required
                >
                  <option value="">Select Application</option>
                  {applications.map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
                <select
                  name="evidence_type"
                  value={formData.evidence_type}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                  required
                >
                  <option value="">Select Type</option>
                  {evidenceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Control ID</label>
              <input
                type="text"
                name="control"
                value={formData.control}
                onChange={handleInputChange}
                placeholder="e.g. PCI-DSS-8.2"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evidence File</label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                  file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-blue'
                }`}
              >
                <div className="space-y-1 text-center">
                  {file ? (
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-blue hover:text-blue-500 focus-within:outline-none">
                      <span>{file ? 'Change file' : 'Upload a file'}</span>
                      <input type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    {!file && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    {file ? file.name : 'PNG, JPG, PDF, TXT up to 10MB'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-white font-semibold transition-all shadow-md ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-blue hover:bg-blue-800'
                }`}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                {loading ? 'Processing with AI...' : 'Submit to AI Engine'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent-red" />
              Guidelines
            </h3>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex gap-2">
                <span className="text-primary-blue font-bold">•</span>
                Ensure screenshots capture clear text for OCR processing.
              </li>
              <li className="flex gap-2">
                <span className="text-primary-blue font-bold">•</span>
                PDF documents should be searchable for best results.
              </li>
              <li className="flex gap-2">
                <span className="text-primary-blue font-bold">•</span>
                Include specific control identifiers in the form.
              </li>
            </ul>
          </div>

          {result && (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Upload Successful
              </div>
              <p className="text-sm text-green-600 mb-4">
                The evidence has been processed. AI status: <span className="font-bold">{result.compliance_status}</span>
              </p>
              <button 
                onClick={() => window.location.href = '/evidence-review'}
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                View full analysis &rarr;
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
