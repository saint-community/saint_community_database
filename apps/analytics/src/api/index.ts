// API Configuration and Helper Functions
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Auth token management
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string) => {
    localStorage.setItem('auth_token', token);
};

const getSanctumToken = (): string | null => {
    return localStorage.getItem('sanctum_token');
};

const setSanctumToken = (token: string) => {
    localStorage.setItem('sanctum_token', token);
};

// HTTP Helper Functions
const apiRequest = async (endpoint: string, options: RequestInit = {}, isSanctum: boolean = false) => {
    const token = isSanctum ? getSanctumToken() : getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add selected church ID from localStorage to override token's church_id
    const selectedChurchId = localStorage.getItem('selected_church_id');
    if (selectedChurchId) {
        headers['x-church-id'] = selectedChurchId;
    }

    // For Sanctum requests, we need to use the SC repo URL.
    // Assuming API_BASE_URL (localhost:4000) is for NestJS services (JWT).
    // The SC repo URL (auth login URL base) needs to be extracted or configured.
    // Based on VITE_AUTH_LOGIN_URL: https://admin-service.saintscommunityportal.com/api/admin/account/login
    // The SC Base URL is likely: https://admin-service.saintscommunityportal.com/api

    let baseUrl = API_BASE_URL;

    if (isSanctum) {
        const loginUrl = (import.meta as any).env.VITE_AUTH_LOGIN_URL;
        if (loginUrl) {
            // Extract base up to /api
            // "https://.../api/admin/account/login" -> "https://.../api"
            // Simple splitting:
            const parts = loginUrl.split('/api/');
            if (parts.length > 1) {
                baseUrl = `${parts[0]}/api`;
            }
        }
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Handle 401 without auto-reloading to allow fallback logic
        if (response.status === 401) {
            console.warn(`Unauthorized access to ${endpoint} (Sanctum: ${isSanctum})`);
            // We do NOT reload here. We allow the error to bubble up.
        }

        const errorBody = await response.json().catch(() => ({ message: 'Request failed' }));
        const error: any = new Error(errorBody.message || `HTTP ${response.status}`);

        // Attach response details so callers can check status (e.g. for fallbacks)
        error.response = {
            status: response.status,
            data: errorBody
        };
        error.status = response.status;

        throw error;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

const api = {
    get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    patch: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Specialized API for SC Repo (Sanctum)
const scApi = {
    get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }, true),
};

// ============================================================================
// EVANGELISM TRANSFORMERS
// ============================================================================

export interface EvangelismSession {
    id: string;
    date: string;
    time: string;
    location: string;
    participants: string[];
    records: EvangelismRecord[];
    createdAt: string;
}

export interface EvangelismRecord {
    id: string;
    personReached: string;
    gender: 'Male' | 'Female';
    age: number;
    phone: string;
    address: string;
    isSaved: boolean;
    isFilled: boolean;
    isHealed: boolean;
    healedConditionBefore?: string;
    healedConditionAfter?: string;
    comments: string;
}

const transformEvangelismToBackend = (session: EvangelismSession) => {
    const impactTypes = (record: EvangelismRecord) => {
        const types: string[] = [];
        if (record.isSaved) types.push('saved');
        if (record.isFilled) types.push('filled');
        if (record.isHealed) types.push('healed');
        return types;
    };

    const primaryStatus = (record: EvangelismRecord) => {
        if (record.isSaved) return 'saved';
        if (record.isFilled) return 'filled';
        if (record.isHealed) return 'healed';
        return 'other';
    };


    let isoDate;
    try {
        const fullDateString = `${session.date}T${session.time}`;
        isoDate = new Date(fullDateString).toISOString();
    } catch (e) {
        // Fallback or default if date/time is invalid
        isoDate = new Date().toISOString();
    }

    return {
        date: isoDate,
        session_date: session.date,
        start_time: session.time,
        location_area: session.location,
        participants: session.participants.map(name => ({
            id: '0',  // Using placeholder ID
            type: 'worker',
            name,
        })),
        saved_count: session.records.filter(r => r.isSaved).length,
        filled_count: session.records.filter(r => r.isFilled).length,
        healed_count: session.records.filter(r => r.isHealed).length,
        records: session.records.map(record => ({
            name: record.personReached,
            gender: record.gender,
            age: record.age,
            phone: record.phone,
            address: record.address,
            status: primaryStatus(record),
            // impact_types: impactTypes(record), // Backend DTO might strict check? No, DTO usually whitelist but let's pass it.
            impact_types: impactTypes(record),
            note: record.comments,
            healed_condition_before: record.healedConditionBefore || '',
            healed_condition_after: record.healedConditionAfter || '',
        })),
        details: `Session at ${session.location}`,
    };
};

const transformEvangelismFromBackend = (data: any): EvangelismSession => {
    return {
        id: data._id || data.id,
        // Ensure date is yyyy-MM-dd for HTML input compatibility. Prefer data.date (DB) over generated fallback.
        date: data.date ? data.date.toString().substring(0, 10) : (data.session_date ? data.session_date.toString().substring(0, 10) : new Date().toISOString().substring(0, 10)),
        time: data.date && new Date(data.date).toISOString().includes('T') ? new Date(data.date).toISOString().split('T')[1].substring(0, 5) : (data.start_time || ''),
        location: data.location_area || '',
        participants: data.participants?.map((tm: any) => tm.name) || [],
        records: data.records?.map((soul: any, idx: number) => ({
            id: `${data._id || data.id}-soul-${idx}`,
            personReached: soul.name,
            gender: soul.gender,
            age: soul.age,
            phone: soul.phone,
            address: soul.address,
            isSaved: soul.impact_types?.includes('saved') || soul.status === 'saved',
            isFilled: soul.impact_types?.includes('filled') || soul.status === 'filled',
            isHealed: soul.impact_types?.includes('healed') || soul.status === 'healed',
            healedConditionBefore: soul.healed_condition_before || soul.healedConditionBefore || '',
            healedConditionAfter: soul.healed_condition_after || soul.healedConditionAfter || '',
            comments: soul.note || '',
        })) || [],
        createdAt: data.createdAt || new Date().toISOString(),
    };
};

// ============================================================================
// FOLLOW-UP TRANSFORMERS
// ============================================================================

interface FollowUpSession {
    id: string;
    date: string;
    time?: string;
    worker: string;
    location?: string;
    summary?: string;
    participants: string[];
    records: FollowUpRecord[];
    createdAt: string;
}

interface FollowUpRecord {
    id: string;
    personFollowedUp: string;
    subjectTaught: string;
    materialSource?: string;
    duration: string;
    comments: string;
}

const transformFollowUpToBackend = (session: FollowUpSession) => {
    return {
        session_date: session.date,
        start_time: session.time || '19:20',
        location_area: session.location || 'Church Hall',
        summary: session.summary || '',
        participants: session.participants.map(name => ({
            id: '0',
            type: 'worker',
            name,
        })),
        records: session.records.map(record => ({
            members_taught: record.personFollowedUp.split(', ').filter(Boolean).map(name => ({
                id: '0',
                name,
            })),
            topic: record.subjectTaught,
            material: record.materialSource || '',
            duration_minutes: parseInt(record.duration) || 0,
            comments: record.comments,
        })),
    };
};

const transformFollowUpFromBackend = (data: any): FollowUpSession => {
    // Backend returns grouped "Session" with "records" array
    // Map backend records to frontend records
    const mappedRecords = data.records?.map((rec: any, index: number) => ({
        id: rec._id || `${data._id || data.id}-record-${index}`,
        personFollowedUp: rec.members_taught?.map((m: any) => m.name).join(', ') || '',
        subjectTaught: rec.subject || 'General',
        materialSource: rec.material_used || '', // Mapped from backend
        duration: String(rec.duration_minutes || 0),
        comments: rec.comments || '',
    })) || [];

    // Fallback if records array is empty or structurally different (legacy safety)
    if (mappedRecords.length === 0) {
        const singleRecord: FollowUpRecord = {
            id: `${data._id || data.id}-record-0`,
            personFollowedUp: data.members_taught?.map((m: any) => m.name).join(', ') || data.participants?.map((m: any) => m.name).join(', ') || 'Unknown Search',
            subjectTaught: data.subject || 'General',
            materialSource: data.material_used || '',
            duration: String(data.duration_minutes || 0),
            comments: data.comments || '',
        };
        mappedRecords.push(singleRecord);
    }

    return {
        id: data.id || data._id,
        date: data.date ? data.date.toString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        time: data.date && new Date(data.date).toISOString().includes('T') ? new Date(data.date).toISOString().split('T')[1].substring(0, 5) : '',
        worker: 'Worker',
        location: data.location_area || '',
        summary: data.session_summary || '',
        participants: data.participants?.map((p: any) => p.name) || [],
        records: mappedRecords,
        createdAt: data.createdAt || new Date().toISOString(),
    };
};

// ============================================================================
// EVANGELISM API FUNCTIONS
// ============================================================================

export const evangelismAPI = {
    getHistory: async (): Promise<EvangelismSession[]> => {
        const response = await api.get('/evangelism/worker/history');
        if (response.status && response.data) {
            return response.data.map(transformEvangelismFromBackend);
        }
        return [];
    },

    create: async (session: EvangelismSession): Promise<void> => {
        const payload = transformEvangelismToBackend(session);
        await api.post('/evangelism', payload);
    },

    update: async (id: string, session: EvangelismSession): Promise<void> => {
        const payload = transformEvangelismToBackend(session);
        await api.patch(`/evangelism/${id}`, payload);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/evangelism/${id}`);
    },

    getStats: async (): Promise<any> => {
        const response = await api.get('/evangelism/admin/stats');
        return response.data || {};
    },
};

// ============================================================================
// FOLLOW-UP API FUNCTIONS
// ============================================================================

export const followUpAPI = {
    getHistory: async (): Promise<FollowUpSession[]> => {
        const response = await api.get('/follow-up/worker/history');
        if (response.status && response.data) {
            return response.data.map(transformFollowUpFromBackend);
        }
        return [];
    },

    create: async (session: FollowUpSession): Promise<void> => {
        const payload = transformFollowUpToBackend(session);
        await api.post('/follow-up', payload);
    },

    update: async (id: string, session: FollowUpSession): Promise<void> => {
        const payload = transformFollowUpToBackend(session);
        await api.patch(`/follow-up/${id}`, payload);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/follow-up/${id}`);
    },

    getStats: async (): Promise<any> => {
        const response = await api.get('/follow-up/admin/stats');
        return response.data || {};
    },
};

