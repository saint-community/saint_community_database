import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export type OnboardingRole =
  | 'church_pastor'
  | 'fellowship_leader'
  | 'cell_leader';

const withToken = (path: string, token: string) => path.replace(':token', token);

export const sendOnboardingInvite = async (body: {
  email: string;
  role?: OnboardingRole;
  ministry_name?: string;
  app_url?: string;
}) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.ONBOARDING_INVITE, body);
  return data || {};
};

export const sendTokenOnboardingInvite = async (
  token: string,
  body: {
    email: string;
    role: OnboardingRole;
    ministry_name?: string;
    app_url?: string;
  }
) => {
  const { data } = await ApiCaller.post(
    withToken(QUERY_PATHS.ONBOARDING_TOKEN_INVITE, token),
    body
  );
  return data || {};
};

export const getOnboardingDetails = async (token: string) => {
  const { data } = await ApiCaller.get(
    withToken(QUERY_PATHS.ONBOARDING_DETAIL, token)
  );
  return data || {};
};

export const createOnboardingAccount = async (
  token: string,
  body: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation?: string;
  }
) => {
  const { data } = await ApiCaller.post(
    withToken(QUERY_PATHS.ONBOARDING_ACCOUNT, token),
    {
      name: body.name,
      email: body.email,
      password: body.password,
      password_confirmation: body.passwordConfirmation,
    }
  );
  return data || {};
};

export const createOnboardingChurch = async (token: string, body: any) => {
  const { data } = await ApiCaller.post(
    withToken(QUERY_PATHS.ONBOARDING_CHURCH, token),
    body
  );
  return data || {};
};

export const createOnboardingFellowship = async (token: string, body: any) => {
  const { data } = await ApiCaller.post(
    withToken(QUERY_PATHS.ONBOARDING_FELLOWSHIP, token),
    body
  );
  return data || {};
};

export const createOnboardingCell = async (token: string, body: any) => {
  const { data } = await ApiCaller.post(
    withToken(QUERY_PATHS.ONBOARDING_CELL, token),
    body
  );
  return data || {};
};

export const finishOnboarding = async (token: string) => {
  const { data } = await ApiCaller.post(
    withToken(QUERY_PATHS.ONBOARDING_FINISH, token)
  );
  return data || {};
};
