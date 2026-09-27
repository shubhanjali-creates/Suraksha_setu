import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../assets/CSS/CommunityForum.css';

const CommunityForum = () => {
  const { id } = useParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/community/${id}/announcements`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Unable to load announcements.');
        if (!cancelled) setTopics(d.announcements || []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="discussion-forum">
      <h2>Official Community Announcements</h2>
      {error && <p>{error}</p>}
      {loading && <p>Loading announcements...</p>}
      {!loading && !topics.length && <p>No announcements have been published for this community yet.</p>}
      <div className="topics-list">
        {topics.map(topic => (
          <div key={topic.AnnouncementID} className="topic-card">
            <h3 className="topic-title">{topic.Urgency?.toUpperCase()} priority</h3>
            <p className="topic-description">{topic.Content}</p>
            <div className="topic-info">
              <span className="topic-time">{new Date(topic.CreationDate).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { CommunityForum };
