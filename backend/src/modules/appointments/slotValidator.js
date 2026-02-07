/**
 * Checks if two time ranges overlap
 * A overlaps B if:
 * startA < endB and endA > startB
 */

export const hasTimeConflict = (
    startA,
    endA,
    startB,
    endB
) => {
    return (
        new Date(startA) < new Date(endB) &&
        new Date(endA) > new Date(startB)
    );
};