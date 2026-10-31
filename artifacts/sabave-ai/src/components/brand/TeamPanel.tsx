import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addTeamMember, getGetBusinessQueryKey, removeTeamMember, type TeamMember } from '@workspace/api-client-react';
import { asArray } from '@/lib/as-array';
import { apiErrorInfo } from '@/lib/workspace';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TeamPanel({ businessId, userId, members }: { businessId?: string; userId: string; members: TeamMember[] }) {
  const qc = useQueryClient();
  const [team, setTeam] = useState(() => asArray<TeamMember>(members));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'staff'>('staff');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => setTeam(asArray<TeamMember>(members)), [members]);

  const headers = { headers: { 'x-user-id': userId } };

  const add = async () => {
    if (!businessId) return;
    if (!name.trim() || !EMAIL.test(email.trim())) { setError('Enter a name and a valid email.'); return; }
    setBusy(true); setError('');
    try {
      const next = await addTeamMember(businessId, { name: name.trim(), email: email.trim(), role }, headers);
      if (!Array.isArray(next)) { setError('The team list could not load.'); return; }
      setTeam(next);
      setName(''); setEmail('');
      await qc.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
    } catch (err) {
      setError(apiErrorInfo(err).message);
    } finally { setBusy(false); }
  };

  const remove = async (member: TeamMember) => {
    if (!businessId || (!member.invited && member.role === 'owner')) return;
    setBusy(true); setError('');
    try {
      const next = await removeTeamMember(businessId, member.id, headers);
      if (!Array.isArray(next)) { setError('The team list could not load.'); return; }
      setTeam(next);
      await qc.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
    } catch (err) {
      setError(apiErrorInfo(err).message);
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="team-list">
      <ul className="team-list">
        {team.map((member) => (
          <li key={member.id} data-testid={`team-member-${member.id}`}>
            <div>
              <strong>{member.name}</strong>
              <span>{member.email}</span>
            </div>
            <span className={`role-chip r-${member.role}`}>{member.role === 'owner' ? 'Owner' : 'Staff'}</span>
            {member.invited && <span className="status-chip">Invite sent (demo)</span>}
            {member.invited && <button type="button" className="action-btn small" disabled={busy} onClick={() => void remove(member)}>Remove</button>}
          </li>
        ))}
        {team.length === 0 && <li><span>No team members saved for this business yet.</span></li>}
      </ul>
      {businessId && (
        <div className="field-grid" style={{ marginTop: 12 }}>
          <input className="text-input" aria-label="Team member name" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} data-testid="input-team-name" />
          <input className="text-input" aria-label="Team member email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} data-testid="input-team-email" />
          <select className="text-input" aria-label="Team member role" value={role} onChange={(event) => setRole(event.target.value as 'owner' | 'staff')} data-testid="select-team-role">
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
          <button type="button" className="action-btn small" disabled={busy} onClick={() => void add()} data-testid="button-add-team">Add team member</button>
        </div>
      )}
      <p className="field-hint">Owner: approve or reject campaigns, set budget, edit Brand Kit, manage team. Staff: see alerts, prepare and edit drafts, submit for approval. Cannot publish.</p>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
