import { tool } from 'ai';
import type { ToolSet } from 'ai';
import { z } from 'zod';
import { executeSafely, type AiToolContext } from './ai-tool-exec-wrapper';

// 项目相关工具
export function createProjectTools(ctx: AiToolContext): ToolSet {
	return {
		list_projects: tool({
			metadata: {
				title: '列出项目',
			},
			description: '列出当前用户可访问的所有项目（管理员可见全部）',
			inputSchema: z.object({}),
			execute: async () =>
				executeSafely(async () => {
					const projects = await ctx.services.projectService.findAllForUser(ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: projects.map(project => ({
							id: project.id,
							name: project.name,
							description: project.description,
						})),
					};
				}),
		}),
	};
}
