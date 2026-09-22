// 本Manager只管理本地状态，API请求在对应组件中自行完成

import { createContext, type Dispatch, type FC, type SetStateAction, useCallback, useEffect, useState } from 'react';
import type { TestStep } from 'shared';
import { listTestSteps } from '@/services/testSteps';
import { clearDraftStep } from './draft-steps';

// eslint-disable-next-line react-refresh/only-export-components
export const StepManagerContext = createContext<{
	testFlowId: number;
	currentStep: TestStep | null;
	setCurrentStep: Dispatch<SetStateAction<TestStep | null>>;
	steps: TestStep[];
	setSteps: Dispatch<SetStateAction<TestStep[]>>;
	setStep(stepId: number, step: Partial<TestStep>): void;
}>({
	testFlowId: -1,
	currentStep: null,
	setCurrentStep: () => {},
	steps: [],
	setSteps: () => {},
	setStep: () => {},
});

type Children = React.ReactNode | ((value: { loading: boolean; loadError: string | null }) => React.ReactNode);

type Props = {
	testFlowId: number;
	children?: Children;
};

export const StepManagerProvider: FC<Props> = ({ children, testFlowId }) => {
	const [currentStep, setCurrentStep] = useState<TestStep | null>(null);
	const [steps, setSteps] = useState<TestStep[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const loadSteps = useCallback(
		// 使用isActive回调来判断组件是否仍然挂载，避免在卸载后更新状态
		async (isActive: () => boolean = () => true) => {
			setLoading(true);
			setLoadError(null);
			try {
				const fetched = await listTestSteps(testFlowId);
				if (!isActive()) return;
				clearDraftStep();
				setSteps(fetched);
				setCurrentStep(fetched[0] ?? null);
			} catch (err) {
				if (!isActive()) return;
				setLoadError(err instanceof Error ? err.message : '加载测试步骤失败');
			} finally {
				if (isActive()) setLoading(false);
			}
		},
		[testFlowId],
	);

	useEffect(() => {
		let active = true;
		const run = async () => {
			await loadSteps(() => active);
		};
		void run();
		return () => {
			active = false;
		};
	}, [loadSteps]);

	return (
		<StepManagerContext.Provider
			value={{
				testFlowId,
				currentStep,
				setCurrentStep,
				steps,
				setSteps,
				setStep(id: number, newStep: Partial<TestStep>) {
					setSteps(prev =>
						prev.map(step => {
							if (step.id === id) {
								if (newStep.type === 'request' && step.type === 'request') {
									return {
										...step,
										...newStep,
									};
								} else if (newStep.type === 'assert' && step.type === 'assert') {
									return {
										...step,
										...newStep,
									};
								} else {
									console.warn(
										`Step(ID: ${step.id}) type mismatch, ignoring: Old: ${step.type} / New: ${newStep.type}`,
									);
									return step;
								}
							} else return step;
						}),
					);
				},
			}}
		>
			{typeof children === 'function' ? children({ loading, loadError }) : children}
		</StepManagerContext.Provider>
	);
};
