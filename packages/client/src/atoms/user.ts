import { atomWithStorage } from 'jotai/utils';
import type { PublicUser } from 'shared';

/** 当前登录用户信息状态 */
export const userAtom = atomWithStorage<PublicUser | undefined>('user', undefined, undefined, { getOnInit: true });
