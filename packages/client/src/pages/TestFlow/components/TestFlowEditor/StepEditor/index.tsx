import { Box, Button, TextField, Typography } from '@mui/material';
import { draftFromStep, draftStepFamily, cleanDraftStep, stringifyDraftStep } from '../draft-steps';
import { AssertStepForm } from './AssertStepForm';
import { RequestStepForm } from './RequestStepForm';
import { ApiEndpoint } from 'shared';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ImportApiDialog } from './ImportApiDialog';
import { PageContext } from '../../PageContext';
import { StepManagerContext } from '../StepManagerContext';
import { useAtom } from 'jotai';
import { updateTestStep } from '@/services/testSteps';

export const StepEditor = () => {
	// placeholder
	const [openImportDialog, setOpenImportDialog] = useState(false);
	const { projectId } = useContext(PageContext);
	const { testFlowId, currentStep, setCurrentStep, setStep } = useContext(StepManagerContext);
	const draftStepAtom = useMemo(() => draftStepFamily(currentStep?.id ?? -1), [currentStep?.id]);
	const [draftStep, setDraftStep] = useAtom(draftStepAtom);
	const [loading, setLoading] = useState(false);

	// 第一次进入端点初始化
	useEffect(() => {
		if (currentStep === null) return;
		setDraftStep(prev => (prev.initialized ? prev : draftFromStep(currentStep)));
	}, [currentStep, setDraftStep]);

	// 判断端点是否被修改过
	const dirty = useMemo(() => {
		if (currentStep === null) return false;
		if (!draftStep?.initialized) return false;
		return stringifyDraftStep(draftStep) !== stringifyDraftStep(draftFromStep(currentStep));
	}, [draftStep, currentStep]);

	const handleImportEndpoint = (endpoint: ApiEndpoint) => {
		setDraftStep({
			...draftStep,
			initialized: true,
			runStatus: 'idle',
			sending: false,
			response: null,
			type: 'request',
			config: {
				...draftStep.config,
				method: endpoint.method,
				path: endpoint.path,
				pathParams: endpoint.pathParams ?? [],
				params: endpoint.queryParams ?? [],
				headers: endpoint.headers ?? [],
				body: endpoint.requestBody ?? { kind: 'none' },
				auth: endpoint.auth ?? { kind: 'none' },
				extractions: [],
			},
		});
		setOpenImportDialog(false);
	};

	const onSave = async () => {
		setLoading(true);
		if (currentStep === null) return;
		// 清除各种配置里的空行
		const cleaned = cleanDraftStep(draftStep);
		await updateTestStep(testFlowId, currentStep.id, cleaned);
		setDraftStep(cleaned);
		setStep(currentStep.id, cleaned);
		setCurrentStep(prev => (prev === null ? null : { ...prev, ...cleaned }));
		setLoading(false);
	};

	if (currentStep === null) {
		return (
			<Box
				sx={{
					minHeight: '50vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography variant='h4'>请选择一个步骤进行配置</Typography>
			</Box>
		);
	}

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					p: 2,
					opacity: loading ? 0.5 : 1,
					pointerEvents: loading ? 'none' : 'auto',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						gap: 1,
						alignItems: 'center',
					}}
				>
					<TextField
						size='small'
						fullWidth
						label='步骤名称'
						value={draftStep.name ?? ''}
						onChange={event =>
							setDraftStep(prev => ({
								...prev,
								name: event.target.value,
							}))
						}
					/>
					{draftStep.type === 'request' && <Button onClick={() => setOpenImportDialog(true)}>导入</Button>}
					<Button
						variant='contained'
						onClick={onSave}
						disabled={!dirty}
					>
						保存
					</Button>
				</Box>
				{draftStep.type === 'request' ? (
					<RequestStepForm
						// 添加key避免表单状态被缓存
						key={draftStep.id}
						step={draftStep}
						onChange={config => setDraftStep({ ...draftStep, config })}
					/>
				) : (
					<AssertStepForm
						key={draftStep.id}
						step={draftStep}
						onChange={config => setDraftStep({ ...draftStep, config })}
					/>
				)}
			</Box>
			<ImportApiDialog
				projectId={projectId}
				open={openImportDialog}
				handleClose={() => setOpenImportDialog(false)}
				handleSelectEndpoint={handleImportEndpoint}
			/>
		</>
	);
};
