import { atomWithStorage } from 'jotai/utils';

/** 当前登录用户信息状态 */
export const userAtom = atomWithStorage<UserBrief | undefined>('user', undefined, undefined, { getOnInit: true });
