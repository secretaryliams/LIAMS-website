import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCertifications } from '../store/slices/publicCertificationsSlice';
import {
  DEFAULT_CERTIFICATIONS_SECTION_TITLE,
  SITE_SETTING_KEYS,
} from '../lib/siteSettingsKeys';
import { supabase } from '../lib/supabase';

/** PostgREST error when the table is missing or schema cache is stale */
function isSiteSettingsTableMissing(error) {
  if (!error) return false;
  const msg = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase();
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    msg.includes('site_settings') ||
    msg.includes('schema cache')
  );
}

export function useCertificationsSectionTitle() {
  const dispatch = useDispatch();
  const { sectionTitle, loading, items } = useSelector((state) => state.publicCertifications);

  useEffect(() => {
    // Load public certifications and settings title if not fetched yet
    if (items.length === 0 && sectionTitle === DEFAULT_CERTIFICATIONS_SECTION_TITLE) {
      dispatch(fetchPublicCertifications());
    }
  }, [dispatch, items.length, sectionTitle]);

  const load = useCallback(async () => {
    await dispatch(fetchPublicCertifications());
  }, [dispatch]);

  return { sectionTitle, loading, refresh: load };
}

export async function saveCertificationsSectionTitle(title) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const value = title.trim() || DEFAULT_CERTIFICATIONS_SECTION_TITLE;
  const { error } = await supabase.from('site_settings').upsert(
    {
      key: SITE_SETTING_KEYS.CERTIFICATIONS_SECTION_TITLE,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );

  if (error) {
    if (isSiteSettingsTableMissing(error)) {
      throw new Error(
        'The site_settings table is missing. Run supabase/migrations/add_site_settings.sql in the Supabase SQL Editor, then try again.',
      );
    }
    throw error;
  }
  return value;
}
