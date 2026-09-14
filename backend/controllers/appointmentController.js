const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate unique appointment number (e.g. APT-2026-0001)
 */
const generateAppointmentNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Appointment.countDocuments();
  return `APT-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get Start and End of Date
 */
const getDateRange = (dateStr) => {
  const date = new Date(dateStr);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Get All Appointments with filtering
 * GET /api/appointments
 */
const getAppointments = async (req, res, next) => {
  try {
    const { doctor, patient, status, date, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (doctor) filter.doctor = doctor;
    if (patient) filter.patient = patient;
    if (status) filter.status = status;

    if (date) {
      const { start, end } = getDateRange(date);
      filter.appointmentDate = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      const { start } = getDateRange(startDate);
      const { end } = getDateRange(endDate);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate('patient', 'patientId firstName lastName phone bloodGroup gender age')
      .populate('doctor', 'doctorCode name specialization consultationFee department')
      .populate('department', 'name code')
      .sort({ appointmentDate: 1, tokenNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(
      res,
      'Appointments retrieved successfully',
      appointments,
      200,
      {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Appointment by ID
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('department');

    if (!appointment) {
      return next(ApiError.notFound('Appointment not found.'));
    }

    return sendSuccess(res, 'Appointment details retrieved', appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * Book New Appointment (With Conflict Prevention)
 * POST /api/appointments
 */
const bookAppointment = async (req, res, next) => {
  try {
    const {
      patient,
      doctor,
      department,
      appointmentDate,
      timeSlot,
      reason,
      notes,
    } = req.body;

    if (!patient || !doctor || !appointmentDate || !timeSlot) {
      return next(ApiError.badRequest('Patient, Doctor, Appointment Date, and Time Slot are required.'));
    }

    // 1. Verify Patient exists
    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) {
      return next(ApiError.badRequest('Referenced patient does not exist.'));
    }

    // 2. Verify Doctor exists
    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) {
      return next(ApiError.badRequest('Referenced doctor does not exist.'));
    }

    // 3. Verify Doctor is available on this day of week
    const apptDateObj = new Date(appointmentDate);
    const dayName = apptDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (doctorDoc.availableDays && doctorDoc.availableDays.length > 0) {
      if (!doctorDoc.availableDays.includes(dayName)) {
        return next(
          ApiError.badRequest(
            `${doctorDoc.name} is not scheduled to consult on ${dayName}s. Available days: ${doctorDoc.availableDays.join(', ')}.`
          )
        );
      }
    }

    // 4. Conflict Check: Ensure no overlapping active appointment for the doctor at this slot
    const { start, end } = getDateRange(appointmentDate);

    const conflict = await Appointment.findOne({
      doctor: doctorDoc._id,
      appointmentDate: { $gte: start, $lte: end },
      timeSlot,
      status: { $in: ['Scheduled', 'Confirmed', 'In-Consultation'] },
    });

    if (conflict) {
      return next(
        ApiError.conflict(
          `Doctor ${doctorDoc.name} already has a consultation scheduled for slot "${timeSlot}" on ${apptDateObj.toLocaleDateString()}. Please select another time slot or doctor.`
        )
      );
    }

    // 5. Calculate sequential Token Number for the day
    const tokenCount = await Appointment.countDocuments({
      doctor: doctorDoc._id,
      appointmentDate: { $gte: start, $lte: end },
    });
    const tokenNumber = tokenCount + 1;

    // 6. Generate appointment number
    const appointmentNumber = await generateAppointmentNumber();

    const newAppointment = await Appointment.create({
      appointmentNumber,
      patient: patientDoc._id,
      doctor: doctorDoc._id,
      department: department || doctorDoc.department,
      appointmentDate: apptDateObj,
      timeSlot,
      tokenNumber,
      reason: reason || 'General Consultation',
      status: 'Scheduled',
      notes: notes || '',
    });

    const populated = await Appointment.findById(newAppointment._id)
      .populate('patient', 'patientId firstName lastName phone bloodGroup')
      .populate('doctor', 'doctorCode name specialization consultationFee')
      .populate('department', 'name code');

    return sendSuccess(res, 'Appointment booked successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule Appointment (With Conflict Check)
 * PUT /api/appointments/:id/reschedule
 */
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, timeSlot, notes } = req.body;

    if (!appointmentDate || !timeSlot) {
      return next(ApiError.badRequest('New appointment date and time slot are required.'));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(ApiError.notFound('Appointment not found.'));
    }

    if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
      return next(ApiError.badRequest(`Cannot reschedule an appointment that is already ${appointment.status}.`));
    }

    const apptDateObj = new Date(appointmentDate);
    const { start, end } = getDateRange(appointmentDate);

    // Conflict Check excluding current appointment
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      appointmentDate: { $gte: start, $lte: end },
      timeSlot,
      status: { $in: ['Scheduled', 'Confirmed', 'In-Consultation'] },
    });

    if (conflict) {
      return next(
        ApiError.conflict(
          `Doctor already has another consultation booked for slot "${timeSlot}" on ${apptDateObj.toLocaleDateString()}.`
        )
      );
    }

    appointment.appointmentDate = apptDateObj;
    appointment.timeSlot = timeSlot;
    if (notes) appointment.notes = notes;
    appointment.status = 'Scheduled';

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'patientId firstName lastName phone')
      .populate('doctor', 'name specialization')
      .populate('department', 'name code');

    return sendSuccess(res, 'Appointment rescheduled successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Appointment
 * PUT /api/appointments/:id/cancel
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(ApiError.notFound('Appointment not found.'));
    }

    if (appointment.status === 'Completed') {
      return next(ApiError.badRequest('Cannot cancel an already completed consultation.'));
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by patient or clinic.';
    await appointment.save();

    return sendSuccess(res, 'Appointment cancelled successfully', appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Appointment Status (Scheduled -> In-Consultation -> Completed)
 * PUT /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const allowedStatuses = ['Scheduled', 'Confirmed', 'In-Consultation', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return next(ApiError.badRequest(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(ApiError.notFound('Appointment not found.'));
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'patientId firstName lastName')
      .populate('doctor', 'name specialization');

    return sendSuccess(res, `Appointment status updated to ${status}`, populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
};
