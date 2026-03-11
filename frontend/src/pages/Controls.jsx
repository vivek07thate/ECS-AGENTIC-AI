import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Shield, BookOpen, Search, ExternalLink } from 'lucide-react';

export default function Controls() {
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const data = await api.getControls();
        setControls(data);
      } catch (err) {
        console.error("Failed to fetch controls", err);
      } finally {
        setLoading(false);
      }
    };
    fetchControls();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Controls</h1>
          <p className="text-gray-500 text-sm">Regulatory framework mapping and control status tracking.</p>
        </div>
        <button className="bg-primary-blue text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Import Framework
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-sm uppercase">
        <div className="grid grid-cols-4 gap-4 p-4 font-bold text-gray-500 bg-gray-50 border-b border-gray-200">
          <div className="col-span-2">Control Description</div>
          <div>Framework</div>
          <div>Current Status</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading controls...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {controls.map(control => (
              <div key={control.id} className="grid grid-cols-4 gap-4 p-5 items-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="col-span-2">
                  <div className="text-sm font-bold text-gray-900 group-hover:text-primary-blue transition-colors flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-300" />
                    {control.id}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 lowercase first-letter:uppercase">{control.description}</div>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {control.framework}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={control.status} />
                  <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-primary-blue" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
          <h3 className="font-bold text-primary-blue mb-2">Framework Coverage</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Your current auditing coverage includes PCI DSS v4.0, ISO 27001 (A.5-A.18), and local RBI Cybersecurity guidelines. 
            AI agents are currently mapped to 14 automatic controls.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">Audit Readiness</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Overall audit readiness index is at <span className="font-bold text-green-600">82%</span>. 
            Automated evidence collection is reducing manual audit effort by 14 hours per week.
          </p>
        </div>
      </div>
    </div>
  );
}
