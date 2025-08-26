document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('jokeBtn');
  const out = document.getElementById('jokeText');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Loading...';
    try {
      const res = await fetch('https://api.chucknorris.io/jokes/random');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      out.textContent = data.value || 'No joke received';
    } catch (e) {
      out.textContent = 'Failed to fetch joke';
      console.error(e);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get Joke';
    }
  });
});
