// === THEME TOGGLE ===
const toggle = document.getElementById('themeToggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
  body.setAttribute('data-theme', 'light');
  toggle.textContent = '☀️ Light';
}

toggle.addEventListener('click', () => {
  if (body.getAttribute('data-theme') === 'light') {
    body.removeAttribute('data-theme');
    toggle.textContent = '🌙 Dark';
    localStorage.setItem('theme', 'dark');
  } else {
    body.setAttribute('data-theme', 'light');
    toggle.textContent = '☀️ Light';
    localStorage.setItem('theme', 'light');
  }
});

// === TOAST NOTIFICATION ===
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = isError? 'toast error show' : 'toast show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === QUOTE OF THE DAY ===
const quotes = [
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "Discipline is choosing between what you want now and what you want most. — Abraham Lincoln",
  "Fall seven times, stand up eight. — Japanese Proverb",
  "The only limit to our realization of tomorrow is our doubts of today. — FDR",
  "Doubt kills more dreams than failure ever will. — Suzy Kassem",
  "It always seems impossible until it's done. — Nelson Mandela",
  "Your speed doesn't matter. Forward is forward. — Unknown"
];
const dayIndex = new Date().getDate() % quotes.length;
document.getElementById('quoteText').textContent = quotes[dayIndex];

// === STORIES FROM API ===
async function loadStories() {
  try {
    const res = await fetch('/api/stories');
    const stories = await res.json();
    const container = document.getElementById('stories');
    container.innerHTML = '';

    stories.forEach(story => {
      const card = document.createElement('article');
      card.className = 'story-card';
      card.innerHTML = `
        <h3>${story.title}</h3>
        <p>${story.content}</p>
        <div class="author">— ${story.author}</div>
      `;
      container.appendChild(card);
    });
    animateCards();
  } catch (err) {
    showToast('Failed to load stories', true);
  }
}

function animateCards() {
  const cards = document.querySelectorAll('.story-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  cards.forEach(card => observer.observe(card));
}

// === SUBMIT STORY TO API ===
document.getElementById('storyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('storyTitle').value.trim();
  const content = document.getElementById('storyContent').value.trim();
  const author = document.getElementById('storyAuthor').value.trim();

  try {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author })
    });

    if (!res.ok) throw new Error('Failed');

    e.target.reset();
    showToast('Story published! You just inspired someone.');
    loadStories();
    window.scrollTo({ top: 400, behavior: 'smooth' });
  } catch (err) {
    showToast('Error publishing story', true);
  }
});

// === EMAIL SUBSCRIBE TO API ===
document.getElementById('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailInput').value.trim();

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.status === 409) {
      showToast('Already subscribed!', true);
    } else if (!res.ok) {
      throw new Error(data.error);
    } else {
      e.target.reset();
      showToast('Subscribed! Check your inbox Monday.');
    }
  } catch (err) {
    showToast('Please enter a valid email.', true);
  }
});

// Init
loadStories();
