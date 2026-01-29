
import React, { useState, useMemo } from 'react';
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    Filter
} from 'lucide-react';
import { FilterGroup, FilterCondition, QueryOperator, FilterOperator } from '../../../types';

interface QueryBuilderProps {
    rootGroup: FilterGroup;
    onChange: (group: FilterGroup) => void;
    metadata?: {
        churches?: string[];
        fellowships?: string[];
        cells?: string[];
    };
}

const OPERATORS = [
    { label: 'Equals', value: FilterOperator.EQUALS },
    { label: 'Not Equals', value: FilterOperator.NOT_EQUALS },
    { label: 'Contains', value: FilterOperator.CONTAINS },
    { label: 'Greater Than', value: FilterOperator.GREATER_THAN },
    { label: 'Less Than', value: FilterOperator.LESS_THAN },
    { label: 'In List', value: FilterOperator.IN },
    { label: 'Between', value: FilterOperator.BETWEEN },
];

const QueryBuilder: React.FC<QueryBuilderProps> = ({ rootGroup, onChange, metadata }) => {

    const fieldOptions = useMemo(() => [
        {
            label: 'Church',
            value: 'church_id',
            type: 'select',
            options: (metadata?.churches || ['Main Parish']).map(c => ({ label: c, value: c })) // Ideally value is ID, but sticking to names for now as per mapper
        },
        {
            label: 'Fellowship',
            value: 'fellowship_id',
            type: 'select',
            options: (metadata?.fellowships || []).map(f => ({ label: f, value: f }))
        },
        {
            label: 'Cell',
            value: 'cell_id',
            type: 'select',
            options: (metadata?.cells || []).map(c => ({ label: c, value: c }))
        },
        { label: 'Full Name', value: 'full_name', type: 'text' },
        { label: 'Email', value: 'email', type: 'text' },
        { label: 'Phone', value: 'phone', type: 'text' },
        { label: 'Address', value: 'address', type: 'text' },
        { label: 'Date Joined', value: 'date_joined_church', type: 'date' },
        { label: 'Evangelism Count', value: 'evangelism_count', type: 'number' },
        { label: 'Follow Up Count', value: 'followup_count', type: 'number' },
        { label: 'Study Group Count', value: 'study_group_count', type: 'number' },
        { label: 'Prayer Group Count', value: 'prayer_group_count', type: 'number' },
        { label: 'Attendance Count', value: 'attendance_count', type: 'number' },
    ], [metadata]);

    const updateGroup = (newGroup: FilterGroup) => {
        onChange(newGroup);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Filter size={16} /> Advanced Query Builder
            </h3>
            <GroupRenderer group={rootGroup} onChange={updateGroup} depth={0} onDelete={() => { }} isRoot={true} fieldOptions={fieldOptions} />
        </div>
    );
};

interface GroupRendererProps {
    group: FilterGroup;
    onChange: (g: FilterGroup) => void;
    onDelete: () => void;
    depth: number;
    isRoot?: boolean;
    fieldOptions: any[];
}

