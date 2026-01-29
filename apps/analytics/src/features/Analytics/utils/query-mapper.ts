import {
    FilterGroup,
    QueryOperator,
    FilterOperator,
    FilterCondition
} from '../../../types';

export const mapUiToFilterGroup = (filters: any): FilterGroup => {
    const rootGroup: FilterGroup = {
        operator: QueryOperator.AND,
        conditions: []
    };

    // 1. Structural Filters (Church, Fellowship, Cell)
    if (filters.churches && filters.churches.length > 0) {
        rootGroup.conditions.push({
            field: 'church_id', // Note: Make sure UI sends IDs or we map names to IDs here if needed
            operator: 'in', // Using simple string operators based on our backend enum
            value: filters.churches
        });
    }

    if (filters.fellowships && filters.fellowships.length > 0) {
        rootGroup.conditions.push({
            field: 'fellowship_id', // Verify if UI sends ID or Name. If Name, we might need a lookup or assumption.
            operator: 'in',
            value: filters.fellowships // Assuming UI sends IDs/Names consistent with backend expectation or we used names in DTO
        });
    }

    if (filters.cells && filters.cells.length > 0) {
        rootGroup.conditions.push({
            field: 'cell_id',
            operator: 'in',
            value: filters.cells
        });
    }

    // 2. Search Filters
    if (filters.name) {
        rootGroup.conditions.push({
            field: 'full_name',
            operator: 'contains',
            value: filters.name
        });
    }
    if (filters.email) {
        rootGroup.conditions.push({ field: 'email', operator: 'contains', value: filters.email });
    }
    if (filters.phone) {
        rootGroup.conditions.push({ field: 'phone', operator: 'contains', value: filters.phone });
    }
    if (filters.address) {
        rootGroup.conditions.push({ field: 'address', operator: 'contains', value: filters.address });
    }

    // 3. Activity Filters (Evangelism)
    // If user sets a "Min Evangelism" value
    if (filters.evangelismMin) {
        rootGroup.conditions.push({
            field: 'evangelism_count', // This matches the computed field in aggregation-builder
            operator: 'gt', // or 'gte'
            value: Number(filters.evangelismMin)
        });
    }

    // 4. Date Filters
    if (filters.dateJoinedStart || filters.dateJoinedEnd) {
        const dates = [
            filters.dateJoinedStart || '1900-01-01',
            filters.dateJoinedEnd || new Date().toISOString()
        ];
        rootGroup.conditions.push({
            field: 'date_joined_church',
            operator: 'between',
            value: dates
        });
    }

    return rootGroup;
};
