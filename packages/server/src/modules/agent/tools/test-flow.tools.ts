import { tool } from 'ai';
import type { ToolSet } from 'ai';
import { z } from 'zod';
import { executeSafely, type AiToolContext } from './ai-tool-exec-wrapper';

// 测试流程相关工具
export function createTestFlowTools(ctx: AiToolContext): ToolSet {
	// 确保流程属于当前会话
	async function findFlowInProject(id: number) {
		const flow = await ctx.services.testFlowService.findOneOwned(id, ctx.userId, ctx.isAdmin);
		if (flow.projectId !== ctx.projectId) {
			return null;
		}
		return flow;
	}

	return {
		list_test_flows: tool({
			metadata: {
				title: '列出测试流程',
			},
			description: '列出当前项目下的测试流程',
			inputSchema: z.object({}),
			execute: async () =>
				executeSafely(async () => {
					const flows = await ctx.services.testFlowService.findAllByProject(ctx.projectId, ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: flows.map(flow => ({
							id: flow.id,
							name: flow.name,
							description: flow.description,
						})),
					};
				}),
		}),

		get_test_flow: tool({
			metadata: {
				title: '查看测试流程详情',
			},
			description: '查看测试流程详情，包含全部步骤',
			inputSchema: z.object({
				id: z.number().int().describe('测试流程ID'),
			}),
			execute: async input =>
				executeSafely(async () => {
					const flow = await findFlowInProject(input.id);
					if (!flow) {
						return {
							ok: false as const,
							error: '找不到流程或流程不属于当前项目',
						};
					}
					const steps = await ctx.services.testFlowService.listSteps(flow.id, ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: {
							id: flow.id,
							name: flow.name,
							description: flow.description,
							steps: steps,
						},
					};
				}),
		}),

		create_test_flow: tool({
			metadata: {
				title: '创建测试流程',
			},
			description: '在当前项目下创建测试流程',
			inputSchema: z.object({
				name: z.string().min(1).max(100).describe('流程名称'),
				description: z.string().optional().describe('流程描述'),
			}),
			execute: async input =>
				executeSafely(async () => {
					const flow = await ctx.services.testFlowService.create(
						{
							projectId: ctx.projectId,
							name: input.name,
							description: input.description,
						},
						ctx.userId,
						ctx.isAdmin,
					);
					return {
						ok: true as const,
						data: {
							id: flow.id,
							name: flow.name,
							description: flow.description,
						},
					};
				}),
		}),
		rename_test_flow: tool({
			metadata: {
				title: '重命名测试流程',
			},
			description: '重命名测试流程',
			inputSchema: z.object({
				id: z.number().int().describe('测试流程ID'),
				newName: z.string().min(1).max(100).describe('新名称'),
			}),
			execute: async input =>
				executeSafely(async () => {
					const flow = await findFlowInProject(input.id);
					if (!flow) {
						return {
							ok: false as const,
							error: '找不到流程或流程不属于当前项目',
						};
					}
					await ctx.services.testFlowService.update(
						//
						flow.id,
						{ name: input.newName },
						ctx.userId,
						ctx.isAdmin,
					);
					return {
						ok: true as const,
						data: {
							id: flow.id,
							name: input.newName,
						},
					};
				}),
		}),

		delete_test_flow: tool({
			metadata: {
				title: '删除测试流程',
			},
			description: '删除测试流程',
			inputSchema: z.object({
				id: z.number().int().describe('测试流程ID'),
			}),
			needsApproval: true,
			execute: async input =>
				executeSafely(async () => {
					const flow = await findFlowInProject(input.id);
					if (!flow) {
						return {
							ok: false as const,
							error: '找不到流程或流程不属于当前项目',
						};
					}
					await ctx.services.testFlowService.remove(flow.id, ctx.userId, ctx.isAdmin);
					return {
						ok: true as const,
						data: {
							id: flow.id,
							deleted: true,
						},
					};
				}),
		}),
	};
}

