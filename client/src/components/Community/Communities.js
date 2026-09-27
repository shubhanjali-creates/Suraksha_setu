import React, { useCallback, useEffect, useState } from 'react';
import '../../assets/CSS/Communities.css';
import { useNavigate } from 'react-router-dom';

export const Communities = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/communities');
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Unable to load communities.');
      setRows(d.communities || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/communities');
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Unable to load communities.');
        if (!cancelled) { setRows(d.communities || []); setError(''); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const join = async id => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in before joining a community.');
    try {
      const r = await fetch(`/community/${id}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Unable to join community.');
      await load();
      alert('You joined the community.');
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <h1 style={{ marginLeft: 25 }}>Indian disaster-response communities</h1>
      {error && <p className="ops-error" style={{ margin: 25 }}>{error}</p>}
      {loading ? <p style={{ margin: 25 }}>Loading communities...</p> : (
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Members</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.ComID}>
                <td>{c.ComID}</td><td>{c.Name}</td><td>{c.Users?.length || 0}</td>
                <td>
                  <button className="action-btn" onClick={() => nav(`/community/${c.ComID}`)}>Open</button>
                  <button className="action-btn" onClick={() => join(c.ComID)}>Join</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && !rows.length && <p style={{ margin: 25 }}>No communities found. Run <code>npm run seed:india</code>.</p>}
    </div>
  );
};
