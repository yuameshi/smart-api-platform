import { atomWithStorage } from 'jotai/utils';

/** JWT 认证令牌状态 */
export const tokenAtom = atomWithStorage<string | undefined>('token', undefined, undefined, { getOnInit: true });
