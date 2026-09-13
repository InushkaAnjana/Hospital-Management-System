import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, Filter } from 'lucide-react';
import { Skeleton } from './LoadingSpinner';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange = null,
  emptyTitle = 'No records found',
  emptyMessage = 'No matching data matches the current criteria.',
  toolbarActions = null,
  pagination = null,
  onRowClick = null,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const isControlled = onSearchChange !== null;
  const currentSearch = isControlled ? searchValue : internalSearch;

  const handleSearchChange = (e) => {
    if (isControlled) {
      onSearchChange(e.target.value);
    } else {
      setInternalSearch(e.target.value);
    }
  };

  // Filter client-side if uncontrolled
  const displayData = !isControlled && currentSearch
    ? data.filter((item) =>
        Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(currentSearch.toLowerCase())
        )
      )
    : data;

  return (
    <div className="data-table-container">
      {/* Table Toolbar */}
      <div className="data-table-toolbar">
        <div className="data-table-search">
          <Search size={16} color="var(--slate-400)" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={handleSearchChange}
          />
        </div>

        {toolbarActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {toolbarActions}
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      <Skeleton height="16px" width={cIdx === 0 ? '70%' : '90%'} />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Inbox size={32} strokeWidth={1.5} color="var(--slate-400)" />
                    <strong style={{ color: 'var(--text-primary)' }}>{emptyTitle}</strong>
                    <span style={{ fontSize: '0.8125rem' }}>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIdx) => (
                    <td key={col.key || colIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, rowIdx) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="data-table-pagination">
          <div>
            Showing <strong>{displayData.length}</strong> of <strong>{pagination.totalItems || displayData.length}</strong> entries
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-outline btn-sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={pagination.currentPage >= (pagination.totalPages || 1)}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
