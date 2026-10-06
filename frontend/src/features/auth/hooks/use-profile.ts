import { useMutation } from '@tanstack/react-query';
import { httpAuthApi } from '../api/http-auth-api';
import type { ChangePasswordParams, UpdateProfileParams } from '../api/auth-api';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: UpdateProfileParams) => httpAuthApi.updateProfile(input),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordParams) => httpAuthApi.changePassword(input),
  });
}
