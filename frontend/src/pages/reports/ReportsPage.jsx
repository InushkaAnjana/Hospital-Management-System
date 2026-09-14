import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, Calendar, DollarSign, Pill,
  FlaskConical, Briefcase, Printer, Download, Filter
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { reportService } from '../../services/reportService';

export const ReportsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('revenue'); // 'patients' | 'appointments' | 'revenue' | 'pharmacy' | 'laboratory' | 'staff'
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      let data = null;
      if (activeTab === 'patients') {
        data = await reportService.getPatientReport(params);
      } else if (activeTab === 'appointments') {
        data = await reportService.getAppointmentReport(params);
      } else if (activeTab === 'revenue') {
        data = await reportService.getRevenueReport(params);
      } else if (activeTab === 'pharmacy') {
        data = await reportService.getPharmacyReport(params);
      } else if (activeTab === 'laboratory') {
        data = await reportService.getLabReport(params);
      } else if (activeTab === 'staff') {
        data = await reportService.getStaffReport(params);
      }
      setReportData(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, toast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const tabs = [
    { id: 'revenue', label: 'Financial & Revenue', icon: DollarSign },
    { id: 'patients', label: 'Patient Demographics', icon: Users },
    { id: 'appointments', label: 'Appointments & Consultations', icon: Calendar },
    { id: 'pharmacy', label: 'Pharmacy & Stock', icon: Pill },
    { id: 'laboratory', label: 'Laboratory Diagnostics', icon: FlaskConical },
    { id: 'staff', label: 'Staff & HR Roster', icon: Briefcase },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Hospital Analytics & Operational Reports"
        subtitle="Audited statistical breakdowns, financial summaries, pharmaceutical logistics, and clinical throughput."
        icon={BarChart3}
        breadcrumbs={[{ label: 'Reports' }]}
        badge="Analytics Engine"
        actions={
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={15} /> Print / Export PDF
          </button>
        }
      />

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date Range Toolbar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-sm" onClick={loadReport}>
            <Filter size={14} /> Filter Analytics
          </button>
        </div>
      </div>

      {/* Report View Body */}
      {loading ? (
        <LoadingSpinner message="Calculating analytics & generating report..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. REVENUE REPORT */}
          {activeTab === 'revenue' && reportData && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div>
                    <div className="metric-val" style={{ color: 'var(--primary-600)' }}>
                      ${Number(reportData.totals?.totalBilled || 0).toLocaleString()}
                    </div>
                    <div className="metric-label">Total Invoiced Amount</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div>
                    <div className="metric-val" style={{ color: 'var(--success-600)' }}>
                      ${Number(reportData.totals?.totalCollected || 0).toLocaleString()}
                    </div>
                    <div className="metric-label">Actual Revenue Collected</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div>
                    <div className="metric-val" style={{ color: 'var(--danger-600)' }}>
                      ${Number(reportData.totals?.totalOutstanding || 0).toLocaleString()}
                    </div>
                    <div className="metric-label">Outstanding Receivables</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Revenue Breakdown by Medical Service</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--slate-200)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>Service Type</th>
                        <th style={{ padding: '0.5rem' }}>Volume</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total Billed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byServiceType?.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                          <td style={{ padding: '0.5rem' }}><strong>{s._id}</strong></td>
                          <td style={{ padding: '0.5rem' }}>{s.count} items</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>${Number(s.totalAmount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Payment Settlement Statuses</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {reportData.byPaymentStatus?.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
                        <span className="badge badge-primary">{p._id}</span>
                        <span>{p.count} Invoices (${Number(p.amount).toFixed(2)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PATIENTS REPORT */}
          {activeTab === 'patients' && reportData && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div>
                    <div className="metric-val">{reportData.totalRegistered}</div>
                    <div className="metric-label">Total Patients Registered</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Gender Demographics</h4>
                  {reportData.byGender?.map((g, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span>{g._id || 'Not Specified'}</span>
                      <strong>{g.count} patients</strong>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Blood Group Distribution</h4>
                  {reportData.byBloodGroup?.map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span className="badge badge-primary">{b._id || 'Unknown'}</span>
                      <strong>{b.count} registered</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. APPOINTMENTS REPORT */}
          {activeTab === 'appointments' && reportData && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div>
                    <div className="metric-val">{reportData.totalAppointments}</div>
                    <div className="metric-label">Total Appointments</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Appointments by Clinical Status</h4>
                  {reportData.byStatus?.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span className="badge badge-neutral">{s._id}</span>
                      <strong>{s.count} visits</strong>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Consultation Volume by Doctor</h4>
                  {reportData.byDoctor?.map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span>{d.doctorName || 'Doctor'}</span>
                      <strong>{d.count} appointments</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. PHARMACY REPORT */}
          {activeTab === 'pharmacy' && reportData && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div>
                    <div className="metric-val">{reportData.totalMedicines}</div>
                    <div className="metric-label">Catalogue Medications</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div>
                    <div className="metric-val" style={{ color: 'var(--danger-600)' }}>
                      {reportData.lowStockItems?.length || 0}
                    </div>
                    <div className="metric-label">Understocked Medications</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div>
                    <div className="metric-val" style={{ color: 'var(--warning-600)' }}>
                      {reportData.expiringItems?.length || 0}
                    </div>
                    <div className="metric-label">Expiring within 60 Days</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Stock Quantities by Therapeutic Class</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {reportData.byCategory?.map((c, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c._id}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{c.totalStock} units</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.count} drug formulations</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. LABORATORY REPORT */}
          {activeTab === 'laboratory' && reportData && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div>
                    <div className="metric-val">{reportData.totalTests}</div>
                    <div className="metric-label">Total Diagnostic Investigations</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Pathology Tests by Priority</h4>
                  {reportData.byPriority?.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span className="badge badge-primary">{p._id}</span>
                      <strong>{p.count} tests</strong>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Volume by Laboratory Category</h4>
                  {reportData.byCategory?.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span>{c._id}</span>
                      <strong>{c.count} orders</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. STAFF REPORT */}
          {activeTab === 'staff' && reportData && (
            <div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div>
                    <div className="metric-val">{reportData.totalStaff}</div>
                    <div className="metric-label">Total Hospital Employees</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Headcount by Hospital Role</h4>
                  {reportData.byRole?.map((r, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span>{r._id}</span>
                      <strong>{r.count} staff</strong>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Staff by Department</h4>
                  {reportData.byDepartment?.map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                      <span>{d.departmentName || 'Central Administration'}</span>
                      <strong>{d.count} employees</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
