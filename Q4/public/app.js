document.addEventListener('click', async (e) => {
  const a = e.target.closest('a[data-delete]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  const ok = confirm('Delete this employee?');
  if (!ok) return;
  try {
    // Prefer POST fallback endpoint if available
    const postUrl = href.endsWith('/delete') ? href : href + '/delete';
    const res = await fetch(postUrl, { method: 'POST', headers: { 'X-Requested-With': 'fetch' } });
    if (res.redirected) {
      window.location.href = res.url;
      return;
    }
    // If not redirected, just reload list
    window.location.reload();
  } catch (err) {
    console.error('Delete failed', err);
    alert('Delete failed');
  }
});
