import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]',
    };
    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A1C1E]/60 backdrop-blur-sm animate-in fade-in duration-200'>
            <div
                className={`bg-white rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200`}
            >
                <div className='px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10'>
                    <div>
                        <h3 className='text-lg font-black text-[#1A1C1E] tracking-tight uppercase tracking-[0.1em]'>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded text-slate-400 transition-colors'
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className='flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#FAFAFA]'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
