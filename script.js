// DOM Elements
const body = document.getElementById('body');
const skillForm = document.getElementById('skillForm');
const newSkillInput = document.getElementById('newSkill');
const newSkillCategory = document.getElementById('newSkillCategory');
const skillList = document.getElementById('skillList');
const categoryFilter = document.getElementById('categoryFilter');
const statsModal = document.getElementById('statsModal');
const themeMenu = document.getElementById('themeMenu');
const weeklyStats = document.getElementById('weeklyStats');
const darkModeText = document.getElementById('darkModeText');
const chartCanvas = document.getElementById('progressChart');

let skills = JSON.parse(localStorage.getItem('skills')) || [];
let chart;

// Add skill
skillForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const skillName = newSkillInput.value.trim();
  const category = newSkillCategory.value;

  if (skillName !== '') {
    const skill = {
      name: skillName,
      category,
      date: new Date().toLocaleDateString(),
    };
    skills.push(skill);
    saveSkills();
    renderSkills();
    newSkillInput.value = '';
    newSkillCategory.value = '';
  }
});

// Save to localStorage
function saveSkills() {
  localStorage.setItem('skills', JSON.stringify(skills));
}

// Render skills
function renderSkills() {
  skillList.innerHTML = '';
  const filter = categoryFilter.value;
  const filteredSkills = filter ? skills.filter(s => s.category === filter) : skills;

  filteredSkills.forEach((skill, index) => {
    const li = document.createElement('li');
    li.className = 'bg-indigo-100 text-indigo-900 p-3 rounded-md flex justify-between items-center';
    li.innerHTML = `<span>${skill.name} (${skill.category || 'No Category'})</span>
                    <button onclick="deleteSkill(${index})" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>`;
    skillList.appendChild(li);
  });
  updateChart();
}

// Delete skill
function deleteSkill(index) {
  skills.splice(index, 1);
  saveSkills();
  renderSkills();
}

// Reset progress
function resetProgress() {
  if (confirm("Are you sure you want to reset today's progress?")) {
    skills = [];
    saveSkills();
    renderSkills();
  }
}

// Filter skills by category
categoryFilter.addEventListener('change', renderSkills);

// Show stats modal
function showStats() {
  statsModal.classList.add('show');
  weeklyStats.innerHTML = '';
  const stats = {};

  skills.forEach(s => {
    stats[s.date] = (stats[s.date] || 0) + 1;
  });

  for (const date in stats) {
    const li = document.createElement('li');
    li.textContent = `${date}: ${stats[date]} skill(s)`;
    weeklyStats.appendChild(li);
  }
}

function closeStats() {
  statsModal.classList.remove('show');
}

// Theme functions
function toggleDarkMode() {
  body.classList.toggle('dark-mode');
  darkModeText.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}

function toggleThemeMenu() {
  themeMenu.classList.add('show');
}

function closeThemeMenu() {
  themeMenu.classList.remove('show');
}

function setTheme(theme) {
  body.className = '';
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    darkModeText.textContent = 'Light Mode';
  } else if (theme === 'blue') {
    body.classList.add('blue-theme');
  } else if (theme === 'green') {
    body.classList.add('green-theme');
  }
  closeThemeMenu();
}

// Chart.js - Weekly progress bar chart
function updateChart() {
  if (chart) chart.destroy();
  const countByDate = {};
  skills.forEach(skill => {
    countByDate[skill.date] = (countByDate[skill.date] || 0) + 1;
  });
  const labels = Object.keys(countByDate);
  const data = Object.values(countByDate);

  chart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Skills per Day',
        data,
        backgroundColor: '#6366F1',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
    },
  });
}

// Export to PDF
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Skill Tracker Report', 10, 10);
  skills.forEach((s, i) => {
    doc.text(`${i + 1}. ${s.name} (${s.category || 'No Category'}) - ${s.date}`, 10, 20 + i * 10);
  });
  doc.save('skills.pdf');
}

// Export to Excel
function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(skills);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Skills');
  XLSX.writeFile(wb, 'skills.xlsx');
}

// Initial render
renderSkills();
