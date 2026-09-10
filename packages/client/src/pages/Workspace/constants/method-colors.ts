import type { HttpMethod } from 'shared';

export const METHOD_INFO: Record<HttpMethod, { label: string; color: string }> = {
	GET: { label: 'GET', color: '#0a0' },
	POST: { label: 'POST', color: '#cc0' },
	PUT: { label: 'PUT', color: '#6cf' },
	PATCH: { label: 'PAT', color: '#a855f7' },
	DELETE: { label: 'DEL', color: '#f00' },
	HEAD: { label: 'HEAD', color: '#000' },
	OPTIONS: { label: 'OPT', color: '#000' },
};
