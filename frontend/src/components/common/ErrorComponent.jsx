import React from 'react';
import { AlertTriangle, RefreshCw, HelpCircle, Inbox } from 'lucide-react';

export const ErrorDisplay = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry = null,
  compact = false,
}) => {
  return (
    <div className="error-card" style={compact ? { padding: '1rem' } : {}}>
      <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 className="error-card-title">{title}</h4>
        <p className="error-card-desc">{message}</p>
        {onRetry && (
          <button className="btn btn-outline btn-sm" onClick={onRetry}>
            <RefreshCw size={14} /> Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export const EmptyState = ({
  title = 'No records found',
  description = 'There is currently no data to display in this view.',
  icon: Icon = Inbox,
  actionText = null,
  onAction = null,
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3.5rem 1.5rem',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-medium)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--slate-100)',
        color: 'var(--slate-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem' }}>
          <ErrorDisplay
            title="Application View Error"
            message={this.state.error?.message || 'A critical rendering error occurred in this view.'}
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
