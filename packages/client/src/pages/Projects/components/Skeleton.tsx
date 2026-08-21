import { Box, Skeleton as SkeletonBase, Card, CardContent } from '@mui/material';

export const Skeleton = () => (
	<Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
		{Array.from({ length: 6 }).map((_, i) => (
			<Card key={i}>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '1 1 auto' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<SkeletonBase
							variant='text'
							width='30%'
						/>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<SkeletonBase
								variant='circular'
								width={24}
								height={24}
							/>
							<SkeletonBase
								variant='circular'
								width={24}
								height={24}
							/>
							<SkeletonBase
								variant='circular'
								width={24}
								height={24}
							/>
						</Box>
					</Box>
					<Box sx={{ color: 'text.secondary' }}>
						<SkeletonBase
							variant='text'
							width='50%'
						/>
						<SkeletonBase
							variant='text'
							width='20%'
						/>
						<SkeletonBase
							variant='text'
							width='60%'
						/>
					</Box>
				</CardContent>
			</Card>
		))}
	</Box>
);
