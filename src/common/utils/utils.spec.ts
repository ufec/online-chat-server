import { hashPassword } from './utils';
describe('Test Utils', () => {
  it('test hashPassword', () => {
    expect(hashPassword('123456', '123456').length).toBe(32);
  });
});
