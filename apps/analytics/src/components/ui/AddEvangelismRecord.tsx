"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { submitEvangelismReport, CreateEvangelismReportData, TeamMember, Soul } from '@/services/evangelism'

const PARTICIPANT_LIST = [
  "Mary J.",
  "Sarah Smith",
  "Elizabeth Bennet",
  "Jane Bennet",
  "James O.",
  "Michael Jordan",
  "Fitzwilliam Darcy",
  "Charles Bingley",
  "Sarah Miller",
  "Chris Evans",
  "George Wickham",
  "John Doe",
  "Robert Downey",
  "Lydia Bennet",
]

interface SoulReachedRecord {
  id: number;
  name: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  phone: string;
  address: string;
  note: string;
  impact_types: ("saved" | "filled" | "healed")[];
}

interface AddEvangelismRecordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddEvangelismRecordModal({ onClose, onSuccess }: AddEvangelismRecordModalProps) {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState("19:00")
  const [locationArea, setLocationArea] = useState("")
  const [participants, setParticipants] = useState(["PASTOR JOHN"])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set(PARTICIPANT_LIST.slice(0, 2)))
  const [details, setDetails] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [records, setRecords] = useState<SoulReachedRecord[]>([
    {
      id: 1,
      name: "",
      gender: "Male",
      age: 25,
      phone: "",
      address: "",
      note: "",
      impact_types: ["saved"],
    },
  ])

  const handleAddParticipant = (name: string) => {
    if (selectedParticipants.has(name)) {
      selectedParticipants.delete(name)
    } else {
      selectedParticipants.add(name)
    }
    setSelectedParticipants(new Set(selectedParticipants))
  }

  const handleRemoveTag = (tag: string) => {
    setParticipants(participants.filter((p) => p !== tag))
  }

  const handleAddRecord = () => {
    setRecords([
      ...records,
      {
        id: records.length + 1,
        name: "",
        gender: "Male",
        age: 25,
        phone: "",
        address: "",
        note: "",
        impact_types: ["saved"],
      },
    ])
  }

  const handleDeleteRecord = (id: number) => {
    setRecords(records.filter((r) => r.id !== id))
  }

  const handleRecordChange = (id: number, field: keyof SoulReachedRecord, value: any) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ))
  }

  const handleImpactToggle = (id: number, impactType: "saved" | "filled" | "healed") => {
    setRecords(records.map(record => {
      if (record.id === id) {
        const newImpactTypes = record.impact_types.includes(impactType)
          ? record.impact_types.filter(type => type !== impactType)
          : [...record.impact_types, impactType];
        return { ...record, impact_types: newImpactTypes };
      }
      return record;
    }));
  }

  const handleSubmit = async () => {
    const trimmedLocation = locationArea.trim();
    
    if (!trimmedLocation) {
      alert("Please enter a location for the evangelism session.");
      return;
    }

    if (records.length === 0) {
      alert("Please add at least one soul reached record.");
      return;
    }

    setIsLoading(true);

    // Count souls by impact type
    const savedCount = records.filter(r => r.impact_types.includes("saved")).length;
    const filledCount = records.filter(r => r.impact_types.includes("filled")).length;
    const healedCount = records.filter(r => r.impact_types.includes("healed")).length;
    
    // Convert team members
    const teamMembers: TeamMember[] = [
      ...participants.map(name => ({ id: `worker-${Date.now()}-${name}`, type: "worker" as const, name })),
      ...Array.from(selectedParticipants).map(name => ({ id: `member-${Date.now()}-${name}`, type: "member" as const, name }))
    ];

    // Convert souls data
    const souls: Soul[] = records.map(record => ({
      name: record.name,
      gender: record.gender,
      age: record.age,
      phone: record.phone,
      address: record.address,
      status: record.impact_types[0] || "saved", // Primary status
      impact_types: record.impact_types,
      note: record.note
    }));

    const reportData: CreateEvangelismReportData = {
      date: new Date().toISOString(),
      session_date: sessionDate as string,
      start_time: startTime,
      location_area: trimmedLocation,
      team_members: teamMembers,
      saved_count: savedCount,
      filled_count: filledCount,
      healed_count: healedCount,
      souls: souls,
      details: details.trim() || "Evangelism outreach session"
    };

    try {
      await submitEvangelismReport(reportData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting evangelism report:", error);
      console.log("Payload that was sent:", JSON.stringify(reportData, null, 2));
      alert("Failed to submit evangelism report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredParticipants = PARTICIPANT_LIST.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-bold text-gray-900">Add Evangelism Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Session Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-600 mb-2">SESSION DATE</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-600 mb-2">START TIME</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-600 mb-2">LOCATION AREA</label>
                <input
                  type="text"
                  placeholder="e.g. Alausa Market"
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-600 mb-2">SESSION DETAILS</label>
              <textarea
                placeholder="Describe the evangelism session, challenges, highlights, etc..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400"
                rows={4}
              />
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-blue-600">PARTICIPANT(S)</label>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search and select members who participated..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
              {participants.map((tag) => (
                <div
                  key={tag}
                  className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Participant Grid */}
            <div className="grid grid-cols-4 gap-3">
              {filteredParticipants.map((participant) => (
                <label key={participant} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.has(participant)}
                    onChange={() => handleAddParticipant(participant)}
                    className="w-4 h-4 border border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{participant}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Impact Details */}
          <div className="space-y-6 border-l-4 border-orange-500 pl-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 tracking-wide">IMPACT DETAILS</h3>
              <button
                onClick={handleAddRecord}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Soul Reached
              </button>
            </div>

            {/* Records */}
            {records.map((record, index) => (
              <div key={record.id} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="text-xs font-semibold text-orange-600">RECORD #{index + 1}</div>

                {/* Record Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">FULL NAME</label>
                      <input
                        type="text"
                        placeholder="Reached person's name..."
                        value={record.name}
                        onChange={(e) => handleRecordChange(record.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">GENDER</label>
                      <select 
                        value={record.gender}
                        onChange={(e) => handleRecordChange(record.id, 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">AGE</label>
                        <input
                          type="number"
                          value={record.age}
                          onChange={(e) => handleRecordChange(record.id, 'age', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-gray-400 hover:text-red-600 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Impact Types */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleImpactToggle(record.id, 'saved')}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold ${
                        record.impact_types.includes('saved')
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      ★ SAVED
                    </button>
                    <button 
                      onClick={() => handleImpactToggle(record.id, 'filled')}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold ${
                        record.impact_types.includes('filled')
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      ○ FILLED
                    </button>
                    <button 
                      onClick={() => handleImpactToggle(record.id, 'healed')}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold ${
                        record.impact_types.includes('healed')
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      ♡ HEALED
                    </button>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">PHONE</label>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={record.phone}
                        onChange={(e) => handleRecordChange(record.id, 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ADDRESS</label>
                      <input
                        type="text"
                        placeholder="Address"
                        value={record.address}
                        onChange={(e) => handleRecordChange(record.id, 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">NOTES / COMMENTS</label>
                    <textarea
                      placeholder="Notes or comments about this person..."
                      value={record.note}
                      onChange={(e) => handleRecordChange(record.id, 'note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
