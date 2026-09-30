import type { AuthConfig, KeyValueEntry, RequestBody, SentHttpError } from 'shared';

export function buildUrl(path: string, baseUrl: string | null, params: KeyValueEntry[]): { url: string } | { error: SentHttpError } {
	let base: string;
	if (/^https?:\/\//i.test(path)) {
		base = path;
	} else {
		if (!baseUrl)
			return {
				error: {
					kind: 'invalid-url',
					message: '项目未配置Base URL，且请求地址不是完整URL',
				},
			};
		// 去掉末尾的斜杠后拼接
		base = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
	}
	let url: URL;
	try {
		url = new URL(base);
	} catch {
		return {
			error: {
				kind: 'invalid-url',
				message: `请求地址无效：${base}`,
			},
		};
	}
	const searchParams = new URLSearchParams();
	params.forEach(entry => {
		if (entry.active && entry.key.trim() !== '') {
			searchParams.append(entry.key, entry.value);
		}
	});
	const queryString = searchParams.toString();
	return {
		url: queryString ? `${url.toString()}${url.search ? '&' : '?'}${queryString}` : url.toString(),
	};
}

export function buildHeaders(headers: KeyValueEntry[], body: RequestBody, auth: AuthConfig): Record<string, string> {
	const record: Record<string, string> = {};
	for (const entry of headers) {
		const key = entry.key.trim();
		if (entry.active && key !== '') record[key] = entry.value;
	}
	// 用户头不含content-type才注入
	if (!Object.keys(record).some(existingKey => existingKey.toLowerCase() === 'content-type')) {
		if (body.kind === 'raw') record['Content-Type'] = 'application/json';
		if (body.kind === 'formUrlEncoded') {
			record['Content-Type'] = 'application/x-www-form-urlencoded';
		}
	}

	// 用户头不含authorization才注入
	if (!Object.keys(record).some(existingKey => existingKey.toLowerCase() === 'authorization')) {
		if (auth.kind === 'bearer') record['Authorization'] = `Bearer ${auth.token}`;
		if (auth.kind === 'basic') {
			record['Authorization'] = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
		}
	}

	return record;
}

export function buildBody(body: RequestBody): string | undefined {
	if (body.kind === 'none') return undefined;
	if (body.kind === 'raw') return body.raw;
	if (body.kind === 'formUrlEncoded')
		return new URLSearchParams(
			body.entries.filter(entry => entry.active && entry.key.trim() !== '').map(entry => [entry.key, entry.value]),
		).toString();
	return undefined;
}

// 流式读取响应体，但是最多储存1MB
async function bodyReader(res: Response) {
	if (!res.body)
		return {
			buffer: Buffer.alloc(0),
			totalBytes: 0,
		};
	const reader = res.body.getReader();
	const chunks: Buffer[] = [];
	let storedBytes = 0;
	let totalBytes = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		totalBytes += value.byteLength;
		// 只保留前1MB的响应体，超出部分丢弃
		// 剩余可存储的字节数
		const remaining = 1024 * 1024 - storedBytes;
		if (remaining > 0) {
			const kept = value.subarray(0, remaining);
			chunks.push(Buffer.from(kept.buffer, kept.byteOffset, kept.byteLength));
			storedBytes += kept.byteLength;
		}
	}

	return {
		buffer: Buffer.concat(chunks),
		totalBytes,
	};
}

export async function processResponse(res: Response, startTs: number) {
	const headers: { key: string; value: string }[] = [];

	// 跳过Set-Cookie字段，用getSetCookie单独获取
	res.headers.forEach((headerValue, headerKey) => {
		if (headerKey.toLowerCase() !== 'set-cookie') {
			headers.push({ key: headerKey, value: headerValue });
		}
	});
	for (const cookie of res.headers.getSetCookie())
		headers.push({
			key: 'Set-Cookie',
			value: cookie,
		});

	const contentType = res.headers.get('content-type');

	// 判断是不是文本类型
	const isText =
		(contentType !== null && /^text\//i.test(contentType)) ||
		(contentType !== null && /json|xml|javascript|x-www-form-urlencoded|html/i.test(contentType));

	// 流式读取响应
	const { buffer, totalBytes } = await bodyReader(res);

	// 读完整个流再计时，统计的是含body下载的完整耗时（超出1MB的部分已流式丢弃，不占内存）
	const durationMs = Math.round(performance.now() - startTs);

	if (isText) {
		return {
			status: res.status,
			statusText: res.statusText,
			headers,
			body: buffer.toString('utf8'),
			encoding: 'utf8' as const,
			contentType,
			durationMs,
			sizeBytes: totalBytes,
		};
	} else {
		return {
			status: res.status,
			statusText: res.statusText,
			headers,
			body: buffer.toString('base64'),
			encoding: 'base64' as const,
			contentType,
			durationMs,
			sizeBytes: totalBytes,
		};
	}
}

// 解析网络错误
export function processNetworkError(error: Error): SentHttpError {
	// 超时错误
	if (error.name === 'TimeoutError' || error.name === 'AbortError')
		return {
			kind: 'timeout',
			message: '请求超时',
		};

	// 遍历cause链提取网络错误代码
	let code = '';
	for (let cause: unknown = error.cause; cause != null; cause = (cause as { cause?: unknown }).cause) {
		const causeCode = (cause as { code?: string }).code;
		if (typeof causeCode === 'string' && causeCode !== '') {
			code = causeCode;
			break;
		}
	}
	const base = error?.message ?? `${error.name && error.name + '：'}未知网络错误`;
	return {
		kind: 'unknown',
		message: `${error.name && error.name + '：'}${base}${code && `（${code}）`}`,
	};
}
