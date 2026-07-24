import { Box } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';
import { LayoutHeader } from './Header';
import { LayoutFooter } from './Footer';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
			}}
		>
			<LayoutHeader />
			<Box
				component='main'
				sx={{
					flex: '1 0 auto',
					py: 3,
				}}
			>
				{children}
			</Box>
			<LayoutFooter />
		</Box>
	);
};
