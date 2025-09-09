(() => {
  function el(selector, root = document) {
    return root.querySelector(selector);
  }
  function els(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function encodeQuery(q) {
    return encodeURIComponent(q).replace(/%20/g, '+');
  }

  async function searchIssue(repo, reqId, specUrl) {
    // Prefer title match; fall back to body anchor match
    const queries = [
      `repo:${repo} is:issue in:title "${reqId}"`,
      `repo:${repo} is:issue in:body "${specUrl}"`
    ];
    for (const q of queries) {
      try {
        const r = await fetch(`https://api.github.com/search/issues?q=${encodeQuery(q)}`);
        if (!r.ok) continue;
        const data = await r.json();
        if (data && data.items && data.items.length) {
          // Pick best exact match first
          const exact = data.items.find(it => new RegExp(`(^|\\W)${reqId}(\\W|$)`, 'i').test(it.title));
          return exact || data.items[0];
        }
      } catch (e) {
        // swallow; non-fatal, fallback to create
      }
    }
    return null;
  }

  async function reopenIssue(repo, number, token) {
    const url = `https://api.github.com/repos/${repo}/issues/${number}`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state: 'open' })
    });
    if (!r.ok) throw new Error(`GitHub API error: ${r.status}`);
    return r.json();
  }

  function setupCard(card) {
    const repo = card.dataset.repo;
    const reqId = card.dataset.reqid;
    const specUrl = card.dataset.specurl || location.origin + card.dataset.specurl;
    const issueBtn = el('.js-req-issue-btn', card);
    const reopenBtn = el('.js-req-reopen-btn', card);

    if (!issueBtn) return;

    // Default behavior: create new issue link
    const newUrl = issueBtn.getAttribute('data-new-url');
    issueBtn.href = newUrl;

    // Progressive enhancement: detect existing issue
    searchIssue(repo, reqId, specUrl).then(found => {
      if (!found) {
        issueBtn.textContent = 'Create issue';
        issueBtn.href = newUrl;
        return;
      }
      const isClosed = found.state === 'closed';
      issueBtn.href = found.html_url;
      issueBtn.textContent = isClosed ? 'View closed issue' : 'Open issue';
      if (isClosed && reopenBtn) {
        reopenBtn.style.display = '';
        reopenBtn.onclick = async () => {
          const key = 'sr3e_gh_token';
          let token = localStorage.getItem(key) || '';
          if (!token) {
            token = window.prompt('Enter a GitHub Personal Access Token with repo scope to reopen issues (stored in your browser).');
            if (!token) return;
            localStorage.setItem(key, token);
          }
          reopenBtn.disabled = true;
          reopenBtn.textContent = 'Reopening…';
          try {
            await reopenIssue(repo, found.number, token);
            issueBtn.textContent = 'Open issue';
            reopenBtn.style.display = 'none';
          } catch (e) {
            alert('Failed to reopen issue. You may not have permissions or the token lacks scope.');
          } finally {
            reopenBtn.disabled = false;
            reopenBtn.textContent = 'Reopen issue';
          }
        };
      }
    }).catch(() => {
      // ignore
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    els('.req-card').forEach(setupCard);
  });
})();
