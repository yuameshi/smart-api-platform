import { useState } from 'react';
import type { FC } from 'react';
import { Box, Button, Collapse } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MarkdownView } from './MarkdownView';

export const ThinkingBlock: FC<{ text: string }> = ({ text }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<Box sx={{ my: 0.5 }}>
			<Button
				startIcon={<LightbulbIcon fontSize='small' />}
				onClick={() => setExpanded(v => !v)}
				endIcon={expanded ? <ExpandLessIcon fontSize='small' /> : <ExpandMoreIcon fontSize='small' />}
				sx={{ color: 'text.secondary', textTransform: 'none' }}
			>
				推理
			</Button>
			<Collapse
				in={expanded}
				sx={{
					pl: 1.5,
					m: 0.5,
					color: 'text.secondary',
					borderLeft: '2px solid',
					borderColor: 'divider',
				}}
			>
				<MarkdownView text={text}></MarkdownView>
			</Collapse>
		</Box>
	);
};
