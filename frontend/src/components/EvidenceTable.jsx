import React from 'react';
import StatusBadge from './StatusBadge';
import { Eye, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function EvidenceTable({ data, onView }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500 border border-gray-200 rounded-lg shadow-sm">
        No evidence records found.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evidence Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Analyzed
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record) => (
              <tr key={record.record_id || record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{record.application_name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs font-medium text-primary-blue bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit uppercase">
                    {record.evidence_type || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={record.compliance_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.is_verified ? (
                    <div className="flex items-center gap-1.5 text-green-600 font-semibold text-xs bg-green-50 px-2 py-1 rounded-full border border-green-100 w-fit">
                      <ShieldCheck className="h-3.5 w-3.5 transition-transform hover:scale-110" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs px-2 py-1 rounded-full border border-gray-100 w-fit group cursor-help" title="Pending legal/compliance review">
                      <ShieldAlert className="h-3.5 w-3.5 transition-colors group-hover:text-amber-500" />
                      Pending
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.agent_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onView && onView(record)}
                    className="text-primary-blue hover:text-blue-800 flex items-center justify-end gap-1 w-full group transition-all"
                  >
                    <Eye className="h-4 w-4 group-hover:scale-110" />
                    <span className="group-hover:translate-x-0.5 transition-transform font-bold">Review</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
