import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import type { SentHttpResponse, TestStep, AssertStepConfig, RequestStepConfig, KeyValueEntry, StepRunStatus } from 'shared';
export type { StepRunStatus };

type DraftStepBase = {
	initialized: boolean; // 检测是否初始化过
	runStatus: StepRunStatus;
	// 步骤本体数据
	id: number;
	testFlowId: number;
	order: number;
	name: string;
	// 记录响应数据
	sending: boolean;
	response: SentHttpResponse | null;
};

export type DraftStep =
	| (DraftStepBase & {
			type: 'assert';
			config: AssertStepConfig;
	  })
	| (DraftStepBase & {
			type: 'request';
			// 这里因为结构比较复杂就不做类似pathParamEntries的转格式了
			// 直接用原始结构，避免重复转换
			config: RequestStepConfig;
	  });

export const draftStepFamily = atomFamily((stepId: number) =>
	atom<DraftStep>({
		initialized: false,
		runStatus: 'idle',
		id: stepId,
		testFlowId: 0,
		order: 0,
		type: 'request',
		name: '',
		config: {
			method: 'GET',
			path: '',
			pathParams: [],
			params: [],
			headers: [],
			body: { kind: 'none' },
			auth: { kind: 'none' },
			extractions: [],
		},
		sending: false,
		response: null,
	}),
);

export const freeDraftStep = draftStepFamily.remove;
export const clearDraftStep = () => {
	for (const step of draftStepFamily.getParams()) {
		draftStepFamily.remove(step);
	}
};

// 草稿转回TestStep
export function stepFromDraft(draft: DraftStep, base: TestStep): TestStep {
	return {
		...base,
		name: draft.name,
		type: draft.type,
		config: draft.config,
	} as TestStep;
}

// Step json数据转draft
export function draftFromStep(step: TestStep): DraftStep {
	switch (step.type) {
		case 'assert':
			return {
				initialized: true,
				runStatus: 'idle',
				id: step.id,
				testFlowId: step.testFlowId,
				order: step.order,
				type: 'assert',
				name: step.name,
				config: step.config,
				sending: false,
				response: null,
			};
		case 'request':
			return {
				initialized: true,
				runStatus: 'idle',
				id: step.id,
				testFlowId: step.testFlowId,
				order: step.order,
				type: 'request',
				name: step.name,
				config: step.config,
				sending: false,
				response: null,
			};
	}
}

export const stringifyDraftStep = (draft: DraftStep) =>
	JSON.stringify(
		(
			[
				// 只导出会保存的key（order由reorder接口处理）
				'id',
				'testFlowId',
				'type',
				'name',
				'config',
			] as const
		).map(key => draft[key]),
	);

const isEmptyKVEntry = (entry: KeyValueEntry) => entry.key === '' && entry.value === '' && (entry.description ?? '') === '';
// 清除键值对列表空行
export const cleanDraftStep = (draft: DraftStep): DraftStep => {
	if (draft.type === 'request') {
		const config = draft.config;
		return {
			...draft,
			config: {
				...config,
				pathParams: config.pathParams.filter(entry => !isEmptyKVEntry(entry)),
				params: config.params.filter(entry => !isEmptyKVEntry(entry)),
				headers: config.headers.filter(entry => !isEmptyKVEntry(entry)),
				body:
					config.body.kind === 'formUrlEncoded'
						? { ...config.body, entries: config.body.entries.filter(entry => !isEmptyKVEntry(entry)) }
						: config.body,
				extractions: config.extractions
					.map(rule => {
						const defaultValue = rule.defaultValue?.trim() === '' ? undefined : rule.defaultValue;
						return defaultValue === undefined
							? {
									variableName: rule.variableName,
									jsonPath: rule.jsonPath,
									enabled: rule.enabled,
								}
							: {
									variableName: rule.variableName,
									jsonPath: rule.jsonPath,
									enabled: rule.enabled,
									defaultValue,
								};
					})
					.filter(rule => rule.variableName.trim() !== '' || rule.jsonPath.trim() !== '' || rule.defaultValue !== undefined),
			},
		};
	} else return draft;
};
