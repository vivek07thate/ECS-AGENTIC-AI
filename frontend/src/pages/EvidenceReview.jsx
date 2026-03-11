import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EvidenceTable from '../components/EvidenceTable';
import EvidenceDetailPanel from '../components/EvidenceDetailPanel';
import StatusBadge from '../components/StatusBadge';
import { Database, Search, Filter, X, FileText, BrainCircuit } from 'lucide-react';

export default function EvidenceReview() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApp, setFilterApp] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getEvidence();
      setEvidence(data);
    } catch (error) {
      console.error("Failed to fetch evidence", error);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique options for filters
  const apps = ['ALL', ...new Set(evidence.map(e => e.application_name).filter(Boolean))].sort();
  const types = ['ALL', ...new Set(evidence.map(e => e.evidence_type).filter(Boolean))].sort();
  const statuses = ['ALL', 'COMPLIANT', 'NON-COMPLIANT', 'NEEDS REVIEW', 'REMEDIATED', 'ERROR'];

  const filteredEvidence = evidence.filter(item => {
    // Search match
    const searchMatch = !searchTerm || 
      item.application_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidence_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.agent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ai_response?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.compliance_status?.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Dropdown matches
    const appMatch = filterApp === 'ALL' || item.application_name === filterApp;
    const typeMatch = filterType === 'ALL' || item.evidence_type === filterType;
    const statusMatch = filterStatus === 'ALL' || item.compliance_status === filterStatus;

    return searchMatch && appMatch && typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evidence Repository</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage all collected evidence and AI audits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-blue focus:border-primary-blue w-64 lg:w-80 shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-sm ${
              showFilters || filterApp !== 'ALL' || filterType !== 'ALL' || filterStatus !== 'ALL'
                ? 'bg-blue-50 border-blue-200 text-primary-blue' 
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Filter className="h-4 w-4" /> 
            Filters {(filterApp !== 'ALL' || filterType !== 'ALL' || filterStatus !== 'ALL') && '(Active)'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Application</label>
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2.5"
            >
              {apps.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Evidence Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2.5"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Compliance Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2.5"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {(filterApp !== 'ALL' || filterType !== 'ALL' || filterStatus !== 'ALL') && (
            <div className="md:col-span-3 flex justify-end border-t border-gray-100 pt-3 mt-1">
               <button
                  onClick={() => {
                    setFilterApp('ALL');
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                    setSearchTerm('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-800 font-medium"
               >
                 Clear all filters
               </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${selectedRecord ? 'lg:col-span-12' : 'lg:col-span-12'} transition-all`}>
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-blue"></div>
            </div>
          ) : (
            <EvidenceTable 
              data={filteredEvidence} 
              onView={(record) => setSelectedRecord(record)} 
            />
          )}
        </div>
      </div>

      <EvidenceDetailPanel 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        onRefresh={() => {
          fetchData();
          // If we have a selected record, update it with the new data from the list
          if (selectedRecord) {
            // fetchData updates the evidence list, but the selectedRecord won't update automatically
            // We should find the updated record in the new list in a follow-up or just close it
            setSelectedRecord(null); 
          }
        }}
      />
    </div>
  );
}
