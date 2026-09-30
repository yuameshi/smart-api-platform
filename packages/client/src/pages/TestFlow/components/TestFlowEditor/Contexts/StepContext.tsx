import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';
import type { TestStep } from 'shared';
import { listTestSteps } from '@/services/testSteps';
import { clearDraftStep } from '../draft-steps';
import { UiContext } from './UiContext';
import { PageContext } from '../../PageContext';

// eslint-disable-next-line react-refresh/only-export-components
export const StepContext = createContext<{
	testFlowId: number;
	steps: TestStep[];
	setSteps: Dispatch<SetStateAction<TestStep[]>>;
	setStep(stepId: number, step: Partial<TestStep>): void;
	currentStep: TestStep | null;
	setCurrentStep: Dispatch<SetStateAction<TestStep | null>>;
}>({
	testFlowId: -1,
	steps: [],
	setSteps: () => {},
	setStep: () => {},
	currentStep: null,
	setCurrentStep: () => {},
});

type Props = {
	testFlowId: number;
};

export const StepProvider: FC<PropsWithChildren<Props>> = ({ testFlowId, children }) => {
	const { setLoading, setLoadError } = useContext(UiContext);
	const { setSnackbar } = useContext(PageContext);
	const [steps, setSteps] = useState<TestStep[]>([]);
	const [currentStep, setCurrentStep] = useState<TestStep | null>(null);

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
		[testFlowId, setLoading, setLoadError],
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

	const setStep = useCallback(
		(id: number, newStep: Partial<TestStep>) => {
			setSteps(prev =>
				prev.map(step => {
					if (step.id !== id) return step;
					if (newStep.type === 'request' && step.type === 'request')
						return {
							...step,
							...newStep,
						};
					if (newStep.type === 'assert' && step.type === 'assert')
						return {
							...step,
							...newStep,
						};
					setSnackbar(`步骤(ID: ${step.id}) 类型不匹配，更新失败`);
					console.warn(`Step(ID: ${step.id}) type mismatch, ignoring: Old: ${step.type} / New: ${newStep.type}`);
					return step;
				}),
			);
		},
		[setSnackbar],
	);

	const contextValue = useMemo(
		() => ({
			testFlowId,
			steps,
			setSteps,
			setStep,
			currentStep,
			setCurrentStep,
		}),
		[testFlowId, steps, setStep, currentStep],
	);

	return <StepContext.Provider value={contextValue}>{children}</StepContext.Provider>;
};
