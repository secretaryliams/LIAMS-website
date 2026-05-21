import { useEffect, useState } from 'react';
import { formatEventDateLabel, formatEventDateParts } from '../lib/eventFormat';
import { formatEventVenue } from '../lib/eventVenue';
import { supabase } from '../lib/supabase';

function mapUpcomingEvent(row) {
  const parts = formatEventDateParts(row.event_date);
  return {
    id: String(row.id),
    title: row.title,
    description: row.form_link
      ? 'Registration / submission link available.'
      : 'Details coming soon.',
    form_link: row.form_link,
    image_url: row.image_url,
    event_date: row.event_date,
    ...parts,
    dateLabel: formatEventDateLabel(row.event_date),
    venue: formatEventVenue(row.venue),
  };
}

function mapCertification(row) {
  return {
    id: String(row.id),
    title: row.title,
    subtitle: row.drive_link ? 'View certificate' : 'Certificate document',
    drive_link: row.drive_link,
    icon: '📄',
  };
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('announcements')
      .select('text')
      .eq('enabled', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) {
          setAnnouncements(data?.map((row) => row.text) ?? []);
        }
        setLoading(false);
      });
  }, []);

  return { announcements, loading };
}

export function useUpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('upcoming_events')
      .select('*')
      .eq('enabled', true)
      .order('event_date', { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (!error) {
          setEvents(data?.map(mapUpcomingEvent) ?? []);
        }
        setLoading(false);
      });
  }, []);

  return { events, loading };
}

export function usePreviousEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('previous_events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export function useCertifications() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) {
          setCertifications(data?.map(mapCertification) ?? []);
        }
        setLoading(false);
      });
  }, []);

  return { certifications, loading };
}
