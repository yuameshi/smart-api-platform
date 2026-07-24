import { useEffect } from 'react';

export default function Title({ children }: { children?: string }) {
	useEffect(() => {
		if (children) document.title = `${children} - 智能API交付链路自动化平台`;
		else document.title = '智能API交付链路自动化平台';
	}, [children]);

	return null;
}
