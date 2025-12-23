import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setProfileData } from '../../store/profile';
import { setUserData, clearUserData } from '../../store/user';
import { GAMES_LIST, SCHEDULES_LIST, PLAYSTYLES_LIST } from '../../data/gameOptions';
import { Edit3, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import './profile.css';

const mapIdsToLabels = (ids: string[] = [], list: { id: string; label: string }[]) =>
  ids.map(id => (list.find(item => item.id === id)?.label ?? id));

const toggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
  if (list.includes(id)) setList(list.filter(item => item !== id));
  else setList([...list, id]);
};

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user.data);
  const profile = useSelector((s: RootState) => s.profile.data);

  const savedProfileRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const [games, setGames] = useState<string[]>(profile?.games ?? []);
  const [schedules, setSchedules] = useState<string[]>(profile?.schedules ?? []);
  const [playStyle, setPlayStyle] = useState<string | null>(profile?.playStyle ?? null);

  const [editing, setEditing] = useState({
    account: false,
    games: false,
    schedules: false,
    style: false,
    security: false
  });

  const [saving, setSaving] = useState(false);
  const [pwdState, setPwdState] = useState({ current: '', next: '', confirm: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pwdNotice, setPwdNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [activeTab, setActiveTab] = useState<'information' | 'preferences' | 'securite'>('information');

  useEffect(() => {
    if (!profile && user?.userId) {
      (async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/profiles/me', {
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            dispatch(setProfileData(data));
            savedProfileRef.current = data;
            setGames(data.games ?? []);
            setSchedules(data.schedules ?? []);
            setPlayStyle(data.playStyle ?? null);
          } else {
            savedProfileRef.current = null;
          }
        } catch {
          savedProfileRef.current = null;
        } finally {
          setLoading(false);
        }
      })();
    } else {
      savedProfileRef.current = profile ?? null;
      setGames(profile?.games ?? []);
      setSchedules(profile?.schedules ?? []);
      setPlayStyle(profile?.playStyle ?? null);
    }
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
  }, [profile, user, dispatch]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { }
    dispatch(clearUserData());
    navigate('/');
  };

  const resetSection = (section: keyof typeof editing) => {
    if (savedProfileRef.current) {
      if (section === 'account') {
        setUsername(user?.username ?? '');
        setEmail(user?.email ?? '');
      } else if (section === 'games') setGames(savedProfileRef.current.games ?? []);
      else if (section === 'schedules') setSchedules(savedProfileRef.current.schedules ?? []);
      else if (section === 'style') setPlayStyle(savedProfileRef.current.playStyle ?? null);
      else if (section === 'security') setPwdState({ current: '', next: '', confirm: '' });
    } else {
      if (section === 'account') {
        setUsername(user?.username ?? '');
        setEmail(user?.email ?? '');
      } else if (section === 'games') setGames([]);
      else if (section === 'schedules') setSchedules([]);
      else if (section === 'style') setPlayStyle(null);
      else if (section === 'security') setPwdState({ current: '', next: '', confirm: '' });
    }
    setNotice(null);
    setEditing(prev => ({ ...prev, [section]: false }));
  };

  const saveProfilePartial = async (opts: { account?: boolean; games?: boolean; schedules?: boolean; style?: boolean }) => {
    if (!user?.userId) return;
    setSaving(true);
    setNotice(null);
    const payload = {
      username,
      email,
      games,
      schedules,
      playStyle
    };

    try {
      const res = await fetch('/api/profiles/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        dispatch(setProfileData(saved));
        dispatch(setUserData({
          userId: user.userId,
          username: saved.username ?? username,
          email: saved.email ?? email,
          setupCompleted: true
        }));
        savedProfileRef.current = saved;
        setNotice('Sauvegarde effectuée.');
        setNoticeType('success');
        Object.keys(opts).forEach(k => {
          if ((opts as any)[k]) setEditing(prev => ({ ...prev, [k]: false }));
        });
      } else {
        setNotice('Erreur lors de la sauvegarde.');
        setNoticeType('error');
      }
    } catch {
      setNotice('Erreur réseau.');
      setNoticeType('error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user?.userId) return;
    if (pwdState.next !== pwdState.confirm) {
      setPwdNotice({ msg: 'Les nouveaux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    setPwdLoading(true);
    setPwdNotice(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword: pwdState.current, newPassword: pwdState.next })
      });

      if (res.ok) {
        setPwdNotice({ msg: 'Mot de passe mis à jour avec succès.', type: 'success' });
        setPwdState({ current: '', next: '', confirm: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPwdNotice(null);
        }, 1500);
      } else if (res.status === 401) {
        setPwdNotice({ msg: 'Mot de passe actuel incorrect.', type: 'error' });
      } else {
        setPwdNotice({ msg: 'Erreur lors du changement de mot de passe.', type: 'error' });
      }
    } catch {
      setPwdNotice({ msg: 'Erreur réseau.', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteError(null);
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?.userId) return;
    if (!deletePassword) {
      setDeleteError('Veuillez entrer votre mot de passe.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (res.ok) {
        dispatch(clearUserData());
        navigate('/');
      } else if (res.status === 401) {
        setDeleteError('Mot de passe incorrect.');
      } else {
        setDeleteError('Impossible de supprimer le compte. Réessayez plus tard.');
      }
    } catch {
      setDeleteError('Erreur réseau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const gamesLabels = mapIdsToLabels(games, GAMES_LIST);
  const schedulesLabels = mapIdsToLabels(schedules, SCHEDULES_LIST);
  const playStyleLabel = PLAYSTYLES_LIST.find(p => p.id === playStyle)?.label ?? 'Non défini';

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar-large" aria-hidden>{user?.username?.charAt(0).toUpperCase() ?? 'J'}</div>
          <div className="profile-meta">
            <h1 className="profile-title">{user?.username ?? 'Joueur'}</h1>
            <p className="profile-sub">{user?.email ?? ''}</p>
          </div>
          <div className="profile-actions-top">
            <button className="logout-icon" onClick={handleLogoutClick} aria-label="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === 'information' ? 'active' : ''}`} onClick={() => setActiveTab('information')} aria-selected={activeTab === 'information'}>Informations</button>
          <button className={`tab ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')} aria-selected={activeTab === 'preferences'}>Préférences</button>
          <button className={`tab ${activeTab === 'securite' ? 'active' : ''}`} onClick={() => setActiveTab('securite')} aria-selected={activeTab === 'securite'}>Sécurité</button>
        </div>
        {activeTab === 'information' && (
          <div className="card-section">
            <h2 className="section-title-inline">Informations <button aria-label="Modifier informations du compte" className="icon-edit-inline" onClick={() => { if (editing.account) resetSection('account'); else setEditing(prev => ({ ...prev, account: true })); }}><Edit3 size={14} /></button></h2>
            {editing.account ? (
              <div className="edit-block">
                <div className="form-row">
                  <label>Pseudo</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="section-controls">
                  <button className="btn-small btnPrimary" onClick={() => saveProfilePartial({ account: true })} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                </div>
              </div>
            ) : (
              <div className="read-block">
                <div className="row"><span className="label">Pseudo</span><span className="value">{username}</span></div>
                <div className="row"><span className="label">Email</span><span className="value">{email}</span></div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'preferences' && (
          <>
            <div className="card-section">
              <h2 className="section-title-inline">Jeux <button aria-label="Modifier jeux" className="icon-edit-inline" onClick={() => { if (editing.games) resetSection('games'); else setEditing(prev => ({ ...prev, games: true })); }}><Edit3 size={14} /></button></h2>
              {editing.games ? (
                <div className="edit-block">
                  <div className="form-row">
                    <div className="options-grid">
                      {GAMES_LIST.map(g => (
                        <button key={g.id} type="button" className={`option-card ${games.includes(g.id) ? 'selected' : ''}`} onClick={() => toggleSelection(g.id, games, setGames)}>{g.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="section-controls">
                    <button className="btn-small btnPrimary" onClick={() => saveProfilePartial({ games: true })} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  </div>
                </div>
              ) : (
                <div className="read-block">
                  <div className="row">
                    <div className="chips">{gamesLabels.map((g, i) => <span key={i} className="chip">{g}</span>)}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-section">
              <h2 className="section-title-inline">Disponibilités <button aria-label="Modifier disponibilités" className="icon-edit-inline" onClick={() => { if (editing.schedules) resetSection('schedules'); else setEditing(prev => ({ ...prev, schedules: true })); }}><Edit3 size={14} /></button></h2>
              {editing.schedules ? (
                <div className="edit-block">
                  <div className="form-row">
                    <div className="options-grid">
                      {SCHEDULES_LIST.map(s => (
                        <button key={s.id} type="button" className={`option-card ${schedules.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleSelection(s.id, schedules, setSchedules)}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="section-controls">
                    <button className="btn-small btnPrimary" onClick={() => saveProfilePartial({ schedules: true })} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  </div>
                </div>
              ) : (
                <div className="read-block">
                  <div className="row">
                    <div className="chips">{schedulesLabels.map((s, i) => <span key={i} className="chip">{s}</span>)}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-section">
              <h2 className="section-title-inline">Style de jeu <button aria-label="Modifier style de jeu" className="icon-edit-inline" onClick={() => { if (editing.style) resetSection('style'); else setEditing(prev => ({ ...prev, style: true })); }}><Edit3 size={14} /></button></h2>
              {editing.style ? (
                <div className="edit-block">
                  <div className="form-row">
                    <div className="options-grid single-row">
                      {PLAYSTYLES_LIST.map(p => (
                        <button key={p.id} type="button" className={`option-card ${playStyle === p.id ? 'selected' : ''}`} onClick={() => setPlayStyle(p.id)}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="section-controls">
                    <button className="btn-small btnPrimary" onClick={() => saveProfilePartial({ style: true })} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  </div>
                </div>
              ) : (
                <div className="read-block">
                  <div className="row">
                    <span className="value">{playStyleLabel}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'securite' && (
          <>
            <div className="card-section">
              <h2 className="section-title-inline">Mot de passe</h2>
              <div className="security-block">
                <p className="muted">Vous pouvez mettre à jour votre mot de passe à tout moment.</p>
                <div className="section-controls security-controls-default">
                  <button className="btn-small btnPrimary" onClick={() => { setPwdState({ current: '', next: '', confirm: '' }); setPwdNotice(null); setShowPasswordModal(true); }}>Modifier le mot de passe</button>
                </div>
              </div>
            </div>
            <div className="card-section delete-section">
              <h2 className="section-title-inline">Suppression du compte</h2>
              <div className="security-block">
                <p className="muted">La suppression est irréversible : toutes vos données seront effacées.</p>
                <div className="section-controls delete-controls">
                  <button className="delete-btn" onClick={handleDeleteClick}><Trash2 size={14} />&nbsp;Supprimer mon compte</button>
                </div>
              </div>
            </div>
          </>
        )}
        {notice && <div className={`notice ${noticeType}`}>{notice}</div>}
      </div>
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Déconnexion</h3>
            <p className="modal-text">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="modal-actions">
              <button className="btn-small btnSecondary" onClick={() => setShowLogoutModal(false)}>Annuler</button>
              <button className="btn-small btnPrimary" onClick={confirmLogout}>Se déconnecter</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-card-delete">
            <div className="delete-modal-header">
              <AlertTriangle size={24} />
              <h3 className="modal-title">Supprimer le compte</h3>
            </div>
            <p className="modal-text">
              Cette action est <strong className="text-red-400">irréversible</strong>. Tous vos matchs, messages et préférences seront définitivement effacés.
            </p>
            <div className="form-row modal-form-row">
              <label className="modal-label-input">Pour confirmer, entrez votre mot de passe :</label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="modal-input-password"
                autoFocus
              />
              {deleteError && <span className="modal-error-message">{deleteError}</span>}
            </div>
            <div className="modal-actions">
              <button className="btn-small btnSecondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Annuler</button>
              <button className="delete-btn delete-btn-confirm" onClick={confirmDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Modifier le mot de passe</h3>
            <div className="modal-form">
              <div className="form-row">
                <label>Mot de passe actuel</label>
                <input type="password" value={pwdState.current} onChange={e => setPwdState(prev => ({ ...prev, current: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Nouveau mot de passe</label>
                <input type="password" value={pwdState.next} onChange={e => setPwdState(prev => ({ ...prev, next: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Confirmer le nouveau mot de passe</label>
                <input type="password" value={pwdState.confirm} onChange={e => setPwdState(prev => ({ ...prev, confirm: e.target.value }))} />
              </div>
              {pwdNotice && <div className={`modal-notice ${pwdNotice.type}`}>{pwdNotice.msg}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn-small btnSecondary" onClick={() => setShowPasswordModal(false)} disabled={pwdLoading}>Annuler</button>
              <button className="btn-small btnPrimary" onClick={changePassword} disabled={pwdLoading}>{pwdLoading ? 'Modification...' : 'Valider'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;