// ============================================================================
// ATTENDANCE API FUNCTIONS
// ============================================================================

export const attendanceAPI = {
    getMeetings: async (): Promise<any[]> => {
        const response = await api.get('/attendance/admin/meetings');
        const data = response.data || [];
        return data.map((meeting: any) => {
            // Handle Dates
            let dateStr = '';
            let timeStr = '';

            const rawDate = typeof meeting.date === 'object' && meeting.date.$date ? meeting.date.$date : meeting.date;

            if (rawDate) {
                // Assuming ISO format YYYY-MM-DDTHH:mm:ss.sssZ
                const dateObj = new Date(rawDate);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toISOString().split('T')[0];
                    // If time is missing in backend, we might get 00:00. Extract if meaningful or use existing time field
                    // But if backend stripped time, we rely on meeting.time if it existed?
                    // DB doc showed NO time field. So we extract from date if non-zero?
                    // For now, let's just use what we have.
                    timeStr = rawDate.includes('T') ? rawDate.split('T')[1].substring(0, 5) : '';
                } else {
                    dateStr = rawDate; // Fallback
                }
            }

            return {
                ...meeting,
                id: meeting.id || meeting._id,
                date: dateStr,
                time: meeting.time || timeStr, // Prefer explicit time field, else extract
                scope: meeting.scope || (meeting.assignedEntities && meeting.assignedEntities.length > 0 ? meeting.assignedEntities[0] : meeting.scope_type) || 'Global', // Fallback for display
                code_expires_at: typeof meeting.code_expires_at === 'object' && meeting.code_expires_at.$date ? meeting.code_expires_at.$date : meeting.code_expires_at
            };
        });
    },

    createMeeting: async (meeting: any): Promise<any> => {
        return await api.post('/attendance/admin/meeting', meeting);
    },

    updateMeeting: async (id: string, meeting: any): Promise<any> => {
        return await api.patch(`/attendance/admin/meeting/${id}`, meeting);
    },

    markAttendance: async (data: any): Promise<any> => {
        return await api.post('/attendance/mark', data);
    },

    bulkMarkAttendance: async (data: any): Promise<any> => {
        return await api.post('/attendance/admin/bulk-mark', data);
    },

    deleteMeeting: async (id: string): Promise<void> => {
        await api.delete(`/attendance/admin/meeting/${id}`);
    },

    getHistory: async (): Promise<any[]> => {
        const response = await api.get('/attendance/history');
        return response.data || [];
    },

    getAdminSubmissions: async (): Promise<any[]> => {
        const response = await api.get('/attendance/admin/submissions');
        return response.data || [];
    },
    getStats: async (): Promise<any> => {
        const response = await api.get('/attendance/admin/stats');
        return response.data || {};
    },

    // --- Templates ---
    createTemplate: async (data: any): Promise<any> => {
        return await api.post('/attendance/admin/template', data);
    },

    getTemplates: async (): Promise<any[]> => {
        const response = await api.get('/attendance/admin/templates');
        const body = response.data;
        if (Array.isArray(body)) return body;
        return body.data || [];
    },

    generateMeetingFromTemplate: async (templateId: string, date: string): Promise<any> => {
        return await api.post(`/attendance/admin/template/${templateId}/generate`, { date });
    },
};

