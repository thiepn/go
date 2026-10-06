import { describe, expect, it } from 'vitest';

import {
  parseGoBackup,
  serializeGoBackup,
  type GoBackup,
} from './backup';
import { emptyGoSyncPayload } from './sync';

describe('Go backup', () => {
  it('round-trips a valid backup', () => {
    const backup: GoBackup = {
      format: 'thiepn-go-backup',
      version: 1,
      exportedAt: 123,
      state: emptyGoSyncPayload(),
    };

    expect(
      parseGoBackup(
        serializeGoBackup(backup),
      ),
    ).toEqual(backup);
  });

  it('rejects unrelated JSON', () => {
    expect(() =>
      parseGoBackup(
        '{"hello":"world"}',
      ),
    ).toThrow(
      'not a supported Go backup',
    );
  });
});
