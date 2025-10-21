/**
 * Example basic test file for beginners
 *
 * This file shows you how to write simple JavaScript tests.
 * Tests help ensure your code works correctly and catch bugs early!
 */

describe('Basic JavaScript Testing', () => {
  // A simple test to verify Jest is working
  it('should pass a basic arithmetic test', () => {
    expect(1 + 1).toBe(2);
  });

  // Testing arrays
  it('should work with arrays', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain('banana');
  });

  // Testing objects
  it('should work with objects', () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
    };
    expect(user).toHaveProperty('name');
    expect(user.email).toBe('test@example.com');
  });

  // Testing async functions
  it('should handle async operations', async () => {
    const getData = async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('data'), 100);
      });
    };

    const result = await getData();
    expect(result).toBe('data');
  });
});
