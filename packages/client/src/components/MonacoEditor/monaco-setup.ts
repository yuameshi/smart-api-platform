import * as monaco from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/features/register.all.js';
import 'monaco-editor/languages/features/json/register.js';
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker.js?worker';

self.MonacoEnvironment = {
	getWorker(_workerId: string, label: string) {
		// 仅引入JSON支持
		return label === 'json' ? new jsonWorker() : new editorWorker();
	},
};

import { loader } from '@monaco-editor/react';
loader.config({ monaco });
