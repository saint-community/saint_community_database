import { FELLOWSHIPS, CELLS } from '../data/lists';

export const getMemberGroup = (name: string): string => {
    const hash = name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const groups = [...FELLOWSHIPS, ...CELLS];
    return groups[hash % groups.length];
};
