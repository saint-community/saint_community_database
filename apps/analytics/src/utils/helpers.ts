import { FELLOWSHIPS, CELLS } from '../data/lists';

export const getMemberGroup = (name: string): string => {
    const hash = name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const groups = [...FELLOWSHIPS, ...CELLS];
    return groups[hash % groups.length];
};

/** Match admin directory member by Mongo id / numeric id / legacy name string */
export function findMemberById(members: any[], memberId: string): any | undefined {
    const id = String(memberId);
    return members.find(
        (m) =>
            String(m?.id ?? m?._id ?? '') === id ||
            String(m?.member_id ?? '') === id ||
            m?.name === memberId
    );
}

/** Bulk attendance stores worker ids and member ids in one list; resolve workers by numeric worker_id */
export function findWorkerByWorkerId(
    workers: any[],
    workerIdStr: string
): any | undefined {
    const sid = String(workerIdStr);
    return workers.find((w) => String(w.worker_id ?? w.id ?? '') === sid);
}

export function formatMemberDisplayName(
    member: any | undefined,
    idFallback: string
): string {
    if (!member) return idFallback;
    const fn = member.firstname || member.first_name;
    const ln = member.lastname || member.last_name;
    if (fn || ln) return `${fn || ''} ${ln || ''}`.trim();
    return (
        member.name ||
        member.full_name ||
        member.email ||
        member.phone ||
        idFallback
    );
}

export function resolveMemberFellowshipLabel(
    member: any | undefined,
    fellowships: any[],
    idFallback: string
): string {
    if (!member) return getMemberGroup(idFallback);
    const direct =
        member.fellowship_name ||
        member.fellowship?.name ||
        member.group_name;
    if (direct) return direct;
    const fid = member.fellowship_id;
    if (fid != null && Array.isArray(fellowships) && fellowships.length > 0) {
        const f = fellowships.find(
            (x) => String(x.id ?? x._id ?? x.fellowship_id) === String(fid)
        );
        if (f?.name) return f.name;
    }
    return getMemberGroup(String(member.id ?? member._id ?? idFallback));
}
