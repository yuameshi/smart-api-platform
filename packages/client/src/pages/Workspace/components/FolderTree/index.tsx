import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { RichTreeView, TreeItem, useRichTreeViewApiRef, useTreeItemModel } from '@mui/x-tree-view';
import type { TreeItemProps } from '@mui/x-tree-view';
import { NodeIcon } from './Icons';
import type { TreeNode } from '../..';
import { PageUtilContext } from '../PageUtil';
import { ContextMenu, ContextMenuData } from './ContextMenu';

type ContextMenuHandler = (event: MouseEvent<HTMLElement>, node: TreeNode) => void;

const TreeContextMenuContext = createContext<ContextMenuHandler | null>(null);

function CustomTreeItem(props: TreeItemProps) {
	const { itemId, label, children, ...other } = props;
	const node = useTreeItemModel<TreeNode>(itemId);
	const onNodeContextMenu = useContext(TreeContextMenuContext);

	const labelContent = node ? (
		<Box
			component='span'
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 1,
				minWidth: 0,
				flex: '1 1 auto',
			}}
		>
			<NodeIcon node={node} />
			<Typography
				component='span'
				noWrap
				sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'inherit' }}
			>
				{label}
			</Typography>
		</Box>
	) : (
		(label as React.ReactNode)
	);

	return (
		<TreeItem
			{...other}
			itemId={itemId}
			label={labelContent}
			slotProps={{
				content: {
					onContextMenu: event => {
						event.preventDefault();
						if (node && onNodeContextMenu) onNodeContextMenu(event, node);
					},
				},
			}}
		>
			{children}
		</TreeItem>
	);
}

type FolderTreeProps = {
	projectId: number;
	projectName: string;
	items: TreeNode[];
};

export const FolderTree: FC<FolderTreeProps> = ({ projectId, projectName, items }) => {
	const {
		selectedControls: { setSelectedEndpointId },
	} = useContext(PageUtilContext);
	const apiRef = useRichTreeViewApiRef();
	const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

	// 递归遍历TreeNode，生成id和TreeNode对应表
	const idToNode = useMemo(() => {
		const map = new Map<string, TreeNode>();
		const walk = (list: TreeNode[]) => {
			for (const n of list) {
				map.set(n.id, n);
				if (n.children) walk(n.children);
			}
		};
		walk(items);
		return map;
	}, [items]);

	// 递归遍历文件夹树，默认展开所有文件夹
	const defaultExpandedItems = useMemo(() => {
		const ids: string[] = [];
		const walk = (list: TreeNode[]) => {
			for (const n of list) {
				if (n.kind === 'folder') ids.push(n.id);
				if (n.children) walk(n.children);
			}
		};
		walk(items);
		return ids;
	}, [items]);

	const handleOpenContextMenu = useCallback<ContextMenuHandler>((event, node) => {
		event.preventDefault();
		setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, node });
	}, []);

	const handleCloseMenu = useCallback(() => setContextMenu(null), []);

	const handleSelectionToggle = (_event: unknown, itemId: string, isSelected: boolean) => {
		const node = idToNode.get(itemId);
		if (node?.kind === 'endpoint') {
			setSelectedEndpointId(isSelected ? (node.rawId ?? null) : null);
		} else {
			setSelectedEndpointId(null);
		}
	};

	return (
		<TreeContextMenuContext.Provider value={handleOpenContextMenu}>
			<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
				<Typography
					variant='subtitle2'
					sx={{ px: 2, py: 1, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
				>
					<Typography
						component='span'
						variant='subtitle2'
						sx={{ mr: 0.5 }}
					>
						#{projectId}
					</Typography>
					{projectName}
				</Typography>
				<Box sx={{ flex: '1 1 auto', overflow: 'auto', py: 0.5 }}>
					<RichTreeView
						items={items}
						apiRef={apiRef}
						slots={{ item: CustomTreeItem }}
						getItemLabel={item => item.label}
						onItemSelectionToggle={handleSelectionToggle}
						defaultExpandedItems={defaultExpandedItems}
					/>
				</Box>
				<ContextMenu
					contextMenu={contextMenu}
					onClose={handleCloseMenu}
				/>
			</Box>
		</TreeContextMenuContext.Provider>
	);
};

export default FolderTree;
