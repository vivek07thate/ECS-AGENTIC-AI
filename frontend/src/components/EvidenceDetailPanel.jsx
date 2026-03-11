import React, { useState, useEffect } from 'react';
import { Database, X, FileText, BrainCircuit, ShieldCheck, Clock, User as UserIcon, Loader2, Wrench, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EvidenceDetailPanel({ record: initialRecord, onClose, onRefresh }) {
  const [record, setRecord] = useState(initialRecord);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  if (!record) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await api.verifyEvidence(record.record_id || record.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to verify evidence", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateRemediation = async () => {
    setIsRemediating(true);
    try {
      const updatedRecord = await api.generateRemediation(record.record_id || record.id);
      setRecord(updatedRecord);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to generate remediation", error);
    } finally {
      setIsRemediating(false);
    }
  };

  const handleApplyFix = async () => {
    setIsApplyingFix(true);
    try {
      const updatedRecord = await api.applyRemediation(record.record_id || record.id);
      setRecord(updatedRecord);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to apply remediation fix", error);
    } finally {
      setIsApplyingFix(false);
    }
  };

  const isAuditorOrAdmin = user?.role === 'admin' || user?.role === 'auditor';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full sm:pl-10">
        <div className="pointer-events-auto w-screen max-w-full sm:max-w-2xl transform transition-transform duration-500 sm:duration-700 ease-in-out shadow-2xl">
          <div className="flex h-full flex-col overflow-y-scroll bg-white">
            <div className="px-6 py-6 bg-primary-blue text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Evidence Documentation</h2>
                  <p className="text-blue-100/70 text-xs mt-1 font-mono uppercase">ID: {record.record_id || record.id}</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full hover:bg-white/10 p-2 transition-all active:scale-95"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 px-6 py-8 space-y-8">
              {record.is_verified && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-green-600 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-green-900 font-bold text-sm">Verified Evidence</h3>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-green-800 text-xs flex items-center gap-1">
                        <UserIcon className="h-3 w-3" /> Verified by: <span className="font-bold">{record.verified_by}</span>
                      </p>
                      <p className="text-green-700 text-xs flex items-center gap-1 italic">
                        <Clock className="h-3 w-3" /> {new Date(record.verified_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Database className="h-5 w-5 text-primary-blue" />
                    Metadata
                  </div>
                  <StatusBadge status={record.compliance_status} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100 shadow-inner">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1.5">Originating Agent</p>
                    <p className="text-sm font-bold text-gray-900">{record.agent_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1.5">Analyzed At</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(record.created_at).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 pt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1.5">Application</p>
                      <p className="text-sm font-bold text-gray-900 px-3 py-1 bg-white border border-gray-200 rounded-md inline-block">
                        {record.application_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1.5">Evidence Type</p>
                      <p className="text-sm font-bold text-gray-900 px-3 py-1 bg-white border border-gray-200 rounded-md inline-block">
                        {record.evidence_type || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <FileText className="h-5 w-5 text-primary-blue" />
                  Extracted Data
                </div>
                <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-blue-50 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto shadow-2xl custom-scrollbar selection:bg-blue-500/30">
                  {record.evidence_text}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <BrainCircuit className="h-5 w-5 text-accent-red" />
                  AI Intelligence Verdict
                </div>
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 prose prose-sm max-w-none text-gray-800 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-blue/30 group-hover:bg-primary-blue transition-colors" />
                  <div className="whitespace-pre-wrap leading-relaxed relative z-10 font-medium">
                    {record.ai_response}
                  </div>
                </div>
              </section>

              {/* AUTONOMOUS REMEDIATION SECTION */}
              {(record.compliance_status === 'NON-COMPLIANT' || record.compliance_status === 'REMEDIATED' || record.remediation_plan) && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <Wrench className={`h-5 w-5 ${record.is_remediated ? 'text-green-600' : 'text-orange-500'}`} />
                      Autonomous Remediation
                    </div>
                    {record.is_remediated && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Fix Applied
                      </span>
                    )}
                  </div>
                  
                  <div className={`p-6 rounded-xl border ${record.is_remediated ? 'bg-green-50/50 border-green-100' : 'bg-orange-50/30 border-orange-100'}`}>
                    
                    {!record.remediation_plan ? (
                      <div className="text-center space-y-4 py-2">
                        <p className="text-sm text-gray-600">This evidence is non-compliant. You can use Agentic AI to automatically generate a remediation script.</p>
                        <button
                          onClick={handleGenerateRemediation}
                          disabled={isRemediating}
                          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2 mx-auto"
                        >
                          {isRemediating ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating Fix...</>
                          ) : (
                            <><BrainCircuit className="h-4 w-4" /> Generate AI Remediation</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <p className="text-sm text-gray-700 font-medium">AI-Generated Remediation Plan:</p>
                        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-green-400 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto shadow-2xl custom-scrollbar selection:bg-green-500/30">
                          {record.remediation_plan}
                        </div>
                        
                        {!record.is_remediated && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleApplyFix}
                              disabled={isApplyingFix}
                              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-bold rounded-lg shadow-md shadow-green-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
                            >
                              {isApplyingFix ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Applying Fix...</>
                              ) : (
                                <><Wrench className="h-4 w-4" /> Simulate Applying Fix</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="px-6 py-6 border-t border-gray-200 bg-white shadow-xl flex justify-end gap-3 sticky bottom-0">
              <button className="px-6 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95 shadow-sm">
                <FileText className="h-4 w-4" /> Export Report
              </button>
              
              {!record.is_verified && isAuditorOrAdmin ? (
                <button 
                  disabled={isVerifying}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-primary-blue rounded-lg hover:bg-blue-800 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                  onClick={handleVerify}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Mark as Verified
                    </>
                  )}
                </button>
              ) : record.is_verified ? (
                <div className="px-6 py-2.5 text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 cursor-default shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Verification Complete
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