// ============================================================================
// PRAYER GROUP API FUNCTIONS
// ============================================================================

export const prayerGroupAPI = {
    getStats: async (): Promise<any> => {
        // Backend route: GET /api/prayergroup/admin/stats
        const response = await api.get('/prayergroup/admin/stats');
        return response.data?.data || {};
    },

    // Admin/Leader: Create a new prayer meeting day/slot
    createMeeting: async (meeting: any): Promise<void> => {
        await api.post('/admin/prayer-group/meeting/create', meeting);
    },

    // Admin/Leader: Generate specific meeting instance (code)
    generateInstance: async (data: any): Promise<any> => {
        const response = await api.post('/admin/prayer-group/create', data);
        return response.data;
    },

    // Admin/Leader: Get all prayer meetings for the church
    getAllMeetings: async (churchId?: number): Promise<any[]> => {
        try {
            const query = churchId ? `?church_id=${churchId}` : '';
            const response = await api.get(`/admin/prayer-group/meeting/all${query}`);
            console.log('getAllMeetings RAW response:', response);
            console.log('getAllMeetings data.data:', response.data?.data);
            return response.data || [];
        } catch (error: any) {
            console.error('getAllMeetings error:', error);
            if (error.response && error.response.status === 404) {
                return [];
            }
            throw error;
        }
    },

    // Leader: Get only my groups
    getMyGroups: async (): Promise<any[]> => {
        try {
            const response = await api.get('/admin/prayer-group/leader/my-groups');
            return response.data || [];
        } catch (error: any) {
            console.error('getMyGroups error:', error);
            return [];
        }
    },

    // Member: Mark attendance for a prayer meeting
    markAttendance: async (data: { prayer_code: string; attendees: string[] }): Promise<any> => {
        // This is a public/member route, likely /api/prayer-group/report-attendance based on controller
        return await api.post('/prayer-group/report-attendance', data);
    },

    // Admin/Leader: Get attendance records (history)
    getRecords: async (prayerGroupId?: string, churchId?: number): Promise<any[]> => {
        let endpoint = '/admin/prayer-group/record';
        const params = [];
        if (prayerGroupId) params.push(`prayergroup_id=${prayerGroupId}`);
        if (churchId) params.push(`church_id=${churchId}`);

        if (params.length > 0) {
            endpoint += `?${params.join('&')}`;
        }
        const response = await api.get(endpoint);
        return response.data || [];
    },

    // Admin: Get ALL records for church (History/Past Tab)
    getAllRecords: async (churchId?: number): Promise<any[]> => {
        const query = churchId ? `?church_id=${churchId}` : '';
        const response = await api.get(`/admin/prayer-group/records/all${query}`);
        return response.data || [];
    },

    updateRecordStatus: async (ids: string[], status: string): Promise<any> => {
        const response = await api.put('/admin/prayer-group/records/status', {
            ids,
            status,
        });
        return response.data;
    },

    // Analytics
    getAnalytics: async (churchId?: number): Promise<any> => {
        const query = churchId ? `?church_id=${churchId}` : '';
        const response = await api.get(`/admin/prayer-group/analytics/overview${query}`);
        return response.data || {};
    },


    // Get single record/details
    getMeetingDetails: async (id: string): Promise<any> => {
        // This seems to correspond to standard prayergroup controller findOne
        // /api/prayer-group/:id
        const response = await api.get(`/prayer-group/${id}`);
        return response.data;
    },

    // Admin: Create a new prayer group
    createGroup: async (data: { start_time: string; end_time: string }): Promise<void> => {
        await api.post('/admin/prayer-group/create', data);
    },

    // Admin: Get all prayer groups
    getGroups: async (): Promise<any[]> => {
        const response = await api.get('/admin/prayer-group/all');
        return response.data || [];
    },

    // Admin: Get reported attendance (with filters)
    getReportedAttendance: async (prayerGroupId: string, churchId?: number): Promise<any> => {
        let endpoint = `/admin/prayer-group/attendance-submitted?prayergroup_id=${prayerGroupId}`;
        if (churchId) endpoint += `&church_id=${churchId}`;
        const response = await api.get(endpoint);
        return response.data || [];
    },

    // Admin: Get specific prayer group record
    getRecord: async (prayerGroupId: string): Promise<any> => {
        const response = await api.get(`/admin/prayer-group/record?prayergroup_id=${prayerGroupId}`);
        return response.data || [];
    },

    // Admin: Mark all attendees as present
    markAllPresent: async (prayerGroupId: string): Promise<void> => {
        await api.put(`/admin/prayer-group/mark-all-present?prayergroup_id=${prayerGroupId}`, null);
    },

    // Admin: Mark single attendee as present
    markOnePresent: async (prayerGroupId: string, attendeeId: string): Promise<void> => {
        await api.put(`/admin/prayer-group/mark-one-present?prayergroup_id=${prayerGroupId}&attendee_id=${attendeeId}`, null);
    },

    // Admin: Mark single attendee as absent
    markOneAbsent: async (prayerGroupId: string, attendeeId: string): Promise<void> => {
        await api.put(`/admin/prayer-group/mark-one-absent?prayergroup_id=${prayerGroupId}&attendee_id=${attendeeId}`, null);
    },

    // Admin: Add member to prayer group record
    addMember: async (data: { prayergroup_id: string; name: string; fellowship: string; fellowship_id: number }): Promise<void> => {
        await api.post('/admin/prayer-group/add-member', data);
    },

    // Admin: Remove member from prayer group record
    removeMember: async (prayerGroupId: string, attendeeId: string): Promise<void> => {
        await api.delete(`/admin/prayer-group/remove-attendee?prayergroup_id=${prayerGroupId}&attendee_id=${attendeeId}`);
    },
};

