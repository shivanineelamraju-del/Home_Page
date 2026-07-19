/* =====================================================
   ACM-W BPHC — Contact Us page behavior
   Handles responsive mobile nav, interactive terminal,
   and fluid light/dark mode theme transitions.
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------
     THEME TOGGLE
     --------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  
  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  
  function setTheme(theme){
    // Add a temporary class to the terminal to handle smooth color transitions
    const terminal = document.querySelector('.contact-terminal');
    if (terminal) {
      terminal.style.transition = 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease';
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('acmw-theme', theme);
    
    if(themeToggle){
      themeToggle.setAttribute('aria-pressed', theme === 'dark');
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  
  if(themeToggle){
    // Set initial theme state based on local storage or system preference
    setTheme(currentTheme());
    
    themeToggle.addEventListener('click', () => {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------------------------------------------------
     MOBILE NAV TOGGLE
     --------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------------------------------------------------
     DOMAINS DROPDOWN
     --------------------------------------------------- */
  const domainsBtn = document.getElementById('domainsBtn');
  const domainsPanel = document.getElementById('domainsPanel');
  if(domainsBtn && domainsPanel){
    domainsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = domainsPanel.classList.toggle('is-open');
      domainsBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if(!e.target.closest('.nav-dropdown')){
        domainsPanel.classList.remove('is-open');
        domainsBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------
     FOOTER YEAR
     --------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------
     TERMINAL HOVER HINTS
     --------------------------------------------------- */
  const hintText = document.getElementById('termHintText');
  const rows = document.querySelectorAll('.contact-row[data-hint]');
  const defaultHint = hintText ? hintText.textContent : '';
  
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      if(hintText) hintText.textContent = row.dataset.hint;
    });
    row.addEventListener('mouseleave', () => {
      if(hintText) hintText.textContent = defaultHint;
    });
  });

  /* ---------------------------------------------------
     CLICK-TO-COPY EMAIL ADDRESS
     --------------------------------------------------- */
  const emailRow = document.getElementById('emailRow');
  const emailArrow = document.getElementById('emailArrow');
  if(emailRow){
    emailRow.addEventListener('click', async (e) => {
      const email = emailRow.dataset.email;
      if(!email || !navigator.clipboard) return; // fall back to standard mailto if clipboard isn't available
      e.preventDefault();
      try{
        await navigator.clipboard.writeText(email);
        emailRow.classList.add('is-copied');
        if(emailArrow) emailArrow.textContent = 'copied';
        if(hintText) hintText.textContent = 'email address copied to clipboard';
        setTimeout(() => {
          emailRow.classList.remove('is-copied');
          if(emailArrow) emailArrow.textContent = '↗';
        }, 2200);
      }catch(err){
        window.location.href = `mailto:${email}`;
      }
    });
  }
});
