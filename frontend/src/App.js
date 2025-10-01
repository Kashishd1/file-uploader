// frontend/src/App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [input1, setInput1] = useState(null);
  const [input2, setInput2] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [dark, setDark] = useState(false);

  const BACKEND = 'http://127.0.0.1:8000/api'; // change if your backend is on another host

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input1 || !input2) {
      alert('Please choose both files.');
      return;
    }
    setProcessing(true);
    setDownloadUrl('');

    const fd = new FormData();
    fd.append('input1', input1);
    fd.append('input2', input2);

    try {
      const res = await fetch(`${BACKEND}/submit/`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'Unknown error'}));
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      setDownloadUrl(data.download_url);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    // download as blob to force save-as
    const res = await fetch(downloadUrl);
    if (!res.ok) { alert('Download failed'); return; }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <header className="header">
        <h1>File Processor — Growdea Demo</h1>
        <div className="toggle-row">
          <label className="mode-toggle">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark(!dark)}
            />
            <span>{dark ? 'Dark' : 'Light'} mode</span>
          </label>
        </div>
      </header>

      <main className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="file-row">
            <label className="file-box">
              <span className="label-title">Input 1</span>
              <input type="file" accept=".txt" onChange={e => setInput1(e.target.files[0])} />
              <div className="filename">{input1 ? input1.name : 'No file chosen'}</div>
            </label>

            <label className="file-box">
              <span className="label-title">Input 2</span>
              <input type="file" accept=".txt" onChange={e => setInput2(e.target.files[0])} />
              <div className="filename">{input2 ? input2.name : 'No file chosen'}</div>
            </label>
          </div>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={processing}>
              {processing ? 'Processing...' : 'Submit'}
            </button>
            <button className="btn outline" type="button" onClick={handleDownload} disabled={!downloadUrl}>
              Download
            </button>
          </div>

          {processing && <p className="hint">Simulating backend processing — please wait ~5s...</p>}
          {!processing && downloadUrl && <p className="success">Done — download ready.</p>}
        </form>
      </main>

      <footer className="footer">Growdea Technologies — Task demo</footer>
    </div>
  );
}

export default App;
