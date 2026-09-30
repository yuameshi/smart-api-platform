import { Injectable } from '@nestjs/common';
import type { TestRunEvent } from 'shared';
import { Observable, Subject } from 'rxjs';

// https://cn.rx.js.org/manual/overview.html#h15
// 通过rxjs的Subject实现一个简单的事件系统，进程内使用
@Injectable()
export class RunEventStream {
	private readonly subject = new Subject<TestRunEvent>();

	// 获取observable事件
	get events$(): Observable<TestRunEvent> {
		return this.subject.asObservable();
	}

	// runner提交事件
	emit(event: TestRunEvent): void {
		this.subject.next(event);
	}
}