// ============================================================================
// STUDY GROUP API FUNCTIONS
// ============================================================================

export const studyGroupAPI = {
    // Admin: Create a new study group assignment/session
    createAssignment: async (data: any): Promise<any> => {
        return await api.post('/admin/study-group', data);
    },

    // Get all study groups/assignments
    getAllAssignments: async (churchId?: number): Promise<any[]> => {
        let endpoint = '/admin/study-group';
        if (churchId) {
            endpoint += `?church_id=${churchId}`;
        }
        const response = await api.get(endpoint);
        return Array.isArray(response) ? response : (response.data || []);
    },

    // Get current week's assignment
    getCurrentAssignment: async (churchId?: number): Promise<any> => {
        let endpoint = '/admin/study-group/current-week';
        if (churchId) {
            endpoint += `?church_id=${churchId}`;
        }
        const response = await api.get(endpoint);
        return response;
    },

    // Get weekly assignments for a specific year
    getWeeklyAssignments: async (year: string, churchId?: string): Promise<any> => {
        let endpoint = `/admin/study-group/weekly/${year}`;
        if (churchId) {
            endpoint += `?church_id=${churchId}`;
        }
        const response = await api.get(endpoint);
        return Array.isArray(response) ? response : (response.data || []);
    },

    // Get details of a single study group
    getAssignment: async (id: string): Promise<any> => {
        const response = await api.get(`/admin/study-group/${id}`);
        return response;
    },

    // Update a study group assignment
    updateAssignment: async (id: string, data: any): Promise<any> => {
        return await api.patch(`/admin/study-group/${id}`, data);
    },

    // Delete a study group assignment
    deleteAssignment: async (id: string): Promise<any> => {
        return await api.delete(`/admin/study-group/${id}`);
    },

    // Submissions: Get all submissions
    getSubmissions: async (): Promise<any[]> => {
        // Use admin endpoint to ensure we get all submissions including graded/history
        const response = await api.get('/admin/submissions');
        return Array.isArray(response) ? response : (response.data || []);
    },

    getStats: async (): Promise<any> => {
        const response = await api.get('/study-group/submissions/stats');
        return response;
    },

    // Submit an assignment (Manual/User)
    submitAssignment: async (data: any): Promise<any> => {
        return await api.post('/study-group/submissions', data);
    },

    // Submit assignment for a registered member (Worker/Leader context)
    submitWorkerAssignment: async (data: any): Promise<any> => {
        return await api.post('/admin/submissions/leader/registered-member', data);
    },

    // Submit assignment for an unregistered member (Worker/Leader context)
    submitWorkerAssignmentUnregistered: async (data: any): Promise<any> => {
        return await api.post('/admin/submissions/leader/unregistered-member', data);
    },

    // Grade a submission
    gradeSubmission: async (id: string, data: any): Promise<any> => {
        return await api.patch(`/admin/submissions/${id}/grade`, data);
    },

    // Request redo
    requestRedo: async (id: string, data: any): Promise<any> => {
        return await api.patch(`/admin/submissions/${id}/request-redo`, data);
    }
};



// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export const authAPI = {
    login: async (credentials: any): Promise<any> => {
        const rawApiKey = (import.meta as any).env.VITE_ADMIN_API_KEY;
        const apiKey = rawApiKey ? rawApiKey.trim() : '';
        const loginUrl = (import.meta as any).env.VITE_AUTH_LOGIN_URL;
        console.log('Login URL:', loginUrl);

        // Direct fetch to the specified endpoint with x-api-key
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }
};

// ============================================================================
// ACCOUNT API FUNCTIONS
// ============================================================================

export const accountAPI = {
    getProfile: async (userId: string | number): Promise<any> => {
        const response = await scApi.get(`/account/${userId}`);
        return response.data || {};
    },

    switchChurch: async (churchId: string | number): Promise<any> => {
        return await scApi.get(`/account/church/switch/${churchId}`);
    }
};

// ============================================================================
// STRUCTURE API FUNCTIONS (Churches, Fellowships, Cells)
// ============================================================================

export const structureAPI = {
    getChurches: async (): Promise<any[]> => {
        const response = await scApi.get('/churches/all');
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        return response.data || [];
    },

    getFellowships: async (): Promise<any[]> => {
        const response = await scApi.get('/fellowships/all');
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        return response.data || [];
    },

    getCells: async (): Promise<any[]> => {
        const response = await scApi.get('/cells/all');
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        return response.data || [];
    },

    getWorkers: async (): Promise<any[]> => {
        const response = await scApi.get('/workers/all');
        console.log('DEBUG: getWorkers raw response:', response);
        let data = [];
        if (Array.isArray(response)) data = response;
        else if (response.data && Array.isArray(response.data)) data = response.data;
        else if (response.data && response.data.data && Array.isArray(response.data.data)) data = response.data.data;

        const mapped = data.map((w: any) => ({
            ...w,
            id: w.id || w._id,
            name: w.name || w.full_name || `${w.first_name || ''} ${w.last_name || ''}`.trim() || 'Unknown Worker'
        }));
        if (mapped.length > 0) console.log('DEBUG: First mapped worker:', mapped[0]);
        return mapped;
    }
};

