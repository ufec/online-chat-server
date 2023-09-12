module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'standard-with-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['tsconfig.json', 'tsconfig.eslint.json'],
    parser: '@typescript-eslint/parser',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/triple-slash-reference': 'off', // 关闭三斜杠引用
    '@typescript-eslint/ban-types': 'off', // 关闭禁止使用object，{}的类型检查
    '@typescript-eslint/no-unsafe-member-access': 'off', // 关闭不安全的成员访问
    '@typescript-eslint/no-unsafe-call': 'off', // 关闭不安全的方法调用
    '@typescript-eslint/no-invalid-void-type': 'off', // 关闭参数void类型检查
    '@typescript-eslint/no-empty-interface': 'off', // 关闭空接口报错
    '@typescript-eslint/explicit-function-return-type': 'off', // 关闭函数返回值类型检查
    '@typescript-eslint/no-explicit-any': 'off', // 关闭any类型检查
    '@typescript-eslint/strict-boolean-expressions': 'off', // 关闭布尔值检查
  },
};
