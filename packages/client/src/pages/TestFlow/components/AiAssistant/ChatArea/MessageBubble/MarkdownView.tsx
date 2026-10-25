import { memo } from 'react';
import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownView = memo(function MarkdownView({ text }: { text: string }) {
	return (
		<Box
			sx={{
				fontSize: '0.875rem',
				lineHeight: 1.7,
				wordBreak: 'break-word',
				'& p': {
					my: 0.5,
				},
				'& ul, & ol': {
					my: 0.5,
					pl: 2.5,
				},
				'& pre': {
					my: 1,
					p: 1.5,
					borderRadius: 1,
					bgcolor: 'grey.100',
					overflow: 'auto',
				},
				'& code': {
					px: 0.5,
					borderRadius: 0.5,
					bgcolor: 'grey.100',
					fontSize: '0.8125rem',
				},
				'& pre code': {
					px: 0,
					bgcolor: 'transparent',
				},
				'& blockquote': {
					my: 0.5,
					ml: 0,
					pl: 1.5,
					borderLeft: '3px solid',
					borderColor: 'divider',
					color: 'text.secondary',
				},
				'& table': {
					borderCollapse: 'collapse',
					my: 1,
				},
				'& th, & td': {
					border: '1px solid',
					borderColor: 'divider',
					px: 1,
					py: 0.5,
				},
			}}
		>
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
		</Box>
	);
});
