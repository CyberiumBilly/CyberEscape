import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { login, register, logout, loginAsGuest } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    ...auth,
    login: (credentials: { email: string; password: string }) => dispatch(login(credentials)),
    register: (data: { name: string; email: string; password: string }) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    loginAsGuest: () => dispatch(loginAsGuest()),
  };
}
