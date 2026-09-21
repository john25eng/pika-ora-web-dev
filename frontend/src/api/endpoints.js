import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  logout: () => client.post('/auth/logout/'),
  me: () => client.get('/auth/me/'),
};

export const patientApi = {
  listDoctors: () => client.get('/doctors/'),
  doctorSlots: (doctorId) => client.get(`/doctors/${doctorId}/slots/`),
  book: (slotId) => client.post(`/book/${slotId}/`),
  myAppointments: () => client.get('/appointments/'),
  updateNote: (id, notes) => client.patch(`/appointments/${id}/`, { notes }),
  cancel: (id) => client.post(`/appointments/${id}/cancel/`),
};

export const adminApi = {
  // doctors
  listDoctors: () => client.get('/admin/doctors/'),
  createDoctor: (data) => client.post('/admin/doctors/', data),
  updateDoctor: (id, data) => client.patch(`/admin/doctors/${id}/`, data),
  deleteDoctor: (id) => client.delete(`/admin/doctors/${id}/`),

  // slots
  listSlots: (doctorId) => client.get('/admin/slots/', { params: doctorId ? { doctor: doctorId } : {} }),
  createSlot: (data) => client.post('/admin/slots/', data),
  deleteSlot: (id) => client.delete(`/admin/slots/${id}/`),

  // appointments
  listAppointments: (query) => client.get('/admin/appointments/', { params: query ? { q: query } : {} }),
  cancelAppointment: (id) => client.post(`/admin/appointments/${id}/cancel/`),

  // patients
  listPatients: () => client.get('/admin/patients/'),
  updatePatient: (id, data) => client.patch(`/admin/patients/${id}/`, data),
};
