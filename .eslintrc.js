module.exports = {
	env: {
		node: true,
		commonjs: true,
		es2021: true,
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 'latest',
	},
	plugins: ['prefer-arrow'],
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single', { avoidEscape: true }],
		semi: ['error', 'always'],
		'prefer-arrow/prefer-arrow-functions': [
			'error',
			{
				singleReturnOnly: false,
				disallowPrototype: true,
				classPropertiesAllowed: true,
			},
		],
		'prefer-arrow-callback': ['error'],
		'func-style': ['error', 'expression'],
		'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'comma-dangle': ['error', 'always-multiline'],
		'prefer-const': ['error'],
		'no-undef': ['warn'],
		'no-var': ['error'],
	},
};
