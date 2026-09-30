import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { PersistedTestRunStatus, StepRunResult, VariableStore } from 'shared';
import { TEST_RUN_STATUS } from 'shared';
import { TestFlow } from './test-flow.entity';

// 运行记录，开始运行时创建，跑的过程中不断更新，同时是历史记录也是快照
@Entity('test_flow_run')
export class TestFlowRun {
	@PrimaryGeneratedColumn()
	id: number;

	// 测试流程ID，外键test_flow.id
	@Column({ name: 'test_flow_id' })
	testFlowId: number;
	@ManyToOne(() => TestFlow, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'test_flow_id' })
	testFlow: TestFlow;

	@Column({ type: 'enum', enum: TEST_RUN_STATUS })
	status: PersistedTestRunStatus;

	@Column({ type: 'text', nullable: true })
	error: string | null;

	// 运行时快照，避免后期修改影响，下同
	@Column({ name: 'total_steps', type: 'int' })
	totalSteps: number;

	@Column({ name: 'passed_steps', type: 'int', default: 0 })
	passedSteps: number;

	@Column({ name: 'step_results', type: 'json' })
	stepResults: StepRunResult[];

	// 最终变量表
	@Column({ name: 'final_vars', type: 'json' })
	finalVars: VariableStore;

	@Column({ name: 'started_at', type: 'datetime', precision: 3 })
	startedAt: Date;

	@Column({ name: 'ended_at', type: 'datetime', precision: 3, nullable: true })
	endedAt: Date | null;

	@Column({ name: 'duration_ms', type: 'int', nullable: true })
	durationMs: number | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
