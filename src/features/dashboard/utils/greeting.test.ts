import { formatHomeDate, getGreeting, getSessionGreeting, resolveGreetingKey } from './greeting';

describe('greeting (D36 / RFG-169)', () => {
  it('maps the hour to a deterministic greeting key', () => {
    expect(resolveGreetingKey(0)).toBe('morning');
    expect(resolveGreetingKey(11)).toBe('morning');
    expect(resolveGreetingKey(12)).toBe('afternoon');
    expect(resolveGreetingKey(19)).toBe('afternoon');
    expect(resolveGreetingKey(20)).toBe('evening');
    expect(resolveGreetingKey(23)).toBe('evening');
  });

  it('builds the session greeting with the first name', () => {
    const noon = new Date('2026-10-10T12:00:00-03:00');
    expect(getSessionGreeting('Andrés', noon)).toBe('Buenas tardes, Andrés');
  });

  it('falls back to the salutation when the first name is missing or blank', () => {
    const morning = new Date('2026-10-10T08:00:00-03:00');
    expect(getSessionGreeting(undefined, morning)).toBe('Buenos días');
    expect(getSessionGreeting(null, morning)).toBe('Buenos días');
    expect(getSessionGreeting('   ', morning)).toBe('Buenos días');
  });

  it('labels the current day with a localized long date', () => {
    const date = new Date('2026-10-10T12:00:00-03:00');
    expect(getGreeting(date)).toBe('Buenas tardes');
    const formatted = formatHomeDate(date);
    expect(formatted.startsWith('Hoy, ')).toBe(true);
    expect(formatted).toContain('10');
  });
});
