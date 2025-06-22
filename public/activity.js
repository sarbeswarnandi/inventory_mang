const list = document.getElementById('activityList');

async function loadActivities() {
  const res = await fetch('/api/activities');
  const logs = await res.json();

  list.innerHTML = logs.length
    ? logs.map(a => `
        <li>
          <div><strong>${a.action}</strong> — ${new Date(a.timestamp).toLocaleString()}</div>
          <div>${a.details}</div>
        </li>
      `).join('')
    : '<li>No activities recorded.</li>';
}

loadActivities();
