import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  isPasswordRecoveryEvent,
} from './recovery';

describe('THIEPN Account recovery state', () => {
  it('recognizes only the canonical recovery auth event', () => {
    expect(
      isPasswordRecoveryEvent(
        'PASSWORD_RECOVERY',
      ),
    ).toBe(true);

    expect(
      isPasswordRecoveryEvent(
        'SIGNED_IN',
      ),
    ).toBe(false);

    expect(
      isPasswordRecoveryEvent(
        'INITIAL_SESSION',
      ),
    ).toBe(false);
  });
});