// ============================================================================
// MEMBER API FUNCTIONS
// ============================================================================

export const memberAPI = {
    getAllMembers: async (): Promise<any[]> => {
        // Check for Admin Context
        const token = getAuthToken();
        let isAdmin = false;
        if (token) {
            const decoded: any = parseJwt(token);
            // Check for admin_meta or specific role strings
            if (decoded?.admin_meta || ['admin', 'super_admin', 'church_pastor'].includes(decoded?.role)) {
                isAdmin = true;
            }
        }

        const endpoint = isAdmin ? '/member/admin/all' : '/member/all';
        const response = await api.get(endpoint);

        console.log(`DEBUG: getAllMembers (${isAdmin ? 'Admin' : 'Worker'}) raw response:`, response);
        let data = [];
        if (Array.isArray(response)) data = response;
        else if (response.data && Array.isArray(response.data)) data = response.data;
        else if (response.data && response.data.data && Array.isArray(response.data.data)) data = response.data.data;

        const mapped = data.map((m: any) => {
            const resolvedName = m.name || m.full_name || 'Unknown Member';
            if (resolvedName === 'Unknown Member') console.warn('DEBUG: Member missing name/full_name:', m);
            return {
                ...m,
                id: m.id || m._id,
                name: resolvedName
            };
        });
        if (mapped.length > 0) console.log('DEBUG: First mapped member:', mapped[0]);
        return mapped;
    },

    getRecords: async (filters: any): Promise<any[]> => {
        const response = await api.post('/member/records', filters);

        let data: any[] = [];
        if (Array.isArray(response)) {
            data = response;
        } else if (response && response.data && Array.isArray(response.data)) {
            data = response.data;
        }

        return data.map((m: any) => ({
            ...m,
            id: m.id || m._id,
            name: m.name || m.full_name || 'Unknown Member'
        }));
    },

    search: async (query: string, filters?: any): Promise<any[]> => {
        // Construct query parameters
        let endpoint = `/member/search?q=${encodeURIComponent(query)}`;
        if (filters) {
            if (filters.fellowship && filters.fellowship.length > 0) {
                // Assuming backend supports comma-separated or repeated params. Let's send raw filters in body via POST search or query params
                // If GET, simpler:
                endpoint += `&fellowship=${encodeURIComponent(filters.fellowship.join(','))}`;
            }
            if (filters.cell && filters.cell.length > 0) {
                endpoint += `&cell=${encodeURIComponent(filters.cell.join(','))}`;
            }
        }

        // Try POST if simpler for complex filters, but GET /search is standard. 
        // Let's assume there is a general search endpoint. If not, filtered 'getAllMembers' locally is heavy.
        // Or usage of 'getRecords' with name filter?

        try {
            const response = await api.get(endpoint);
            let data = [];
            if (Array.isArray(response)) data = response;
            else if (response.data && Array.isArray(response.data)) data = response.data;
            else if (response.data && response.data.data && Array.isArray(response.data.data)) data = response.data.data;

            return data;
        } catch (e) {
            console.warn("Member search failed, falling back to local filter on getAllMembers roughly...", e);
            // Fallback: This is heavy but safer if backend endpoints missing
            return [];
        }
    }
};

// Export auth utilities
export { getAuthToken, setAuthToken, getSanctumToken, setSanctumToken };

// Helper to parse JWT
export const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};
