import React from 'react';

export default function Page({ searchParams }) {
  const email = searchParams?.email || '';

  return (
    <main
      style={{
        fontFamily: 'system-ui,Segoe UI,Roboto',
        padding: 24,
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 'bold' }}>We Will Miss You!</h1>
      <p style={{ marginBottom: 12 }}>
        You&apos;ve successfully unsubscribed {email ? <strong>{email}</strong> : ''} from
        ShareSkippy email notifications. We&apos;re sorry to see you go!
      </p>
      <p>
        If you think this was a mistake or still need help, contact{' '}
        <a
          href="mailto:support@shareskippy.com"
          style={{ color: '#007bff', textDecoration: 'underline' }}
        >
          support@shareskippy.com
        </a>
        .
      </p>
    </main>
  );
}
