// localStorage'dan proje verilerini okuyan fonksiyon
function readProjects() {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : {};
}

// localStorage'a proje verilerini yazan fonksiyon
function writeProjects(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// ai nesnesini ve proje metodlarını tanımla
const ai = {
  proje: {
      // Mevcut proje listesini gösteren fonksiyon
      list() {
          const projects = readProjects();
          console.log("Mevcut Projeler:");
          Object.keys(projects).forEach(category => {
              console.log(`Kategori: ${category}`);
              projects[category].forEach((project, index) => {
                  let statusIcon = '';
                  if (project.status === 'completed') statusIcon = '#✅';
                  else if (project.status === 'uncompleted') statusIcon = '#🟰';
                  else if (project.status === 'give up') statusIcon = '#❌';
                  console.log(`${index + 1}. ${project.name} ${statusIcon}`);
              });
          });
      },

      // Yeni proje ekleyen fonksiyon
      add_project(category, difficulty, projectName, ...details) {
          const projects = readProjects();
          if (!projects[category]) {
              projects[category] = [];
          }
          projects[category].push({
              name: projectName,
              difficulty: difficulty,
              details: details.join(' '),
              status: 'uncompleted'
          });
          writeProjects(projects);
          console.log(`Proje eklendi: ${projectName}`);
      },

      // Proje durumunu güncelleyen fonksiyon
      update(category, projectNumber, status) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              projects[category][projectNumber - 1].status = status;
              writeProjects(projects);
              console.log(`Proje durumu güncellendi: ${projects[category][projectNumber - 1].name}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Proje silen fonksiyon
      delete(category, projectNumber) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              const deletedProject = projects[category].splice(projectNumber - 1, 1);
              writeProjects(projects);
              console.log(`Proje silindi: ${deletedProject[0].name}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Proje detaylarını gösteren fonksiyon
      show_details(category, projectNumber) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              const project = projects[category][projectNumber - 1];
              console.log(`Proje Adı: ${project.name}`);
              console.log(`Zorluk: ${project.difficulty}`);
              console.log(`Detaylar: ${project.details}`);
              console.log(`Durum: ${project.status}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Proje detaylarını güncelleyen fonksiyon
      update_details(category, projectNumber, newDetails) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              projects[category][projectNumber - 1].details = newDetails;
              writeProjects(projects);
              console.log(`Proje detayları güncellendi: ${projects[category][projectNumber - 1].name}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Projeleri durumlarına göre filtreleyen fonksiyon
      filter_by_status(status) {
          const projects = readProjects();
          console.log(`Durumu "${status}" olan projeler:`);
          Object.keys(projects).forEach(category => {
              projects[category].forEach(project => {
                  if (project.status === status) {
                      console.log(`Kategori: ${category}, Proje: ${project.name}`);
                  }
              });
          });
      },

      // Projeleri kategoriye göre filtreleyen fonksiyon
      filter_by_category(category) {
          const projects = readProjects();
          if (projects[category]) {
              console.log(`Kategori: ${category}`);
              projects[category].forEach((project, index) => {
                  console.log(`${index + 1}. ${project.name}`);
              });
          } else {
              console.log("Kategori bulunamadı.");
          }
      },

      // Projeleri zorluk seviyesine göre sıralayan fonksiyon
      sort_by_difficulty(order) {
          const projects = readProjects();
          Object.keys(projects).forEach(category => {
              projects[category].sort((a, b) => {
                  if (order === 'asc') {
                      return a.difficulty.localeCompare(b.difficulty);
                  } else {
                      return b.difficulty.localeCompare(a.difficulty);
                  }
              });
          });
          writeProjects(projects);
          console.log("Projeler zorluk seviyesine göre sıralandı.");
      },

      // Yeni kategori ekleyen fonksiyon
      add_category(categoryName) {
          const projects = readProjects();
          if (!projects[categoryName]) {
              projects[categoryName] = [];
              writeProjects(projects);
              console.log(`Kategori eklendi: ${categoryName}`);
          } else {
              console.log("Kategori zaten mevcut.");
          }
      },

      // Kategori silen fonksiyon
      delete_category(categoryName) {
          const projects = readProjects();
          if (projects[categoryName]) {
              delete projects[categoryName];
              writeProjects(projects);
              console.log(`Kategori silindi: ${categoryName}`);
          } else {
              console.log("Kategori bulunamadı.");
          }
      },

      // Proje adını değiştiren fonksiyon
      rename(category, projectNumber, newName) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              projects[category][projectNumber - 1].name = newName;
              writeProjects(projects);
              console.log(`Proje adı güncellendi: ${newName}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Proje istatistiklerini gösteren fonksiyon
      get_stats() {
          const projects = readProjects();
          let completed = 0, uncompleted = 0, giveUp = 0;
          Object.keys(projects).forEach(category => {
              projects[category].forEach(project => {
                  if (project.status === 'completed') completed++;
                  else if (project.status === 'uncompleted') uncompleted++;
                  else if (project.status === 'give up') giveUp++;
              });
          });
          console.log(`Tamamlanan Projeler: ${completed}`);
          console.log(`Tamamlanmayan Projeler: ${uncompleted}`);
          console.log(`Vazgeçilen Projeler: ${giveUp}`);
      },

      // Projeye not ekleyen fonksiyon
      add_note(category, projectNumber, note) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              if (!projects[category][projectNumber - 1].notes) {
                  projects[category][projectNumber - 1].notes = [];
              }
              projects[category][projectNumber - 1].notes.push(note);
              writeProjects(projects);
              console.log(`Not eklendi: ${note}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Projeden not silen fonksiyon
      remove_note(category, projectNumber) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              projects[category][projectNumber - 1].notes = [];
              writeProjects(projects);
              console.log("Notlar silindi.");
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Projeye etiket ekleyen fonksiyon
      add_tags(category, projectNumber, tags) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              if (!projects[category][projectNumber - 1].tags) {
                  projects[category][projectNumber - 1].tags = [];
              }
              projects[category][projectNumber - 1].tags.push(...tags);
              writeProjects(projects);
              console.log(`Etiketler eklendi: ${tags.join(', ')}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Projeden etiket kaldıran fonksiyon
      remove_tags(category, projectNumber, tags) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              projects[category][projectNumber - 1].tags = projects[category][projectNumber - 1].tags.filter(tag => !tags.includes(tag));
              writeProjects(projects);
              console.log(`Etiketler kaldırıldı: ${tags.join(', ')}`);
          } else {
              console.log("Proje bulunamadı.");
          }
      },

      // Proje notlarını gösteren fonksiyon
      view_notes(category, projectNumber) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1] && projects[category][projectNumber - 1].notes) {
              console.log(`Proje Notları: ${projects[category][projectNumber - 1].notes.join(', ')}`);
          } else {
              console.log("Not bulunamadı.");
          }
      },

      // Proje özetini gösteren fonksiyon
      get_project_summary(category, projectNumber) {
          const projects = readProjects();
          if (projects[category] && projects[category][projectNumber - 1]) {
              const project = projects[category][projectNumber - 1];
              console.log(`Proje Adı: ${project.name}`);
              console.log(`Zorluk: ${project.difficulty}`);
              console.log(`Detaylar: ${project.details}`);
              console.log(`Durum: ${project.status}`);
              if (project.notes) {
                  console.log(`Notlar: ${project.notes.join(', ')}`);
              }
              if (project.tags) {
                  console.log(`Etiketler: ${project.tags.join(', ')}`);
              }
          } else {
              console.log("Proje bulunamadı.");
          }
      }
  }
};

// Tarayıcı konsolunda kullanım için ai nesnesini global yap
window.ai = ai;

// Konsoldan komutları çalıştırmak için örnek
// ai.proje.list();
// ai.proje.add_project("Web Development", "Medium", "Portfolio Website", "Create a personal portfolio website using React.");
// ai.proje.update("Web Development", 1, "completed");
// ai.proje.delete("Web Development", 1);
// ai.proje.show_details("Web Development", 1);
// ai.proje.update_details("Web Development", 1, "Updated details for the portfolio website.");
// ai.proje.filter_by_status("completed");
// ai.proje.filter_by_category("Web Development");
// ai.proje.sort_by_difficulty("asc");
// ai.proje.add_category("Mobile Development");
// ai.proje.delete_category("Mobile Development");
// ai.proje.rename("Web Development", 1, "New Portfolio Website");
// ai.proje.get_stats();
// ai.proje.add_note("Web Development", 1, "Need to add a blog section.");
// ai.proje.remove_note("Web Development", 1);
// ai.proje.add_tags("Web Development", 1, ["priority", "long-term"]);
// ai.proje.remove_tags("Web Development", 1, ["priority"]);
// ai.proje.view_notes("Web Development", 1);
// ai.proje.get_project_summary("Web Development", 1);