import { IsArray, IsInt } from 'class-validator';
import type { ReorderTestStepsRequest } from 'shared';

export class ReorderTestStepsDto implements ReorderTestStepsRequest {
	// 传输格式为[stepId1, stepId2, stepId3...]，后端根据stepId所在下标更新对应order
	@IsArray()
	@IsInt({ each: true })
	orderedIds!: number[];
}
