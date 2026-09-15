import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { TestStepConfig, TestStepType } from 'shared';
import { TestFlow } from './test-flow.entity';
import { TEST_STEP_TYPE } from 'shared';

@Entity('test_step')
export class TestStep {
	@PrimaryGeneratedColumn()
	id: number;

	// 所属测试流程ID（外键test_flow.id，删除流程时同步删除）
	@Column({ name: 'test_flow_id' })
	testFlowId: number;
	@ManyToOne(() => TestFlow, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'test_flow_id' })
	testFlow: TestFlow;

	@Column({ name: 'step_order', type: 'int' })
	order: number;

	@Column({ type: 'enum', enum: TEST_STEP_TYPE })
	type: TestStepType;

	@Column({ length: 100 })
	name: string;

	@Column({ type: 'json' })
	config: TestStepConfig;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
