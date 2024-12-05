import { authService } from '../../../app/services/auth-service';
import { supabase } from '../../../app/services/supabase';

jest.mock('../../../app/services/supabase');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await expect(authService.signIn('test@example.com', 'password123'))
        .resolves.not.toThrow();
    });

    it('should handle invalid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Invalid credentials')
      });

      await expect(authService.signIn('test@example.com', 'wrongpass'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});