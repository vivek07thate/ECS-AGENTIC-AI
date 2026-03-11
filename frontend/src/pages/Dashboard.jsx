import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import EvidenceTable from '../components/EvidenceTable';
import EvidenceDetailPanel from '../components/EvidenceDetailPanel';
import { ShieldCheck, ShieldAlert, Target, Clock } from 'lucide-react';

export default function Dashboard() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getEvidence();
        setEvidence(data);
      } catch (error) {
        console.error("Failed to fetch evidence", error);
        // Fallback to empty context
        setEvidence([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics
  const total = evidence.length;
  const compliant = evidence.filter(e => e.compliance_status?.toUpperCase() === 'COMPLIANT').length;
  const nonCompliant = evidence.filter(e => e.compliance_status?.toUpperCase() === 'NON-COMPLIANT').length;
  const pending = evidence.filter(e => ['NEEDS REVIEW', 'ERROR'].includes(e.compliance_status?.toUpperCase())).length;

  const stats = [
    { title: 'Total Evidence Tracked', value: total, icon: Target, color: 'text-primary-blue', bg: 'bg-blue-100' },
    { title: 'Compliant', value: compliant, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Non-Compliant', value: nonCompliant, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Pending Review', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
        <div className="text-xs md:text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-200 cursor-default">
              <div className={`p-4 rounded-full ${stat.bg}`}>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Application Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-blue" />
          Application Compliance Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Core Banking",
            "Payment Gateway",
            "Customer Portal",
            "Mobile Banking App",
            "ATM Network"
          ].map(app => {
            const appEvidence = evidence.filter(e => e.application_name === app);
            const appTotal = appEvidence.length;
            const appCompliant = appEvidence.filter(e => e.compliance_status?.toUpperCase() === 'COMPLIANT').length;
            const appNonCompliant = appEvidence.filter(e => e.compliance_status?.toUpperCase() === 'NON-COMPLIANT').length;
            
            const healthPercentage = appTotal === 0 ? 0 : Math.round((appCompliant / appTotal) * 100);
            
            return (
              <div key={app} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{app}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    healthPercentage >= 90 ? 'bg-green-100 text-green-700' : 
                    healthPercentage >= 50 ? 'bg-amber-100 text-amber-700' : 
                    appTotal === 0 ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                  }`}>
                    {appTotal === 0 ? 'NO DATA' : `${healthPercentage}% HEALTH`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      healthPercentage >= 90 ? 'bg-green-500' : 
                      healthPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${healthPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{appCompliant} Compliant</span>
                  <span>{appNonCompliant} Non-Compliant</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent AI Analysis Results</h2>
          <button 
            onClick={() => navigate('/evidence-review')}
            className="text-sm text-primary-blue hover:underline font-medium"
          >
            View all activity &rarr;
          </button>
        </div>
        
        {loading ? (
          <div className="h-48 flex items-center justify-center bg-white rounded-lg border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <EvidenceTable 
            data={evidence.slice(0, 5)} 
            onView={(record) => setSelectedRecord(record)}
          />
        )}
      </div>

      <EvidenceDetailPanel 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
      />
    </div>
  );
}