const GroupRenderer: React.FC<GroupRendererProps> = ({ group, onChange, onDelete, depth, isRoot, fieldOptions }) => {
    const toggleOperator = () => {
        onChange({
            ...group,
            operator: group.operator === QueryOperator.AND ? QueryOperator.OR : QueryOperator.AND
        });
    };

    const addCondition = () => {
        const newCondition: FilterCondition = {
            field: 'full_name',
            operator: FilterOperator.CONTAINS,
            value: ''
        };
        onChange({
            ...group,
            conditions: [...group.conditions, newCondition]
        });
    };

    const addGroup = () => {
        const newGroup: FilterGroup = {
            operator: QueryOperator.AND,
            conditions: [
                { field: 'full_name', operator: FilterOperator.CONTAINS, value: '' }
            ]
        };
        onChange({
            ...group,
            conditions: [...group.conditions, newGroup]
        });
    };

    const updateChild = (index: number, newChild: FilterGroup | FilterCondition) => {
        const newConditions = [...group.conditions];
        newConditions[index] = newChild;
        onChange({ ...group, conditions: newConditions });
    };

    const deleteChild = (index: number) => {
        const newConditions = group.conditions.filter((_, i) => i !== index);
        onChange({ ...group, conditions: newConditions });
    };

    return (
        <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 border-l-2 border-slate-100 pl-4 py-2' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <button
                    onClick={toggleOperator}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${group.operator === QueryOperator.AND
                        ? 'bg-[#1A1C1E] text-white hover:bg-slate-700'
                        : 'bg-[#CCA856] text-white hover:bg-[#B89648]'
                        }`}
                >
                    {group.operator}
                </button>

                <div className="flex gap-1 ml-auto">
                    <button onClick={addCondition} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Add Rule">
                        <Plus size={14} />
                    </button>
                    <button onClick={addGroup} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Add Group">
                        <Filter size={14} />
                    </button>
                    {!isRoot && (
                        <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Group">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {group.conditions.map((child, index) => {
                    if ('conditions' in child) {
                        return (
                            <GroupRenderer
                                key={index}
                                group={child as FilterGroup}
                                onChange={(g) => updateChild(index, g)}
                                onDelete={() => deleteChild(index)}
                                depth={depth + 1}
                                fieldOptions={fieldOptions}
                            />
                        );
                    } else {
                        return (
                            <RuleRenderer
                                key={index}
                                condition={child as FilterCondition}
                                onChange={(c) => updateChild(index, c)}
                                onDelete={() => deleteChild(index)}
                                fieldOptions={fieldOptions}
                            />
                        );
                    }
                })}
                {group.conditions.length === 0 && (
                    <div className="text-xs text-slate-300 italic p-2 border border-dashed border-slate-200 rounded">
                        No rules. Add a rule or group.
                    </div>
                )}
            </div>
        </div>
    );
};

interface RuleRendererProps {
    condition: FilterCondition;
    onChange: (c: FilterCondition) => void;
    onDelete: () => void;
    fieldOptions: any[];
}

const RuleRenderer: React.FC<RuleRendererProps> = ({ condition, onChange, onDelete, fieldOptions }) => {
    const fieldConfig = fieldOptions.find(f => f.value === condition.field) || fieldOptions[0];

    return (
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 group hover:border-slate-200 transition-colors">
            <select
                value={condition.field}
                onChange={(e) => onChange({ ...condition, field: e.target.value, value: '' })}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#CCA856] w-32"
            >
                {fieldOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <select
                value={condition.operator}
                onChange={(e) => onChange({ ...condition, operator: e.target.value as FilterOperator })}
                className="text-xs text-slate-600 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#CCA856] w-28"
            >
                {OPERATORS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <div className="flex-1">
                {fieldConfig.type === 'select' ? (
                    <select
                        value={condition.value}
                        onChange={(e) => onChange({ ...condition, value: e.target.value })}
                        className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#CCA856]"
                    >
                        <option value="">Select...</option>
                        {fieldConfig.options?.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : fieldConfig.type === 'number' ? (
                    <input
                        type="number"
                        value={condition.value}
                        onChange={(e) => onChange({ ...condition, value: parseFloat(e.target.value) })}
                        className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#CCA856]"
                        placeholder="Value..."
                    />
                ) : fieldConfig.type === 'date' ? (
                    <input
                        type="date"
                        value={condition.value}
                        onChange={(e) => onChange({ ...condition, value: e.target.value })}
                        className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#CCA856]"
                    />
                ) : (
                    <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => onChange({ ...condition, value: e.target.value })}
                        className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#CCA856]"
                        placeholder="Value..."
                    />
                )}
            </div>

            <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={13} />
            </button>
        </div>
    );
};

export default QueryBuilder;
