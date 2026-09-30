import { Injectable } from '@nestjs/common';
import type { SentHttpResponse } from 'shared';
import { ProjectService } from '@/modules/project/project.service';
import { SendHttpRequestDto } from './dto/send-http-request.dto';
import { buildHeaders, buildBody, buildUrl, processNetworkError, processResponse } from './http-request.utils';

@Injectable()
export class HttpRequestsService {
	constructor(private readonly projectService: ProjectService) {}

	async send(dto: SendHttpRequestDto, userId: number, isAdmin: boolean, options?: { signal?: AbortSignal }): Promise<SentHttpResponse> {
		const project = await this.projectService.findOneOwned(dto.projectId, userId, isAdmin);

		// 拼接url
		const built = buildUrl(dto.path, project.baseUrl, dto.params);
		if ('error' in built)
			return {
				ok: false,
				error: built.error,
			};

		const start = performance.now();
		try {
			const res = await fetch(built.url, {
				method: dto.method,
				headers: buildHeaders(dto.headers, dto.body, dto.auth),
				body: buildBody(dto.body),
				redirect: 'follow',
				// 30s超时 + signal终止
				signal: options?.signal ? AbortSignal.any([AbortSignal.timeout(30_000), options.signal]) : AbortSignal.timeout(30_000),
			});
			return {
				ok: true,
				...(await processResponse(res, start)),
			};
		} catch (err) {
			return {
				ok: false,
				error: processNetworkError(err),
			};
		}
	}
}
