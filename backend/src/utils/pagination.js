export function getPagination(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 10, 100);
    const offset = (page-1) * limit;

    return { page, limit, offset };
}

export function buildPaginationMeta({ page, limit, total }) {
    return {
        page, 
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
    };
}