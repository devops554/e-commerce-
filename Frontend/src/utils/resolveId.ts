export function resolveId(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val._id) return String(val._id);
    return String(val);
}
