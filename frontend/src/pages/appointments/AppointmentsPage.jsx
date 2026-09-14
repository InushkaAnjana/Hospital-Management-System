import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Plus, Clock, Stethoscope, AlertCircle,
  CheckCircle2, XCircle, RotateCcw, UserCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, Textarea, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';

export const AppointmentsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [conflictError, setConflictError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Booking Form State
  const defaultBooking = {
    patient: '',
    doctor: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 09:30 AM',
    reason: 'Clinical Consultation',
    notes: '',
  };
  const [bookingData, setBookingData] = useState(defaultBooking);

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 09:30 AM',
    notes: '',
  });

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('');

  const standardTimeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '03:30 PM - 04:00 PM',
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptsRes, docs, patsRes] = await Promise.all([
        appointmentService.getAppointments({ status: statusFilter || undefined }),
        doctorService.getDoctors(),
        patientService.getPatients({ limit: 100 }),
      ]);
      setAppointments(apptsRes.data || []);
      setDoctors(docs || []);
      setPatients(patsRes.data || []);

      if (docs.length > 0 && !bookingData.doctor) {
        setBookingData((prev) => ({ ...prev, doctor: docs[0]._id }));
      }
      if (patsRes.data?.length > 0 && !bookingData.patient) {
        setBookingData((prev) => ({ ...prev, patient: patsRes.data[0]._id }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Book Submit
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');
    setSubmitting(true);
    try {
      const booked = await appointmentService.bookAppointment(bookingData);
      toast.success(
        `Appointment booked! Token #${booked.tokenNumber} (${booked.appointmentNumber})`,
        'Booking Confirmed'
      );
      setIsBookOpen(false);
      setBookingData(defaultBooking);
      loadData();
    } catch (err) {
      const msg = err.message || 'Failed to book appointment';
      setConflictError(msg);
      toast.error(msg, 'Booking Conflict');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAppointment) return;
    setConflictError('');
    setSubmitting(true);
    try {
      await appointmentService.rescheduleAppointment(activeAppointment._id, rescheduleData);
      toast.success('Appointment rescheduled successfully.');
      setIsRescheduleOpen(false);
      loadData();
    } catch (err) {
      setConflictError(err.message || 'Slot conflict encountered.');
      toast.error(err.message || 'Rescheduling conflict');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel Submit
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!activeAppointment) return;
    try {
      await appointmentService.cancelAppointment(activeAppointment._id, {
        cancellationReason: cancelReason,
      });
      toast.success('Appointment cancelled.');
      setIsCancelOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  };

  // Handle Quick Status Update
  const handleStatusUpdate = async (appointment, nextStatus) => {
    try {
      await appointmentService.updateStatus(appointment._id, nextStatus);
      toast.success(`Appointment status updated to ${nextStatus}.`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment status');
    }
  };

  const columns = [
    { key: 'token', label: 'Token #', width: '85px', render: (r) => <span className="badge badge-primary" style={{ fontWeight: 800 }}>#{r.tokenNumber}</span> },
    {
      key: 'patient',
      label: 'Patient Name',
      render: (r) => (
        <div>
          <strong>{r.patient?.firstName} {r.patient?.lastName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.patient?.patientId} • {r.patient?.phone}</div>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (r) => (
        <div>
          <strong>{r.doctor?.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>{r.doctor?.specialization}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time Slot',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{new Date(r.appointmentDate).toLocaleDateString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> {r.timeSlot}
          </div>
        </div>
      ),
    },
    { key: 'reason', label: 'Visit Reason', render: (r) => <span style={{ fontSize: '0.8125rem' }}>{r.reason}</span> },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (r) => {
        const variants = {
          Scheduled: 'badge-primary',
          Confirmed: 'badge-primary',
          'In-Consultation': 'badge-warning',
          Completed: 'badge-success',
          Cancelled: 'badge-danger',
        };
        return <span className={`badge ${variants[r.status] || 'badge-neutral'}`}>{r.status}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          {r.status === 'Scheduled' && (
            <button
              className="btn btn-outline btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Start Consultation"
              onClick={() => handleStatusUpdate(r, 'In-Consultation')}
            >
              Start
            </button>
          )}
          {r.status === 'In-Consultation' && (
            <button
              className="btn btn-primary btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Complete Consultation"
              onClick={() => handleStatusUpdate(r, 'Completed')}
            >
              Complete
            </button>
          )}
          {['Scheduled', 'Confirmed'].includes(r.status) && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px' }}
              title="Reschedule Appointment"
              onClick={() => {
                setActiveAppointment(r);
                setConflictError('');
                setRescheduleData({
                  appointmentDate: new Date(r.appointmentDate).toISOString().split('T')[0],
                  timeSlot: r.timeSlot,
                  notes: r.notes || '',
                });
                setIsRescheduleOpen(true);
              }}
            >
              <RotateCcw size={13} />
            </button>
          )}
          {['Scheduled', 'Confirmed', 'In-Consultation'].includes(r.status) && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--danger-600)' }}
              title="Cancel Appointment"
              onClick={() => {
                setActiveAppointment(r);
                setCancelReason('');
                setIsCancelOpen(true);
              }}
            >
              <XCircle size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Appointment Scheduling & Queue"
        subtitle="Patient bookings, slot conflict prevention, and live consultation tracking."
        icon={Calendar}
        breadcrumbs={[{ label: 'Appointments' }]}
        badge="Conflict Guard Active"
        actions={
          hasRole('Administrator', 'Receptionist', 'Doctor', 'Nurse') && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setConflictError('');
                setIsBookOpen(true);
              }}
            >
              <Plus size={15} /> Book Appointment
            </button>
          )
        }
      />

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['', 'Scheduled', 'In-Consultation', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter(st)}
          >
            {st || 'All Appointments'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching appointments..." />
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          emptyTitle="No Appointments Found"
          emptyMessage="No consultations scheduled matching filter. Click 'Book Appointment' to schedule one."
        />
      )}

      {/* BOOK APPOINTMENT MODAL */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Clinical Appointment"
        maxWidth="640px"
      >
        <form onSubmit={handleBookSubmit}>
          {conflictError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-50)',
                color: 'var(--danger-600)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                border: '1px solid var(--danger-light)',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{conflictError}</span>
            </div>
          )}

          <FormGrid>
            <FormGroup label="Select Patient" required>
              <Select
                required
                options={patients.map((p) => ({
                  value: p._id,
                  label: `${p.fullName || `${p.firstName} ${p.lastName}`} (${p.patientId})`,
                }))}
                value={bookingData.patient}
                onChange={(e) => setBookingData({ ...bookingData, patient: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Select Doctor" required>
              <Select
                required
                options={doctors.map((d) => ({
                  value: d._id,
                  label: `${d.name} (${d.specialization}) - $${d.consultationFee}`,
                }))}
                value={bookingData.doctor}
                onChange={(e) => setBookingData({ ...bookingData, doctor: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Consultation Date" required>
              <Input
                type="date"
                required
                value={bookingData.appointmentDate}
                onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Time Slot" required hint="Guaranteed conflict check">
              <Select
                required
                options={standardTimeSlots.map((s) => ({ value: s, label: s }))}
                value={bookingData.timeSlot}
                onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <div style={{ marginTop: '0.75rem' }}>
            <FormGroup label="Reason for Consultation">
              <Input
                placeholder="e.g. Chest discomfort, routine quarterly follow-up..."
                value={bookingData.reason}
                onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
              />
            </FormGroup>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsBookOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Verifying Availability...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title={`Reschedule Appointment (${activeAppointment?.appointmentNumber})`}
        maxWidth="520px"
      >
        <form onSubmit={handleRescheduleSubmit}>
          {conflictError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--danger-50)',
                color: 'var(--danger-600)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{conflictError}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormGroup label="New Date" required>
              <Input
                type="date"
                required
                value={rescheduleData.appointmentDate}
                onChange={(e) => setRescheduleData({ ...rescheduleData, appointmentDate: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="New Slot" required>
              <Select
                required
                options={standardTimeSlots.map((s) => ({ value: s, label: s }))}
                value={rescheduleData.timeSlot}
                onChange={(e) => setRescheduleData({ ...rescheduleData, timeSlot: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Rescheduling Reason / Notes">
              <Input
                placeholder="Reason for reschedule..."
                value={rescheduleData.notes}
                onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
              />
            </FormGroup>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Checking Conflict...' : 'Save Rescheduled Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title={`Cancel Appointment (${activeAppointment?.appointmentNumber})`}
        maxWidth="480px"
      >
        <form onSubmit={handleCancelSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Are you sure you want to cancel the consultation for <strong>{activeAppointment?.patient?.firstName} {activeAppointment?.patient?.lastName}</strong> with <strong>{activeAppointment?.doctor?.name}</strong>?
          </p>
          <FormGroup label="Cancellation Reason" required>
            <Input
              required
              placeholder="e.g. Patient emergency, doctor unavailable..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCancelOpen(false)}>
              Back
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--danger-600)' }}>
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
