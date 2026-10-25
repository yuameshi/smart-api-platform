import { tool } from 'ai';
import type { ToolSet } from 'ai';
import { z } from 'zod';
import { executeSafely, type AiToolContext } from './ai-tool-exec-wrapper';

// 接口相关工具
export function createEndpointTools(ctx: AiToolContext): ToolSet {
	return {
		list_endpoints: tool({
			metadata: {
				title: '列出接口',
			},
			description: '列出当前项目下的接口列表（可按文件夹筛选）',
			inputSchema: z.object({
				folderId: z.number().int().optional().describe('文件夹ID，不传则列出整个项目的接口'),
			}),
			execute: async (input: { folderId: number | undefined }) =>
				executeSafely(async () => {
					const endpoints = await ctx.services.endpointService.listByProject(
						ctx.projectId,
						input.folderId,
						ctx.userId,
						ctx.isAdmin,
					);
					return {
						ok: true as const,
						data: endpoints.map(endpoint => ({
							id: endpoint.id,
							method: endpoint.method,
							path: endpoint.path,
							summary: endpoint.summary,
							folderId: endpoint.folderId,
						})),
					};
				}),
		}),

		get_endpoint: tool({
			metadata: {
				title: '查看接口',
			},
			description: '查看接口详情',
			inputSchema: z.object({
				id: z.number().int().describe('接口ID'),
			}),
			execute: async (input: { id: number }) =>
				executeSafely(async () => {
					const endpoint = await ctx.services.endpointService.findOneOwned(input.id, ctx.userId, ctx.isAdmin);
					// 限制在当前会话项目内
					if (endpoint.projectId !== ctx.projectId) {
						return {
							ok: false as const,
							error: '该接口不属于当前项目',
						};
					}
					return {
						ok: true as const,
						data: endpoint,
					};
				}),
		}),
	};
}
