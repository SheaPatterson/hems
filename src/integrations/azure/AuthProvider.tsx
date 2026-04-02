/**
 * Azure AD B2C Authentication Provider
 *
 * Drop-in replacement for the Supabase-based AuthProvider in AuthGuard.tsx.
 * Wraps the app with MsalProvider and exposes the same { user, isLoading, signIn, signOut }
 * interface so that AuthGuard, AdminGuard, and all consuming components work unchanged.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  MsalProvider,
  useMsal,
  useIsAuthenticated,
} from '@azure/msal-react';
import {
  InteractionRequiredAuthError,
  type AccountInfo,
} from '@azure/msal-browser';
import { azureClient } from './client';
import { azureB2CConfig } from './config';
import type { AzureUser } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AzureAuthContextType {
  user: AzureUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AzureAuthContextType | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapAccountToUser(account: AccountInfo, roles: string[] = []): AzureUser {
  const claims = account.idTokenClaims as Record<string, unknown> | undefined;
  return {
    id: (claims?.['oid'] as string) ?? account.localAccountId,
    email:
      (claims?.['emails'] as string[] | undefined)?.[0] ??
      (claims?.['email'] as string | undefined) ??
      account.username,
    displayName: account.name ?? '',
    roles,
  };
}

async function fetchUserRoles(userId: string): Promise<string[]> {
  try {
    const response = await azureClient.functions.invoke(`user-roles/${userId}`, {
      method: 'GET',
    });
    if (!response.ok) return [];
    return (await response.json()) as string[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Inner provider (must be rendered inside MsalProvider)
// ---------------------------------------------------------------------------

const AuthContextInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [user, setUser] = useState<AzureUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the active account, preferring the one MSAL already selected
  const activeAccount = useMemo(() => {
    return instance.getActiveAccount() ?? accounts[0] ?? null;
  }, [instance, accounts]);

  // Build user object from the active account + fetched roles
  useEffect(() => {
    let cancelled = false;

    async function resolveUser() {
      if (!isAuthenticated || !activeAccount) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Ensure MSAL tracks this as the active account
      instance.setActiveAccount(activeAccount);

      // Attempt silent token acquisition to confirm the session is valid
      try {
        await instance.acquireTokenSilent({
          scopes: azureB2CConfig.scopes,
          account: activeAccount,
        });
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          // Session expired — clear user so AuthGuard redirects to login
          if (!cancelled) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        // Other errors (network, etc.) — still show user from cached claims
      }

      // Map B2C claims to AzureUser
      const oid =
        (activeAccount.idTokenClaims?.['oid'] as string | undefined) ??
        activeAccount.localAccountId;

      const roles = await fetchUserRoles(oid);

      if (!cancelled) {
        setUser(mapAccountToUser(activeAccount, roles));
        setIsLoading(false);
      }
    }

    // Only resolve once MSAL is done with any in-progress interaction
    if (inProgress === 'none') {
      resolveUser();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, activeAccount, inProgress, instance]);

  // ---- signIn ----
  const signIn = useCallback(async () => {
    const result = await instance.loginPopup({
      scopes: azureB2CConfig.scopes,
    });

    if (result.account) {
      instance.setActiveAccount(result.account);
      const oid =
        (result.account.idTokenClaims?.['oid'] as string | undefined) ??
        result.account.localAccountId;
      const roles = await fetchUserRoles(oid);
      setUser(mapAccountToUser(result.account, roles));
    }
  }, [instance]);

  // ---- signOut ----
  const signOut = useCallback(async () => {
    await instance.logoutPopup();
    setUser(null);
  }, [instance]);

  const value = useMemo<AzureAuthContextType>(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

const msalInstance = azureClient.auth.getMsalInstance();

export const AzureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MsalProvider instance={msalInstance}>
    <AuthContextInner>{children}</AuthContextInner>
  </MsalProvider>
);

export const useAuth = (): AzureAuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AzureAuthProvider');
  return ctx;
};
