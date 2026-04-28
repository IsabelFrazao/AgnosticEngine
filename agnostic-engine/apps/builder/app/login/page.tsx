export default function LoginPage() {
  return (
    <main>
      <h1>Builder Login</h1>
      <p className="muted">M5 scaffold auth boundary for protected builder routes.</p>
      <div className="card" style={{ maxWidth: 420 }}>
        <form method="post" action="/api/auth/login">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" className="input" defaultValue="builder" />
          <div style={{ height: 12 }} />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" defaultValue="builder" />
          <div style={{ height: 16 }} />
          <button className="btn" type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}
