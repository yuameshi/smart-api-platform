import type { SendHttpRequestRequest, SentHttpResponse } from 'shared';

// todo
export async function sendHttpRequest(data: SendHttpRequestRequest): Promise<SentHttpResponse> {
	console.log('[sendHttpRequest]', data);
	return {
		ok: true,
		status: 200,
		statusText: 'OK',
		headers: [
			{
				key: 'header',
				value: 'value',
			},
			{
				key: 'header',
				value: 'value',
			},
			{
				key: 'header',
				value: 'value',
			},
		],
		body: '{}',
		encoding: 'utf8',
		contentType: 'application/json',
		durationMs: 325,
		sizeBytes: 325325,
	};
	return { ok: false, error: { kind: 'unknown', message: '' } };
}
