import React, { useState } from 'react';
import { ChevronDown, Building2, Check, Loader2 } from 'lucide-react';
import { accountAPI } from '../api';

interface Church {
    id: number;
    church_name: string;
    church_id: number;
    pastor_id: number;
}

interface User {
    id: number;
    name: string;
    role: string;
    church_id: number;
    church_name?: string;
    churches?: Church[];
}

interface ChurchSwitcherProps {
    user: User;
    onSwitch: (churchId: number) => void;
}

const ChurchSwitcher: React.FC<ChurchSwitcherProps> = ({ user, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Parse churches array safely
    const churches = user.churches || [];

    // Find current church name, fallback to user.church_name or ID
    const currentChurch = churches.find(c => c.church_id === user.church_id) || {
        church_name: user.church_name || `Church #${user.church_id}`,
        church_id: user.church_id
    };

    if (churches.length === 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded text-slate-500 text-sm font-medium">
                <Building2 size={14} />
                <span>{currentChurch.church_name}</span>
            </div>
        );
    }

    const handleSwitch = async (churchId: number) => {
        if (churchId === user.church_id) {
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            await accountAPI.switchChurch(churchId);
            // Short delay to allow backend potential consistency or just UI feel
            setTimeout(() => {
                onSwitch(churchId);
                setIsOpen(false);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Failed to switch church:', error);
            setIsLoading(false);
            alert('Failed to switch church. Please try again.');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm 
        hover:bg-slate-50 transition-colors text-slate-700 text-sm font-semibold min-w-[200px] justify-between
        ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Building2 size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate">{isLoading ? 'Switching...' : currentChurch.church_name}</span>
                </div>
                {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />
                ) : (
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && !isLoading && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 max-h-[300px] overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                            Switch Church
                        </div>
                        {churches.map((church) => (
                            <button
                                key={church.id}
                                onClick={() => handleSwitch(church.church_id)}
                                className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors
                  ${church.church_id === user.church_id ? 'text-[#CCA856] font-bold bg-[#CCA856]/5' : 'text-slate-700 font-medium'}`}
                            >
                                <span className="truncate mr-2">{church.church_name}</span>
                                {church.church_id === user.church_id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ChurchSwitcher;
