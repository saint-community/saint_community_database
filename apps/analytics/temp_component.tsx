/** 
 * CUSTOM CALENDAR PICKER
 */
const DatePickerCalendar = ({ date, onSelect, label }: { date: Date | null, onSelect: (d: Date) => void, label: string }) => {
    const [viewDate, setViewDate] = useState(new Date());

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const days = Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth(currentMonth, currentYear) }, (_, i) => i);

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-full max-w-[280px]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{label}</p>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded text-slate-400"><ChevronLeft size={16} /></button>
                <span className="text-xs font-black text-[#1A1C1E] uppercase">{monthNames[currentMonth]} {currentYear}</span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded text-slate-400"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[9px] font-black text-slate-300">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`b-${b}`} className="h-8"></div>)}
                {days.map(d => {
                    const isSelected = date && date.getDate() === d && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                    return (
                        <button
                            key={d}
                            onClick={() => onSelect(new Date(currentYear, currentMonth, d))}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${isSelected ? 'bg-[#1A1C1E] text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
