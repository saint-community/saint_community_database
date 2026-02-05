import React from 'react';
import { Trash2, Search, X, Clock3 } from 'lucide-react';

const RecordBlock = ({
    rec,
    i,
    onUpdate,
    onRemove,
    searches,
    setSearches,
    exclude = [],
    membersOnly = [],
    readOnly = false
}: any) => (
    <div className="p-6 bg-white rounded border border-slate-200 relative shadow-sm">
        <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-200 rounded shadow-sm">
            <span className="text-[9px] font-black text-[#CCA856] uppercase tracking-[0.2em]">Record #{i + 1}</span>
        </div>
        {!readOnly && (
            <button
                onClick={() => onRemove(rec.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 transition-colors"
            >
                <Trash2 size={18} />
            </button>
        )}
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member(s) taught</label>
                {!readOnly && (
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Select from list or type a name..."
                            className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-xs"
                            value={searches[rec.id] || ''}
                            onChange={e => setSearches({ ...searches, [rec.id]: e.target.value })}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && searches[rec.id]) {
                                    const current = rec.personFollowedUp ? rec.personFollowedUp.split(', ') : [];
                                    if (!current.includes(searches[rec.id])) {
                                        onUpdate(rec.id, { personFollowedUp: [...current, searches[rec.id]].join(', ') });
                                        setSearches({ ...searches, [rec.id]: '' });
                                    }
                                }
                            }}
                        />
                    </div>
                )}
                <div className="flex flex-wrap gap-2 py-1">
                    {(rec.personFollowedUp ? rec.personFollowedUp.split(', ') : []).filter(Boolean).map((m: string) => (
                        <span key={m} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9px] font-black uppercase">
                            {m}
                            {!readOnly && (
                                <button onClick={() => {
                                    const updated = rec.personFollowedUp.split(', ').filter((x: string) => x !== m).join(', ');
                                    onUpdate(rec.id, { personFollowedUp: updated });
                                }} className="hover:text-red-500"><X size={10} /></button>
                            )}
                        </span>
                    ))}
                </div>
                {!readOnly && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar p-2 bg-[#F8F9FA] border border-slate-100 rounded">
                        {Array.from(new Set(membersOnly
                            .filter((m: string) => !exclude.includes(m))
                            .filter((m: string) => m.toLowerCase().includes((searches[rec.id] || '').toLowerCase()))))
                            .map((m: string, idx: number) => (
                                <button
                                    key={`${m}-${idx}`}
                                    onClick={() => {
                                        const current = rec.personFollowedUp ? rec.personFollowedUp.split(', ') : [];
                                        if (!current.includes(m)) onUpdate(rec.id, { personFollowedUp: [...current, m].join(', ') });
                                    }}
                                    className="text-left px-2 py-1 hover:bg-white rounded text-[10px] font-bold text-slate-500 hover:text-[#1A1C1E] transition-all"
                                >
                                    + {m}
                                </button>
                            ))}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic / Subject</label>
                    <input
                        type="text"
                        disabled={readOnly}
                        placeholder="e.g. Foundation School Class 1"
                        value={rec.subjectTaught}
                        onChange={e => onUpdate(rec.id, { subjectTaught: e.target.value })}
                        className="w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Used</label>
                    <input
                        type="text"
                        disabled={readOnly}
                        placeholder="specify the name of the audio or book used"
                        value={rec.materialSource}
                        onChange={e => onUpdate(rec.id, { materialSource: e.target.value })}
                        className="w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Clock3 size={12} /> Duration (min)</label>
                    <input
                        type="number"
                        min="0"
                        disabled={readOnly}
                        placeholder="30"
                        value={rec.duration}
                        onChange={e => onUpdate(rec.id, { duration: e.target.value })}
                        className="w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comments</label>
                    <textarea
                        disabled={readOnly}
                        value={rec.comments}
                        onChange={e => onUpdate(rec.id, { comments: e.target.value })}
                        className="w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-medium text-sm min-h-[80px] disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Specific notes..."
                    ></textarea>
                </div>
            </div>
        </div>
    </div>
);

export default RecordBlock;
