import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../components/common/FormComponents';
import { Plus, Download, Filter, Eye, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '../context/NotificationContext';

export const ModulePlaceholderPage = ({
  title,
  subtitle,
  icon: Icon,
  entityName = 'Item',
  metrics = [],
  columns = [],
  sampleData = [],
  formFields = [],
}) => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.success(
      `New ${entityName} submitted successfully (Mock Action). Integration ready for Phase 2+.`,
      `${entityName} Registered`
    );
    setFormData({});
  };

  // Default action column
  const enrichedColumns = [
    ...columns,
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            className="topbar-icon-btn"
            style={{ width: '30px', height: '30px' }}
            title="View Details"
            onClick={() => toast.info(`Viewing details for ${row.name || row.title || row.id || entityName}`)}
          >
            <Eye size={14} />
          </button>
          <button
            className="topbar-icon-btn"
            style={{ width: '30px', height: '30px' }}
            title="Edit Record"
            onClick={() => toast.info(`Editing ${row.name || row.title || row.id || entityName}`)}
          >
            <Edit3 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header with Action Buttons */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={Icon}
        breadcrumbs={[{ label: title }]}
        badge="Foundation Ready"
        actions={
          <>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => toast.info('Exporting report (Ready in Phase 8).')}
            >
              <Download size={15} /> Export
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={15} /> New {entityName}
            </button>
          </>
        }
      />

      {/* KPI Metric Cards */}
      {metrics && metrics.length > 0 && (
        <div className="metrics-grid">
          {metrics.map((m, idx) => {
            const MetricIcon = m.icon;
            return (
              <div key={idx} className="metric-card">
                <div
                  className="metric-icon-wrapper"
                  style={{
                    backgroundColor: m.bgColor || 'var(--primary-100)',
                    color: m.color || 'var(--primary-700)',
                  }}
                >
                  {MetricIcon ? <MetricIcon size={22} /> : <Icon size={22} />}
                </div>
                <div>
                  <div className="metric-val">{m.value}</div>
                  <div className="metric-label">{m.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enterprise Data Table */}
      <DataTable
        columns={enrichedColumns}
        data={sampleData}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Filter ${title.toLowerCase()}...`}
        emptyTitle={`No ${title} Recorded Yet`}
        emptyMessage={`New ${entityName.toLowerCase()} entries will be populated in Phase 2+ upon database schema integration.`}
        toolbarActions={
          <button
            className="btn btn-outline btn-sm"
            onClick={() => toast.info('Filters drawer ready for Phase 2+.')}
          >
            <Filter size={14} /> Filters
          </button>
        }
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: sampleData.length,
          onPageChange: () => {},
        }}
      />

      {/* Create Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Register New ${entityName}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateSubmit}
            >
              Submit & Save
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <FormGrid>
            {formFields.map((field, idx) => (
              <FormGroup
                key={idx}
                label={field.label}
                required={field.required}
                hint={field.hint}
              >
                {field.type === 'select' ? (
                  <Select
                    name={field.name}
                    options={field.options || []}
                    placeholder={field.placeholder || `Select ${field.label}`}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    name={field.name}
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </FormGroup>
            ))}
          </FormGrid>
        </form>
      </Modal>
    </div>
  );
};
