import type { AssertLeft, AssertOperator, AssertionVerdict, VariableStore } from 'shared';
import RE2 from 're2';
import { extractValueFromJson, jsonPathValueToString } from './jsonpath-extractor';
import { renderTemplate } from './variable-manager';

// 只解析数值，忽略特殊写法（Infinity等）
function toNumber(value: string): number | null {
	return /^-?\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : null;
}

function equals(left: string, right: string): boolean {
	// 先尝试解析为数字进行数值比对，否则按字符串处理
	const leftNumber = toNumber(left);
	const rightNumber = toNumber(right);
	if (leftNumber !== null && rightNumber !== null) {
		return leftNumber === rightNumber;
	}
	return left === right;
}

export function evaluateAssertion(leftValue: string | undefined, operator: AssertOperator, expected: string): AssertionVerdict {
	const buildReturn = (pass: boolean, message: string): AssertionVerdict => ({ leftValue, operator, expected, pass, message });

	// 无法取值时只有不存在才给过，否则后续无法取值
	if (leftValue === undefined) {
		return operator === 'notExists' ? buildReturn(true, '值不存在') : buildReturn(false, '左值不存在');
	}

	const left = leftValue;
	switch (operator) {
		case 'eq':
			return buildReturn(equals(left, expected), `期望 ${expected}，实际 ${left}`);
		case 'neq':
			return buildReturn(!equals(left, expected), `期望不为 ${expected}，实际 ${left}`);
		case 'contains':
			return buildReturn(left.includes(expected), `期望包含 ${expected}，实际 ${left}`);
		case 'notContains':
			return buildReturn(!left.includes(expected), `期望不包含 ${expected}，实际 ${left}`);
		case 'exists':
			// 取到了但是空字符串，等于空
			return buildReturn(left !== '', left === '' ? '值为空，视为不存在' : '值存在');
		case 'notExists':
			return buildReturn(left === '', left === '' ? '值不存在' : '值存在');
		// 正则放在一起
		case 'matches':
		case 'notMatches': {
			// 限制正则长度
			if (expected.length > 200) {
				return buildReturn(false, `正则表达式过长`);
			}
			let pattern: RE2;
			try {
				// 不用原生regexp，避免redos
				pattern = new RE2(expected);
			} catch {
				return buildReturn(false, `正则表达式无效：${expected}`);
			}
			// 截断超长输入
			// 100k
			const leftSlice = left.slice(0, 100000);
			const regexpResult = pattern.test(leftSlice);
			return buildReturn(
				operator === 'matches' ? regexpResult : !regexpResult,
				`${regexpResult ? '匹配' : '不匹配'} ${expected}，实际 ${leftSlice}`,
			);
		}
		// 比较放在一起
		case 'gt':
		case 'gte':
		case 'lt':
		case 'lte': {
			const leftNumber = toNumber(left);
			const rightNumber = toNumber(expected);
			if (leftNumber === null || rightNumber === null) return buildReturn(false, '非数值无法比较');
			const pass =
				operator === 'gt'
					? leftNumber > rightNumber
					: operator === 'gte'
						? leftNumber >= rightNumber
						: operator === 'lt'
							? leftNumber < rightNumber
							: leftNumber <= rightNumber;
			return buildReturn(pass, `实际 ${left}，期望 ${operator} ${expected}`);
		}
		case 'isJson': {
			try {
				JSON.parse(left);
				return buildReturn(true, '是JSON');
			} catch {
				return buildReturn(false, '不是JSON');
			}
		}
		case 'isNumber':
			return buildReturn(toNumber(left) !== null, `实际 ${left}`);
		case 'isEmpty':
			return buildReturn(left.trim() === '', `实际 ${left}`);
	}
}

// 获取左值
export function resolveAssertLeft(left: AssertLeft, variables: VariableStore, lastResponseJson: unknown): string | undefined {
	if (left.mode === 'variable') {
		const name = renderTemplate(left.value, variables).trim();
		if (name === '') return undefined;
		// 用hasOwnProperty判断，避免类原型链上的名字被当成变量
		return Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : undefined;
	}
	if (left.mode === 'jsonpath') {
		return jsonPathValueToString(extractValueFromJson(lastResponseJson, renderTemplate(left.value, variables)));
	}
	if (left.mode === 'literal') {
		return renderTemplate(left.value, variables);
	}
}
