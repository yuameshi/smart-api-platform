import { Editor } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import './monaco-setup';

type Props = {
	lang?: string;
	value: string;
	onChange?: (value: string) => void;
	onBlur?: () => void; // 失焦回调函数
	height?: string;
};

export default function MonacoEditor({ lang = 'json', value, onChange, onBlur, height = '260px' }: Props) {
	// 确保回调始终指向最新prop
	const onBlurRef = useRef(onBlur);
	useEffect(() => {
		onBlurRef.current = onBlur;
	});

	return (
		<Editor
			height={height}
			language={lang}
			theme='vs'
			value={value}
			onChange={v => onChange?.(v ?? '')}
			onMount={editor => {
				editor.onDidBlurEditorWidget(() => onBlurRef.current?.());
			}}
			loading={<CircularProgress size={24} />}
			options={{
				readOnly: onChange === undefined,
				minimap: { enabled: false },
				lineNumbers: 'on',
				wordWrap: 'on',
				fontSize: 13,
				automaticLayout: true,
				scrollBeyondLastLine: false,
				tabSize: 2,
				// 关闭补全功能
				quickSuggestions: false,
				parameterHints: { enabled: false },
				suggestOnTriggerCharacters: false,
				wordBasedSuggestions: 'off',
			}}
		/>
	);
}
