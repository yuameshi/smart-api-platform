import type { SendHttpRequestRequest, SentHttpResponse } from 'shared';
import api from '@/services/api';

export async function sendHttpRequest(data: SendHttpRequestRequest): Promise<SentHttpResponse> {
	return (await api.post('/http-request/send', data)) as SentHttpResponse;
}
