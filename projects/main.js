// Proje verilerini tutacak nesne
let projects = {};

// 

// projects.json dosyasını yükleme fonksiyonu
function loadProjects() {
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            projects = data;
            console.log('Projeler başarıyla yüklendi.');
        })
        .catch(error => console.error('Projeler yüklenirken hata oluştu:', error));
}

// projects.json dosyasını güncelleme fonksiyonu
function saveProjects() {
    fetch('projects.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projects),
    })
    .then(response => response.json())
    .then(data => console.log('Projeler güncellendi:', data))
    .catch(error => console.error('Projeler güncellenirken hata oluştu:', error));
}

// ai nesnesi ve fonksiyonları
const ai = {
    // Mevcut proje listesini mesaj olarak yazdırır
    proje: {
        list: function() {
            console.log("Mevcut Proje Listesi:");
            for (const category in projects) {
                console.log(`Kategori: ${category}`);
                projects[category].forEach((project, index) => {
                    let status = project.completed ? "✅" : project.giveUp ? "❌" : "#🟰";
                    console.log(`${index + 1}. ${project.projectname} ${status}`);
                });
            }
        },

        // Yeni proje ekler
        add_project: function(category, difficulty, projectname, details) {
            if (!projects[category]) {
                projects[category] = [];
            }
            projects[category].push({
                difficulty: difficulty,
                projectname: projectname,
                details: details,
                completed: false,
                giveUp: false
            });
            saveProjects();
            console.log(`Yeni proje eklendi: ${projectname}`);
        },

        // Projeyi tamamlandı olarak işaretler
        update: function(category, projectNumber, status) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                let project = projects[category][projectNumber - 1];
                if (status === 'completed') {
                    project.completed = true;
                    project.giveUp = false;
                    console.log(`Proje tamamlandı olarak işaretlendi: ${project.projectname}`);
                } else if (status === 'uncompleted') {
                    project.completed = false;
                    project.giveUp = false;
                    console.log(`Proje tamamlanmadı olarak işaretlendi: ${project.projectname}`);
                } else if (status === 'give up') {
                    project.completed = false;
                    project.giveUp = true;
                    console.log(`Proje vazgeçildi olarak işaretlendi: ${project.projectname}`);
                }
                saveProjects();
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Projeyi siler
        delete: function(category, projectNumber) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                let deletedProject = projects[category].splice(projectNumber - 1, 1);
                saveProjects();
                console.log(`Proje silindi: ${deletedProject[0].projectname}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Proje detaylarını gösterir
        show_details: function(category, projectNumber) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                let project = projects[category][projectNumber - 1];
                console.log(`Proje Detayları: ${project.projectname}`);
                console.log(`Zorluk: ${project.difficulty}`);
                console.log(`Detaylar: ${project.details}`);
                console.log(`Durum: ${project.completed ? "✅ Tamamlandı" : project.giveUp ? "❌ Vazgeçildi" : "#🟰 Tamamlanmadı"}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Proje detaylarını günceller
        update_details: function(category, projectNumber, newDetails) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                projects[category][projectNumber - 1].details = newDetails;
                saveProjects();
                console.log(`Proje detayları güncellendi: ${projects[category][projectNumber - 1].projectname}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Projeleri durumlarına göre filtreler
        filter_by_status: function(status) {
            console.log(`Durumu "${status}" olan projeler:`);
            for (const category in projects) {
                projects[category].forEach((project, index) => {
                    if (
                        (status === 'tamamlanmadı' && !project.completed && !project.giveUp) ||
                        (status === 'tamamlandı' && project.completed) ||
                        (status === 'vazgeçildi' && project.giveUp)
                    ) {
                        console.log(`Kategori: ${category}, Proje: ${project.projectname}`);
                    }
                });
            }
        },

        // Kategoriye göre projeleri filtreler
        filter_by_category: function(category) {
            if (projects[category]) {
                console.log(`Kategori: ${category}`);
                projects[category].forEach((project, index) => {
                    let status = project.completed ? "✅" : project.giveUp ? "❌" : "#🟰";
                    console.log(`${index + 1}. ${project.projectname} ${status}`);
                });
            } else {
                console.log("Kategori bulunamadı.");
            }
        },

        // Zorluk seviyesine göre projeleri sıralar
        sort_by_difficulty: function(order = 'asc') {
            console.log(`Zorluk seviyesine göre sıralanmış projeler (${order === 'asc' ? 'Artan' : 'Azalan'}):`);
            let allProjects = [];
            for (const category in projects) {
                allProjects = allProjects.concat(projects[category].map(project => ({ ...project, category })));
            }
            allProjects.sort((a, b) => order === 'asc' ? a.difficulty - b.difficulty : b.difficulty - a.difficulty);
            allProjects.forEach((project, index) => {
                let status = project.completed ? "✅" : project.giveUp ? "❌" : "#🟰";
                console.log(`${index + 1}. Kategori: ${project.category}, Proje: ${project.projectname}, Zorluk: ${project.difficulty} ${status}`);
            });
        },

        // Yeni kategori ekler
        add_category: function(categoryName) {
            if (!projects[categoryName]) {
                projects[categoryName] = [];
                saveProjects();
                console.log(`Yeni kategori eklendi: ${categoryName}`);
            } else {
                console.log("Kategori zaten mevcut.");
            }
        },

        // Kategoriyi siler
        delete_category: function(categoryName) {
            if (projects[categoryName]) {
                delete projects[categoryName];
                saveProjects();
                console.log(`Kategori silindi: ${categoryName}`);
            } else {
                console.log("Kategori bulunamadı.");
            }
        },

        // Projenin adını değiştirir
        rename: function(category, projectNumber, newName) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                projects[category][projectNumber - 1].projectname = newName;
                saveProjects();
                console.log(`Proje adı güncellendi: ${newName}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Tüm projelerin istatistiklerini gösterir
        get_stats: function() {
            let completed = 0, uncompleted = 0, giveUp = 0;
            for (const category in projects) {
                projects[category].forEach(project => {
                    if (project.completed) completed++;
                    else if (project.giveUp) giveUp++;
                    else uncompleted++;
                });
            }
            console.log(`İstatistikler:`);
            console.log(`✅ Tamamlanan: ${completed}`);
            console.log(`#🟰 Tamamlanmayan: ${uncompleted}`);
            console.log(`❌ Vazgeçilen: ${giveUp}`);
        },

        // Projeye not ekler
        add_note: function(category, projectNumber, note) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                if (!projects[category][projectNumber - 1].notes) {
                    projects[category][projectNumber - 1].notes = [];
                }
                projects[category][projectNumber - 1].notes.push(note);
                saveProjects();
                console.log(`Not eklendi: ${note}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Projeden notu siler
        remove_note: function(category, projectNumber) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                delete projects[category][projectNumber - 1].notes;
                saveProjects();
                console.log("Notlar silindi.");
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Projeye etiketler ekler
        add_tags: function(category, projectNumber, tags) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                if (!projects[category][projectNumber - 1].tags) {
                    projects[category][projectNumber - 1].tags = [];
                }
                projects[category][projectNumber - 1].tags = tags;
                saveProjects();
                console.log(`Etiketler eklendi: ${tags.join(', ')}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Projeden etiketleri kaldırır
        remove_tags: function(category, projectNumber) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                delete projects[category][projectNumber - 1].tags;
                saveProjects();
                console.log("Etiketler kaldırıldı.");
            } else {
                console.log("Proje bulunamadı.");
            }
        },

        // Projeye eklenen notları gösterir
        view_notes: function(category, projectNumber) {
            if (projects[category] && projects[category][projectNumber - 1] && projects[category][projectNumber - 1].notes) {
                console.log(`Proje Notları: ${projects[category][projectNumber - 1].notes.join(', ')}`);
            } else {
                console.log("Not bulunamadı.");
            }
        },

        // Proje hakkında özet bilgi verir
        get_project_summary: function(category, projectNumber) {
            if (projects[category] && projects[category][projectNumber - 1]) {
                let project = projects[category][projectNumber - 1];
                console.log(`Proje Özeti: ${project.projectname}`);
                console.log(`Zorluk: ${project.difficulty}`);
                console.log(`Detaylar: ${project.details}`);
                console.log(`Durum: ${project.completed ? "✅ Tamamlandı" : project.giveUp ? "❌ Vazgeçildi" : "#🟰 Tamamlanmadı"}`);
                if (project.tags) {
                    console.log(`Etiketler: ${project.tags.join(', ')}`);
                }
                if (project.notes) {
                    console.log(`Notlar: ${project.notes.join(', ')}`);
                }
            } else {
                console.log("Proje bulunamadı.");
            }
        }
    }
};

// Projeleri yükle
loadProjects();