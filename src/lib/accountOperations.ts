/**
 * Account Management Operations
 *
 * Handles creating, finding, and managing accounts in the customer register.
 */

import { supabase } from './supabase';
import type { Database } from '../types/database';

type Account = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];

/**
 * Find or create an account by company name
 * @param companyName Company name to find or create
 * @param userId User ID (owner of the account)
 * @param additionalData Optional additional account data
 * @returns Account ID
 */
export async function findOrCreateAccount(
  companyName: string,
  userId: string,
  additionalData?: {
    industry?: string;
    companySize?: '1-50' | '51-200' | '201-1000' | '1000+';
    contactName?: string;
    contactRole?: string;
  }
): Promise<{ accountId: string; isNew: boolean } | null> {
  try {
    if (!companyName || !companyName.trim()) {
      console.warn('[Account] Cannot create account without company name');
      return null;
    }

    const normalizedCompanyName = companyName.trim();

    // First, try to find existing account by company name
    const { data: existingAccounts, error: searchError } = await supabase
      .from('accounts')
      .select('id, company_name, created_at')
      .eq('user_id', userId)
      .ilike('company_name', normalizedCompanyName)
      .limit(1);

    if (searchError) {
      console.error('[Account] Error searching for account:', searchError);
      throw searchError;
    }

    // If account exists, return it
    if (existingAccounts && existingAccounts.length > 0) {
      console.log(`[Account] Found existing account: ${existingAccounts[0].company_name} (${existingAccounts[0].id})`);
      return {
        accountId: existingAccounts[0].id,
        isNew: false
      };
    }

    // Account doesn't exist, create new one
    const newAccount: AccountInsert = {
      user_id: userId,
      company_name: normalizedCompanyName,
      industry: additionalData?.industry || null,
      company_size: additionalData?.companySize || null,
      account_status: 'prospect',
      lifecycle_stage: 'prospect'
    };

    const { data: createdAccount, error: insertError } = await supabase
      .from('accounts')
      .insert(newAccount)
      .select('id')
      .single();

    if (insertError) {
      console.error('[Account] Error creating account:', insertError);
      throw insertError;
    }

    console.log(`[Account] ✅ Created new account: ${normalizedCompanyName} (${createdAccount.id})`);

    // If we have contact information, create a contact too
    if (additionalData?.contactName && createdAccount?.id) {
      await createContactForAccount(
        createdAccount.id,
        userId,
        additionalData.contactName,
        additionalData.contactRole
      );
    }

    return {
      accountId: createdAccount.id,
      isNew: true
    };

  } catch (error) {
    console.error('[Account] Error in findOrCreateAccount:', error);
    return null;
  }
}

/**
 * Create a contact for an account
 * @param accountId Account ID
 * @param userId User ID
 * @param contactName Full name (will be split into first/last)
 * @param contactRole Optional role/title
 */
async function createContactForAccount(
  accountId: string,
  userId: string,
  contactName: string,
  contactRole?: string
): Promise<void> {
  try {
    // Split name into first and last (basic implementation)
    const nameParts = contactName.trim().split(' ');
    const firstName = nameParts[0] || contactName;
    const lastName = nameParts.slice(1).join(' ') || contactName;

    const { error } = await supabase
      .from('contacts')
      .insert({
        account_id: accountId,
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        role: contactRole || null,
        is_primary: true, // First contact is primary
        contact_status: 'active'
      });

    if (error) {
      console.error('[Account] Error creating contact:', error);
    } else {
      console.log(`[Account] ✅ Created contact: ${contactName}`);
    }
  } catch (error) {
    console.error('[Account] Error in createContactForAccount:', error);
  }
}

/**
 * Link a call session to an account
 * @param sessionId Call session ID
 * @param accountId Account ID
 * @param contactId Optional contact ID
 */
export async function linkSessionToAccount(
  sessionId: string,
  accountId: string,
  contactId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('call_sessions')
      .update({
        account_id: accountId,
        contact_id: contactId || null
      })
      .eq('id', sessionId);

    if (error) {
      console.error('[Account] Error linking session to account:', error);
      return false;
    }

    console.log(`[Account] ✅ Linked session ${sessionId} to account ${accountId}`);
    return true;
  } catch (error) {
    console.error('[Account] Error in linkSessionToAccount:', error);
    return false;
  }
}

/**
 * Get account by ID
 * @param accountId Account ID
 * @returns Account or null
 */
export async function getAccount(accountId: string): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('[Account] Error fetching account:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Account] Error in getAccount:', error);
    return null;
  }
}

/**
 * List all accounts for a user
 * @param userId User ID
 * @returns Array of accounts
 */
export async function listAccounts(userId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Account] Error listing accounts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Account] Error in listAccounts:', error);
    return [];
  }
}

/**
 * Update account with live analysis data
 * @param accountId Account ID
 * @param analysisData Data from live analysis
 */
export async function updateAccountFromAnalysis(
  accountId: string,
  analysisData: {
    industry?: string;
    companySize?: '1-50' | '51-200' | '201-1000' | '1000+';
    estimatedValue?: number;
  }
): Promise<boolean> {
  try {
    const updateData: Partial<Database['public']['Tables']['accounts']['Update']> = {};

    if (analysisData.industry) {
      updateData.industry = analysisData.industry;
    }
    if (analysisData.companySize) {
      updateData.company_size = analysisData.companySize;
    }
    if (analysisData.estimatedValue !== undefined) {
      updateData.estimated_annual_value = analysisData.estimatedValue;
    }

    if (Object.keys(updateData).length === 0) {
      return false; // Nothing to update
    }

    const { error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', accountId);

    if (error) {
      console.error('[Account] Error updating account from analysis:', error);
      return false;
    }

    console.log(`[Account] ✅ Updated account ${accountId} with analysis data`);
    return true;
  } catch (error) {
    console.error('[Account] Error in updateAccountFromAnalysis:', error);
    return false;
  }
}
