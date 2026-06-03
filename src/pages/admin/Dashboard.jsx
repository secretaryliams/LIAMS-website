import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { formatEventDateLabel } from "../../lib/eventFormat";
import { formatEventVenue } from "../../lib/eventVenue";
import { useCertificationsSectionTitle } from "../../hooks/useSiteSettings";
import { supabase } from "../../lib/supabase";

import "./Admin.css";

function DashboardPanel({
  title,
  manageLink,
  count,
  children,
  empty,
  index = 0,
}) {
  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <header className="admin-panel__header">
        <div>
          <h3>{title}</h3>

          <span className="admin-panel__count">
            {count} item{count === 1 ? "" : "s"}
          </span>
        </div>

        <Link to={manageLink} className="admin-panel__manage">
          Manage all →
        </Link>
      </header>

      {empty ? (
        <p className="admin-panel__empty">Nothing published yet.</p>
      ) : (
        children
      )}
    </motion.section>
  );
}

export default function Dashboard() {
  const { sectionTitle: certsSectionTitle } =
    useCertificationsSectionTitle();

  const [announcements, setAnnouncements] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [previous, setPrevious] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [a, u, p, c] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", {
          ascending: false,
        }),

        supabase.from("upcoming_events").select("*").order("start_date", {
          ascending: true,
          nullsFirst: false,
        }),

        supabase.from("previous_events").select("*").order("created_at", {
          ascending: false,
        }),

        supabase.from("certifications").select("*").order("created_at", {
          ascending: false,
        }),
      ]);

      if (a.error || u.error || p.error || c.error) {
        setError(
          a.error?.message ||
            u.error?.message ||
            p.error?.message ||
            c.error?.message ||
            "Failed to load dashboard",
        );

        return;
      }

      setAnnouncements(a.data ?? []);
      setUpcoming(u.data ?? []);
      setPrevious(p.data ?? []);
      setCertifications(c.data ?? []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await load();
    };

    fetchData();
  }, [load]);

  const remove = useCallback(
    async (table, id) => {
      const confirmed = window.confirm(
        'Delete this item permanently?'
      );

      if (!confirmed) return;

      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        await load();
      } catch (err) {
        setError(err.message || 'Failed to delete item.');
      }
    },
    [load]
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <h2>Content overview</h2>

        <p>
          Manage dynamic content shown on the public LIAMS website. Use quick
          actions below or open a section to add and edit entries.
        </p>
      </header>

      {error && (
        <p className="admin-error admin-dashboard__error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="admin-muted">Loading dashboard…</p>
      ) : (
        <div className="admin-dashboard__grid">
          {/* Announcements */}
          <DashboardPanel
            title="Announcements"
            manageLink="/admin/announcements"
            count={announcements.length}
            empty={!announcements.length}
            index={0}
          >
            <ul className="admin-panel__list">
              {announcements.map((row) => (
                <li key={row.id} className="admin-panel__row">
                  <div className="admin-panel__body">
                    <p>{row.text}</p>

                    <span
                      className={`admin-badge${
                        row.enabled ? "" : " admin-badge--off"
                      }`}
                    >
                      {row.enabled ? "Live" : "Hidden"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => remove("announcements", row.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </DashboardPanel>

          {/* Upcoming Events */}
          <DashboardPanel
            title="Upcoming events"
            manageLink="/admin/upcoming-events"
            count={upcoming.length}
            empty={!upcoming.length}
            index={1}
          >
            <ul className="admin-panel__list">
              {upcoming.map((row) => (
                <li key={row.id} className="admin-panel__row">
                  <div className="admin-panel__body">
                    <strong>{row.title}</strong>

                    <p className="admin-muted">
                      {formatEventDateLabel(row.event_date)} ·{" "}
                      {formatEventVenue(row.venue)}
                    </p>

                    <span
                      className={`admin-badge${
                        row.enabled ? "" : " admin-badge--off"
                      }`}
                    >
                      {row.enabled ? "Live" : "Hidden"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => remove("upcoming_events", row.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </DashboardPanel>

          {/* Previous Events */}
          <DashboardPanel
            title="Previous events"
            manageLink="/admin/previous-events"
            count={previous.length}
            empty={!previous.length}
            index={2}
          >
            <ul className="admin-panel__list admin-panel__list--gallery">
              {previous.map((row) => (
                <li
                  key={row.id}
                  className="admin-panel__row admin-panel__row--gallery"
                >
                  {row.image_url && (
                    <img
                      src={row.image_url}
                      alt=""
                      className="admin-panel__preview"
                    />
                  )}

                  <div className="admin-panel__body">
                    <strong>{row.category || "Gallery item"}</strong>

                    {row.caption && (
                      <p className="admin-muted">{row.caption}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => remove("previous_events", row.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </DashboardPanel>

          {/* Certifications */}
          <DashboardPanel
            title={certsSectionTitle}
            manageLink="/admin/certifications"
            count={certifications.length}
            empty={!certifications.length}
            index={3}
          >
            <ul className="admin-panel__list">
              {certifications.map((row) => (
                <li key={row.id} className="admin-panel__row">
                  <div className="admin-panel__body">
                    <strong>{row.title}</strong>

                    {row.drive_link && (
                      <p>
                        <a
                          href={row.drive_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Drive link
                        </a>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => remove("certifications", row.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </DashboardPanel>
        </div>
      )}
    </div>
  );
}