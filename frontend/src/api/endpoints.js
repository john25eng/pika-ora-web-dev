import client from './client';

// API calls, written in the shape of the code Postman generates for each request
// (Code snippet > NodeJs - Axios): a config object with method, url, headers and
// data, sent with request(config).
//
// Two things are handled once in client.js instead of in every snippet:
//   - the base address is the client's baseURL (set in client.js), so url is just the path
//   - the "Authorization: Token ..." header is added by the client's request interceptor

export const authApi = {
  register: (data) =>
    client.request({
      method: 'post',
      url: '/auth/register/',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    }),

  login: (data) =>
    client.request({
      method: 'post',
      url: '/auth/login/',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    }),

  logout: () =>
    client.request({
      method: 'post',
      url: '/auth/logout/',
    }),

  me: () =>
    client.request({
      method: 'get',
      url: '/auth/me/',
    }),
};

export const patientApi = {
  listDoctors: () =>
    client.request({
      method: 'get',
      url: '/doctors/',
    }),

  doctorSlots: (doctorId) =>
    client.request({
      method: 'get',
      url: `/doctors/${doctorId}/slots/`,
    }),

  book: (slotId) =>
    client.request({
      method: 'post',
      url: `/book/${slotId}/`,
    }),

  myAppointments: () =>
    client.request({
      method: 'get',
      url: '/appointments/',
    }),

  updateNote: (id, notes) =>
    client.request({
      method: 'patch',
      url: `/appointments/${id}/`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ notes }),
    }),

  cancel: (id) =>
    client.request({
      method: 'post',
      url: `/appointments/${id}/cancel/`,
    }),

  reschedule: (id, slotId) =>
    client.request({
      method: 'post',
      url: `/appointments/${id}/reschedule/`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ slot_id: slotId }),
    }),
};

export const adminApi = {
  // dashboard
  dashboard: () =>
    client.request({
      method: 'get',
      url: '/admin/dashboard/',
    }),

  // doctors
  listDoctors: () =>
    client.request({
      method: 'get',
      url: '/admin/doctors/',
    }),

  createDoctor: (data) =>
    client.request({
      method: 'post',
      url: '/admin/doctors/',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    }),

  updateDoctor: (id, data) =>
    client.request({
      method: 'patch',
      url: `/admin/doctors/${id}/`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    }),

  deleteDoctor: (id) =>
    client.request({
      method: 'delete',
      url: `/admin/doctors/${id}/`,
    }),

  // slots
  listSlots: (doctorId) =>
    client.request({
      method: 'get',
      url: doctorId ? `/admin/slots/?doctor=${doctorId}` : '/admin/slots/',
    }),

  createSlot: (data) =>
    client.request({
      method: 'post',
      url: '/admin/slots/',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    }),

  deleteSlot: (id) =>
    client.request({
      method: 'delete',
      url: `/admin/slots/${id}/`,
    }),

  // appointments
  listAppointments: (query) =>
    client.request({
      method: 'get',
      url: query ? `/admin/appointments/?q=${encodeURIComponent(query)}` : '/admin/appointments/',
    }),

  cancelAppointment: (id) =>
    client.request({
      method: 'post',
      url: `/admin/appointments/${id}/cancel/`,
    }),

  rescheduleAppointment: (id, slotId) =>
    client.request({
      method: 'post',
      url: `/admin/appointments/${id}/reschedule/`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ slot_id: slotId }),
    }),

  // patients
  listPatients: () =>
    client.request({
      method: 'get',
      url: '/admin/patients/',
    }),

  updatePatient: (id, data) =>
    client.request({
      method: 'patch',
      url: `/admin/patients/${id}/`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
    }),
};