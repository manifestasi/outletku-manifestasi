export type Role = {
    id: string;
    name: 'owner' | 'manager' | 'cashier';
    guard_name: string;
};

export type User = {
    id: string;
    business_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    last_login_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export interface Passkey {
    id: string;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
