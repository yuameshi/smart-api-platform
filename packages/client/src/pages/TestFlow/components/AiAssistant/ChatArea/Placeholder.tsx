import { Box, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useContext } from 'react';
import type { FC } from 'react';
import { ChatContext } from '../contexts/ChatContext';

// 预设示例
const SUGGESTIONS = ['列出该项目的测试流程', '列出该项目的API端点', '给当前流程加一个请求步骤'];

export const Placeholder: FC = () => {
	const { sendMessage } = useContext(ChatContext);

	return (
		<Box
			sx={{
				flex: 1,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
				color: 'text.secondary',
				px: 3,
			}}
		>
			<AutoAwesomeIcon sx={{ fontSize: 48 }} />
			<Typography variant='body2'>我是你的测试流程助手，可以帮你创建、调整和修改测试流程。</Typography>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 1,
					justifyContent: 'center',
				}}
			>
				{SUGGESTIONS.map(s => (
					<Chip
						key={s}
						label={s}
						variant='outlined'
						onClick={() => void sendMessage(s)}
					/>
				))}
			</Box>
		</Box>
	);
};
