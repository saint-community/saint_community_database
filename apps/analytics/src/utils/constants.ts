export const STORAGE_KEYS = {
  TOKEN: 'token',
  ADMIN_TOKEN: 'admin_token',
  IS_AUTHENTICATED: 'isAuthenticated',
  USER: 'user',
};

export const QUERY_PATHS = {
  // account
  ADMIN_LOGIN: '/api/admin/account/login',
  LOGIN: '/api/account/login',
  REGISTER: '/api/account/create',
  LOGOUT: '/api/account/logout',
  ACCOUNTS: '/api/accounts',
  ACCOUNT_DETAIL: '/api/account/:id',
  RESET_PASSWORD: '/api/account/resetpassword',
  UPDATE_PASSWORD: '/api/account/updatepassword',
  DELETE_ACCOUNT: '/api/account/delete/:id',
  UPDATE_ACCOUNT: '/api/account/update',

  // church
  CHURCHES: '/api/churches',
  CHURCH_DETAIL: '/api/church/:id',
  CHURCH_CREATE: '/api/church/create',
  CHURCH_UPDATE: '/api/church/update/:id',

  // fellowship
  FELLOWSHIPS: '/api/fellowships',
  FELLOWSHIP_DETAIL: '/api/fellowship/:id',
  FELLOWSHIP_CREATE: '/api/fellowship/create',
  FELLOWSHIP_UPDATE: '/api/fellowship/update/:id',

  // cells
  CELLS: '/api/cells',
  CELL_DETAIL: '/api/cell/:id',
  CELL_CREATE: '/api/cell/create',
  CELL_UPDATE: '/api/cell/update/:id',

  // workers
  WORKERS: '/api/workers',
  WORKER_DETAIL: '/api/worker/:id',
  WORKER_CREATE: '/api/worker/create',
  WORKER_UPDATE: '/api/worker/update/:id',
  WORKER_FORM_GENERATE: '/api/worker/form/generate',
  WORKER_FORM_DETAIL: '/api/worker/form/:token',
  WORKER_APPROVE: '/api/worker/approve/:id',
  WORKER_REJECT: '/api/worker/reject/:id',
  WORKER_PENDING: '/api/workers/pending',
  WORKER_REJECTED: '/api/workers/rejected',
  WORKER_APPROVED: '/api/workers/approved',

  // departments
  DEPARTMENTS: '/api/departments',
  DEPARTMENT_DETAIL: '/api/departments/:id',
  DEPARTMENT_CREATE: '/api/departments',
  DEPARTMENT_UPDATE: '/api/departments/:id',
  DEPARTMENT_DELETE: '/api/departments/:id',

  // prayer groups
  PRAYER_GROUP_CREATE: '/api/admin/prayer-group/create',
  PRAYER_GROUP_LIST: '/api/admin/prayer-group/all',
  PRAYER_GROUP_RECORDS: '/api/admin/prayer-group/record',
  PRAYER_GROUP_ATTENDANCE_SUBMITTED: '/api/admin/prayer-group/attendance-submitted',
  PRAYER_GROUP_ATTENDANCE_APPROVE_ONE: '/api/admin/prayer-group/mark-one-present',
  PRAYER_GROUP_ATTENDANCE_APPROVE_ALL: '/api/admin/prayer-group/mark-all-present',
  PRAYER_GROUP_ATTENDANCE_REJECT_ONE: '/api/admin/prayer-group/mark-one-absent',
  PRAYER_GROUP_ATTENDANCE_REJECT_ALL: '/api/admin/prayer-group/mark-all-absent',
  PRAYER_GROUP_ADD_PARTICIPANT: '/api/admin/prayer-group/add-member',
  PRAYER_GROUP_REMOVE_PARTICIPANT: '/api/admin/prayer-group/remove-member',
  PRAYER_GROUP_UPDATE: '/api/admin/prayer-group/update',
  PRAYER_GROUP_DELETE: '/api/admin/prayer-group/delete',
  PRAYER_MEETINGS_CREATE: '/api/admin/prayer-meetings/create',

  // statistics
  STATISTICS: '/api/statistics',
  WORKER_STATISTICS: '/api/statistics/workers',
};

export const COUNTRIES = Array.from(
  new Set([
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'United States',
    'United Kingdom',
    'Australia',
    'Canada',
    'New Zealand',
    'Other',
  ])
);

export const ROLES = {
  ADMIN: 'admin',
  PASTOR: 'pastor',
  CHURCH_PASTOR: 'church_pastor',
  FELLOWSHIP_LEADER: 'fellowship_leader',
  CELL_LEADER: 'cell_leader',
};

export const MEETING_DAYS = [
  { value: '1', label: 'Sunday' },
  { value: '2', label: 'Monday' },
  { value: '3', label: 'Tuesday' },
  { value: '4', label: 'Wednesday' },
  { value: '5', label: 'Thursday' },
  { value: '6', label: 'Friday' },
  { value: '7', label: 'Saturday' },
];
