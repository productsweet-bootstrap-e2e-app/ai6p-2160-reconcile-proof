import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import {
  confirmSignUp,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import {
  createNoteMutation,
  listNotesQuery,
  type Note,
} from './graphql';

// AI6P-280 Sacrificial Hello World — authenticated CRUD vertical slice over a single
// Note entity. Sign in (Cognito user pool), create a
// note, list this org's Notes.
// Bootstrapped by Product Sweet (AI6P-1611 webapp starter).

const client = generateClient();

type Mode = 'signIn' | 'signUp' | 'confirm';

function AuthGate({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wrap = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="ps-auth">
      <h2>Sign in</h2>
      {error && <p role="alert">{error}</p>}
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      </label>
      {mode !== 'confirm' && (
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </label>
      )}
      {mode === 'confirm' && (
        <label>
          Confirmation code
          <input value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
      )}
      {mode === 'signIn' && (
        <button
          className="ps-btn"
          onClick={() =>
            wrap(async () => {
              await signIn({ username: email, password });
              onSignedIn();
            })
          }
        >
          Sign in
        </button>
      )}
      {mode === 'signUp' && (
        <button
          className="ps-btn"
          onClick={() =>
            wrap(async () => {
              await signUp({ username: email, password });
              setMode('confirm');
            })
          }
        >
          Create account
        </button>
      )}
      {mode === 'confirm' && (
        <button
          className="ps-btn"
          onClick={() =>
            wrap(async () => {
              await confirmSignUp({ username: email, confirmationCode: code });
              setMode('signIn');
            })
          }
        >
          Confirm
        </button>
      )}
      <p>
        <button
          className="ps-btn-link"
          onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        >
          {mode === 'signIn' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </p>
    </section>
  );
}

function NoteList() {
  const [items, setItems] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await client.graphql({ query: listNotesQuery });
      const data = 'data' in res ? res.data : undefined;
      setItems(data?.listNotes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = async () => {
    if (!title.trim()) return;
    setError(null);
    try {
      await client.graphql({
        query: createNoteMutation,
        variables: { title: title.trim() },
      });
      setTitle('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="ps-entities">
      <h2>Notes</h2>
      {error && <p role="alert">{error}</p>}
      <label>
        New note
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <button className="ps-btn" onClick={create}>Add note</button>
      <ul className="ps-list">
        {items.map((item) => (
          <li key={item.id}>
            {item.title} <small>({item.createdAt})</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const check = useCallback(async () => {
    try {
      await getCurrentUser();
      setSignedIn(true);
    } catch {
      setSignedIn(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  if (!ready) return <main className="ps-app">Loading…</main>;

  return (
    <main className="ps-app">
      <h1>AI6P-280 Sacrificial Hello World</h1>
      {signedIn ? (
        <>
          <button
            className="ps-btn"
            onClick={async () => {
              await signOut();
              setSignedIn(false);
            }}
          >
            Sign out
          </button>
          <NoteList />
        </>
      ) : (
        <AuthGate onSignedIn={() => setSignedIn(true)} />
      )}
    </main>
  );
}
