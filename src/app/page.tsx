'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('/madeinproject.html')
      .then(res => res.text())
      .then(content => setHtml(content))
      .catch(err => console.error('Erreur chargement HTML:', err));
  }, []);

  if (!html) return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
