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

// === STORIES RENDERING ===
const defaultStories = [
  {
    title: "The 1% Rule",
    content: "James was 40kg overweight and couldn’t run 100m. He started walking 10 minutes daily. Just 10. After 1 year, he ran his first 5K. Small steps compound. 1% better every day is 37x better in a year.",
    author: "Inspired by Atomic Habits"
  },
  {
    title: "Rejected 12 Times",
    content: "Priya applied to TELUS 12 times over 2 years. Every rejection came with feedback. She used it. On the 13th try, she got hired as Team Lead. Rejection is redirection when you learn from it.",
    author: "Community Story"
  },
  {
    title: "The Night Shift Promise",
    content: "Ravi worked night shifts to fund his sister’s education. Sleep-deprived but never hopeless. Today, she’s a doctor and he runs his own logistics firm. Sacrifice today is someone’s future tomorrow.",
    author: "Submitted by readers"
  }
];

function loadStories() {
  const userStories = JSON.parse(localStorage.getItem('userStories') || '[]');
  const allStories = [...defaultStories,...userStories];
  const container = document.getElementById('stories');
  container.innerHTML = '';

  allStories.forEach(story => {
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

// === SUBMIT STORY FORM ===
document.getElementById('storyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('storyTitle').value.trim();
  const content = document.getElementById('storyContent').value.trim();
  const author = document.getElementById('storyAuthor').value.trim();

  if (title && content && author) {
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]');
    userStories.unshift({ title, content, author });
    localStorage.setItem('userStories', JSON.stringify(userStories));
    loadStories();
    e.target.reset();
    showToast('Story published! You just inspired someone.');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
});

// === EMAIL CAPTURE ===
document.getElementById('emailForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('emailInput').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(email)) {
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');
    if (!emails.includes(email)) {
      emails.push(email);
      localStorage.setItem('emails', JSON.stringify(emails));
    }
    e.target.reset();
    showToast('Subscribed! Check your inbox Monday.');
  } else {
    showToast('Please enter a valid email.', true);
  }
});

// Init
loadStories();
