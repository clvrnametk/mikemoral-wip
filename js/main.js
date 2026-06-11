/* =============================================
   main.js — Option 1: Editorial Utility
============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Notes filter buttons (visual toggle only) ──────────── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Footer LinkedIn: open in new tab ───────────────────── */
  document.querySelectorAll('a[href*="linkedin.com"]').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

});
