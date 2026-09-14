import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill, Plus, Search, Edit3, Trash2, CheckCircle2,
  Clock, AlertTriangle, Package, DollarSign, Calendar,
  ShieldAlert, RefreshCw, Send, Check
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { medicineService } from '../../services/medicineService';
import { prescriptionService } from '../../services/prescriptionService';

export const PharmacyPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'prescriptions'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeMedicine, setActiveMedicine] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    totalInventoryValue: 0,
  });

  // Restock form
  const [restockQty, setRestockQty] = useState('');

  // Add / Edit form
  const initialForm = {
    name: '',
    genericName: '',
    category: 'Antibiotic',
    form: 'Tablet',
    strength: '500mg',
    unitPrice: '',
    stockQuantity: '',
    reorderLevel: '20',
    expiryDate: '',
    manufacturer: 'CarePulse Pharmaceuticals',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [medsRes, statsRes, rxRes] = await Promise.all([
        medicineService.getMedicines({
          category: categoryFilter || undefined,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
        }),
        medicineService.getStats().catch(() => null),
        prescriptionService.getPrescriptions({ status: 'Active', limit: 50 }).catch(() => ({ data: [] })),
      ]);

      setMedicines(medsRes.data || medsRes || []);
      if (statsRes) setStats(statsRes);
      setActivePrescriptions(rxRes.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load pharmacy data');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setActiveMedicine(null);
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setIsEditing(true);
    setActiveMedicine(med);
    setFormData({
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      form: med.form || 'Tablet',
      strength: med.strength || '500mg',
      unitPrice: String(med.unitPrice),
      stockQuantity: String(med.stockQuantity),
      reorderLevel: String(med.reorderLevel || 20),
      expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      manufacturer: med.manufacturer || 'CarePulse Pharmaceuticals',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenRestock = (med) => {
    setActiveMedicine(med);
    setRestockQty('50');
    setIsRestockModalOpen(true);
  };

  const handleSubmitMedicine = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        unitPrice: Number(formData.unitPrice),
        stockQuantity: Number(formData.stockQuantity),
        reorderLevel: Number(formData.reorderLevel),
      };

      if (isEditing) {
        await medicineService.updateMedicine(activeMedicine._id, payload);
        toast.success(`Updated ${formData.name}`);
      } else {
        await medicineService.createMedicine(payload);
        toast.success(`Registered ${formData.name} to pharmacy catalogue`);
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!activeMedicine) return;
    const additional = Number(restockQty);
    if (!additional || additional <= 0) {
      toast.error('Enter a valid stock increment');
      return;
    }

    setSubmitting(true);
    try {
      const newStock = (activeMedicine.stockQuantity || 0) + additional;
      await medicineService.updateMedicine(activeMedicine._id, {
        stockQuantity: newStock,
      });
      toast.success(`Restocked ${activeMedicine.name} (+${additional} units)`);
      setIsRestockModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (med) => {
    if (!window.confirm(`Delete ${med.name} from pharmacy catalogue?`)) return;
    try {
      await medicineService.deleteMedicine(med._id);
      toast.success('Medication removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete medication');
    }
  };

  const handleDispensePrescription = async (prescription) => {
    if (!window.confirm(`Confirm dispensing prescription #${prescription.prescriptionNumber}? This will deduct stock from pharmacy inventory.`)) return;
    try {
      await prescriptionService.dispensePrescription(prescription._id);
      toast.success(`Prescription ${prescription.prescriptionNumber} dispensed & inventory updated`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to dispense prescription');
    }
  };

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);
    return expiry <= sixtyDays;
  };

  const inventoryColumns = [
    {
      key: 'itemCode',
      label: 'Drug Code',
      width: '110px',
      render: (r) => <span className="badge badge-primary">{r.itemCode}</span>,
    },
    {
      key: 'name',
      label: 'Medication Name',
      render: (r) => (
        <div>
          <strong>{r.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.genericName} • {r.form} ({r.strength})
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'stock',
      label: 'Stock In Hand',
      render: (r) => (
        <div>
          <strong>{r.stockQuantity} Units</strong>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min: {r.reorderLevel}</div>
        </div>
      ),
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      width: '95px',
      render: (r) => <strong>${Number(r.unitPrice).toFixed(2)}</strong>,
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (r) => {
        const expiring = isExpiringSoon(r.expiryDate);
        return (
          <span style={{ color: expiring ? 'var(--danger-600)' : 'inherit', fontWeight: expiring ? '600' : 'normal' }}>
            {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : 'N/A'}
            {expiring && <AlertTriangle size={12} style={{ display: 'inline', marginLeft: '4px' }} />}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (r) => {
        const variants = {
          'In Stock': 'badge-success',
          'Low Stock': 'badge-warning',
          'Out of Stock': 'badge-danger',
        };
        return <span className={`badge ${variants[r.status] || 'badge-neutral'}`}>{r.status}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '130px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          {hasRole('Administrator', 'Pharmacist') && (
            <>
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px', color: 'var(--primary-600)' }}
                title="Quick Restock"
                onClick={() => handleOpenRestock(r)}
              >
                <RefreshCw size={14} />
              </button>
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px' }}
                title="Edit Medication"
                onClick={() => handleOpenEdit(r)}
              >
                <Edit3 size={14} />
              </button>
            </>
          )}
          {hasRole('Administrator') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--danger-600)' }}
              title="Delete Medication"
              onClick={() => handleDelete(r)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Pharmacy & Inventory Management"
        subtitle="Medication catalogue, stock level tracking, expiry surveillance, and prescription dispensing."
        icon={Pill}
        breadcrumbs={[{ label: 'Pharmacy' }]}
        badge="Live Inventory"
        actions={
          hasRole('Administrator', 'Pharmacist') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add Medication
            </button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Pill size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.total}</div>
            <div className="metric-label">Catalogue Items</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.lowStock}</div>
            <div className="metric-label">Low Stock Alerts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.expiringSoon}</div>
            <div className="metric-label">Expiring Soon (60d)</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="metric-val">${Number(stats.totalInventoryValue || 0).toLocaleString()}</div>
            <div className="metric-label">Total Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={15} /> Medicine Inventory ({medicines.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <CheckCircle2 size={15} /> Prescriptions to Dispense ({activePrescriptions.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters */}
          <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="Search by brand name, generic chemical, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ minWidth: '160px' }}>
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Analgesic">Analgesic / Painkiller</option>
                  <option value="Antihypertensive">Antihypertensive</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Antacid">Antacid / Gastrointestinal</option>
                  <option value="Antihistamine">Antihistamine</option>
                  <option value="General">General / Other</option>
                </select>
              </div>

              <div style={{ minWidth: '150px' }}>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Stock Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          {loading ? (
            <LoadingSpinner message="Loading drug inventory..." />
          ) : (
            <DataTable
              columns={inventoryColumns}
              data={medicines}
              emptyTitle="No Medications Found"
              emptyMessage="No medicines match the selected filter criteria. Click 'Add Medication' to populate inventory."
            />
          )}
        </>
      ) : (
        /* Prescriptions Dispensing Queue */
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Active Prescriptions Pending Dispensing</h3>
          {activePrescriptions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active doctor prescriptions waiting for pharmacy fulfillment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activePrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    backgroundColor: 'var(--slate-50)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: 'var(--primary-700)', fontSize: '0.95rem' }}>
                        {rx.prescriptionNumber}
                      </strong>
                      <span style={{ margin: '0 0.5rem', color: 'var(--slate-300)' }}>|</span>
                      <span>
                        Patient: <strong>{rx.patient ? `${rx.patient.firstName} ${rx.patient.lastName}` : 'N/A'}</strong> (ID: {rx.patient?.patientId})
                      </span>
                      <span style={{ margin: '0 0.5rem', color: 'var(--slate-300)' }}>|</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Doctor: Dr. {rx.doctor?.name}
                      </span>
                    </div>
                    {hasRole('Administrator', 'Pharmacist') && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDispensePrescription(rx)}
                      >
                        <Check size={14} /> Dispense & Deduct Stock
                      </button>
                    )}
                  </div>

                  {/* Medicines List */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {rx.medicines?.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid var(--slate-200)',
                          borderRadius: '4px',
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <strong>{m.medicineName}</strong> - Qty: {m.quantity} ({m.dosage}, {m.frequency})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT MEDICINE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditing ? 'Update Medication Details' : 'Register Medication to Pharmacy Catalogue'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmitMedicine}>
          <FormGrid>
            <FormGroup label="Brand / Commercial Name" required>
              <Input
                required
                placeholder="e.g. Amoxil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Generic Chemical Name" required>
              <Input
                required
                placeholder="e.g. Amoxicillin"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Therapeutic Category" required>
              <Select
                required
                options={[
                  { value: 'Antibiotic', label: 'Antibiotic' },
                  { value: 'Analgesic', label: 'Analgesic / Anti-inflammatory' },
                  { value: 'Antihypertensive', label: 'Antihypertensive' },
                  { value: 'Antidiabetic', label: 'Antidiabetic' },
                  { value: 'Antacid', label: 'Antacid / Anti-Ulcer' },
                  { value: 'Antihistamine', label: 'Antihistamine / Allergy' },
                  { value: 'General', label: 'General / OTC' },
                ]}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Dosage Form">
              <Select
                options={[
                  { value: 'Tablet', label: 'Tablet' },
                  { value: 'Capsule', label: 'Capsule' },
                  { value: 'Syrup', label: 'Syrup / Suspension' },
                  { value: 'Injection', label: 'Injection / Ampoule' },
                  { value: 'Ointment', label: 'Ointment / Gel' },
                  { value: 'Inhaler', label: 'Inhaler' },
                  { value: 'Drops', label: 'Drops (Eye/Ear)' },
                ]}
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Strength / Dosage">
              <Input
                placeholder="e.g. 500mg, 10mg/ml"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Unit Selling Price ($)" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.85"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Stock Quantity (Units)" required>
              <Input
                type="number"
                min="0"
                required
                placeholder="100"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Low Stock Reorder Threshold">
              <Input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Expiry Date" required>
              <Input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Manufacturer / Brand">
              <Input
                placeholder="CarePulse Pharmaceuticals"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : isEditing ? 'Update Medicine' : 'Register Medicine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK RESTOCK MODAL */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title={`Restock Medication - ${activeMedicine?.name}`}
        maxWidth="420px"
      >
        <form onSubmit={handleRestockSubmit}>
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Current stock in hand: <strong>{activeMedicine?.stockQuantity} units</strong>.
          </div>
          <FormGroup label="Units to Add to Stock" required>
            <Input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsRestockModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Updating...' : 'Add to Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PharmacyPage;
