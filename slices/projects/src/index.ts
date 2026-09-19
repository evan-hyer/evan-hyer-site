import('./bootstrap').catch(() => {
  const root = document.getElementById('app')!;
  root.innerHTML =
    '<main id="main" style="padding:48px;font:18px/1.6 Arial,sans-serif"><h1>Unable to start this page</h1><p>Please retry loading the application and its configuration.</p><button type="button" style="padding:12px 20px">Try again</button></main>';
  root
    .querySelector('button')!
    .addEventListener('click', () => location.reload());
});
