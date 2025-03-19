const ai = {
    projects: {}, // Projeleri saklamak için ana nesne

    // Projeleri sunucudan yükleme fonksiyonu
    loadProjects: async function () {
        try {
            // Sunucudan projeleri getir
            const response = await fetch('/projects');
            // Eğer yanıt başarılı değilse hata fırlat
            if (!response.ok) throw new Error('Projeler yüklenirken bir hata oluştu.');
            // Yanıtı JSON formatına çevir ve `projects` nesnesine kaydet
            this.projects = await response.json();
            console.log('Projeler başarıyla yüklendi.');
        } catch (error) {
            // Hata durumunda konsola hata mesajını yazdır
            console.error(error);
        }
    },

    // Projeleri sunucuya kaydetme fonksiyonu
    saveProjects: async function () {
        try {
            // Sunucuya projeleri kaydetmek için POST isteği gönder
            const response = await fetch('/projects/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // JSON formatında veri gönder
                body: JSON.stringify(this.projects), // `projects` nesnesini JSON'a çevir
            });
            // Eğer yanıt başarılı değilse hata fırlat
            if (!response.ok) throw new Error('Projeler kaydedilirken bir hata oluştu.');
            // Yanıtı JSON formatına çevir ve konsola mesajı yazdır
            const result = await response.json();
            console.log(result.message);
        } catch (error) {
            // Hata durumunda konsola hata mesajını yazdır
            console.error(error);
        }
    },

    // Proje yönetimi fonksiyonları
    proje: {
        // Yeni kategori ekleme fonksiyonu
        add_category: function (categoryName) {
            // Eğer kategori zaten mevcut değilse
            if (!ai.projects[categoryName]) {
                // Yeni kategori ekle
                ai.projects[categoryName] = [];
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Yeni kategori eklendi: ${categoryName}`);
            } else {
                // Kategori zaten mevcutsa uyarı mesajı göster
                console.log("Kategori zaten mevcut.");
            }
        },

        // Kategori silme fonksiyonu
        delete_category: function (categoryName) {
            // Eğer kategori mevcutsa
            if (ai.projects[categoryName]) {
                // Kategoriyi sil
                delete ai.projects[categoryName];
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Kategori silindi: ${categoryName}`);
            } else {
                // Kategori mevcut değilse uyarı mesajı göster
                console.log("Kategori bulunamadı.");
            }
        },

        // Kategorileri listeleme fonksiyonu
        list_categories: function () {
            console.log("Mevcut Kategoriler:");
            let index = 1;
            for (const category in ai.projects) {
                console.log(`${index}. ${category}`);
                index++;
            }
        },

        // Yeni proje ekleme fonksiyonu
        add_project: function (category, difficulty, projectname, details, tags = []) {
            // Eğer kategori mevcut değilse uyarı mesajı göster
            if (!ai.projects[category]) {
                console.log("Kategori bulunamadı. Önce kategori ekleyin.");
                return;
            }
            // Yeni projeyi kategoriye ekle
            ai.projects[category].push({
                projectname: projectname, // Proje adı
                details: details, // Proje detayları
                difficulty: difficulty, // Zorluk seviyesi
                tags: tags, // Etiketler
                notes: [], // Notlar (başlangıçta boş)
                createdDate: new Date().toISOString(), // Oluşturulma tarihi
                completed: false, // Tamamlanma durumu (başlangıçta false)
                giveUp: false // Vazgeçilme durumu (başlangıçta false)
            });
            // Değişiklikleri kaydet
            ai.saveProjects();
            console.log(`Yeni proje eklendi: ${projectname}`);
        },

        // Proje durumunu güncelleme fonksiyonu
        update: function (categoryNumber, projectNumber, statusInput) {
            // Durum girdisini durum metnine dönüştür
            let status;
            if (typeof statusInput === "number") {
                // Sayısal girdi ise
                switch (statusInput) {
                    case 1:
                        status = "completed";
                        break;
                    case 0:
                        status = "uncompleted";
                        break;
                    case -1:
                        status = "give up";
                        break;
                    default:
                        console.log("Geçersiz durum kodu. Lütfen 1 (completed), 0 (uncompleted) veya -1 (give up) kullanın.");
                        return;
                }
            } else if (typeof statusInput === "string") {
                // Metin girdisi ise
                status = statusInput.toLowerCase(); // Küçük harfe çevir
                if (!["completed", "uncompleted", "give up"].includes(status)) {
                    console.log("Geçersiz durum metni. Lütfen 'completed', 'uncompleted' veya 'give up' kullanın.");
                    return;
                }
            } else {
                console.log("Geçersiz girdi. Lütfen sayı (1, 0, -1) veya metin ('completed', 'uncompleted', 'give up') kullanın.");
                return;
            }
        
            // Kategorileri bir diziye dönüştür
            const categories = Object.keys(ai.projects);
            // Kategori numarasına göre kategori adını al
            const category = categories[categoryNumber - 1];
        
            if (category && ai.projects[category][projectNumber - 1]) {
                const project = ai.projects[category][projectNumber - 1];
                if (status === "completed") {
                    project.completed = true;
                    project.giveUp = false;
                } else if (status === "uncompleted") {
                    project.completed = false;
                    project.giveUp = false;
                } else if (status === "give up") {
                    project.completed = false;
                    project.giveUp = true;
                }
                ai.saveProjects();
                console.log(`Proje durumu güncellendi: ${project.projectname} (${status})`);
            } else {
                console.log("Kategori veya proje bulunamadı.");
            }
        },

        // Proje silme fonksiyonu
        delete: function (category, projectNumber) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Projeyi sil
                const deletedProject = ai.projects[category].splice(projectNumber - 1, 1);
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Proje silindi: ${deletedProject[0].projectname}`);
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Proje detaylarını gösterme fonksiyonu
        show_details: function (categoryInput, projectInput) {
            // Kategorileri bir diziye dönüştür
            const categories = Object.keys(ai.projects);
            let category;
        
            // Kategori girdisini işle
            if (typeof categoryInput === "number") {
                // Sayısal girdi ise
                if (categoryInput >= 1 && categoryInput <= categories.length) {
                    category = categories[categoryInput - 1];
                } else {
                    console.log(`Geçersiz kategori numarası. Lütfen 1 ile ${categories.length} arasında bir sayı girin.`);
                    return;
                }
            } else if (typeof categoryInput === "string") {
                // Metin girdisi ise
                category = categoryInput; // Kategori adını doğrudan kullan
                if (!categories.includes(category)) {
                    console.log(`Geçersiz kategori adı. Lütfen mevcut kategorilerden birini girin: ${categories.join(", ")}`);
                    return;
                }
            } else {
                console.log("Geçersiz kategori girdisi. Lütfen sayı (kategori numarası) veya metin (kategori adı) kullanın.");
                return;
            }
        
            // Proje girdisini işle
            let projectNumber;
            if (typeof projectInput === "number") {
                // Sayısal girdi ise
                projectNumber = projectInput;
            } else if (typeof projectInput === "string") {
                // Metin girdisi ise (proje adı)
                const projectIndex = ai.projects[category].findIndex(project => project.projectname === projectInput);
                if (projectIndex === -1) {
                    console.log(`"${projectInput}" adında bir proje bulunamadı.`);
                    return;
                }
                projectNumber = projectIndex + 1; // Proje numarasını bul
            } else {
                console.log("Geçersiz proje girdisi. Lütfen sayı (proje numarası) veya metin (proje adı) kullanın.");
                return;
            }
        
            // Proje detaylarını göster
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                const project = ai.projects[category][projectNumber - 1];
                console.log(`Proje Detayları: ${project.projectname}`);
                console.log(`Zorluk: ${project.difficulty}`);
                console.log(`Detaylar: ${project.details}`);
                console.log(`Durum: ${project.completed ? "✅ Tamamlandı" : project.giveUp ? "❌ Vazgeçildi" : "#🟰 Tamamlanmadı"}`);
                console.log(`Etiketler: ${project.tags.join(', ')}`);
                console.log(`Notlar: ${project.notes.join(', ')}`);
                console.log(`Oluşturulma Tarihi: ${project.createdDate}`);
            } else {
                console.log("Proje bulunamadı.");
            }
        },
        
        // Proje detaylarını güncelleme fonksiyonu
        update_details: function (category, projectNumber, newDetails) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Proje detaylarını güncelle
                ai.projects[category][projectNumber - 1].details = newDetails;
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Proje detayları güncellendi: ${ai.projects[category][projectNumber - 1].projectname}`);
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Projeleri durumlarına göre filtreleme fonksiyonu
        filter_by_status: function (statusInput) {
            // Durum girdisini durum metnine dönüştür
            let status;
            if (typeof statusInput === "number") {
                // Sayısal girdi ise
                switch (statusInput) {
                    case 1:
                        status = "completed";
                        break;
                    case 0:
                        status = "uncompleted";
                        break;
                    case -1:
                        status = "give up";
                        break;
                    default:
                        console.log("Geçersiz durum kodu. Lütfen 1 (completed), 0 (uncompleted) veya -1 (give up) kullanın.");
                        return;
                }
            } else if (typeof statusInput === "string") {
                // Metin girdisi ise
                status = statusInput.toLowerCase(); // Küçük harfe çevir
                if (!["completed", "uncompleted", "give up"].includes(status)) {
                    console.log("Geçersiz durum metni. Lütfen 'completed', 'uncompleted' veya 'give up' kullanın.");
                    return;
                }
            } else {
                console.log("Geçersiz girdi. Lütfen sayı (1, 0, -1) veya metin ('completed', 'uncompleted', 'give up') kullanın.");
                return;
            }
        
            console.log(`Durumu "${status}" olan projeler:`);
            for (const category in ai.projects) {
                ai.projects[category].forEach((project, index) => {
                    if (
                        (status === 'uncompleted' && !project.completed && !project.giveUp) ||
                        (status === 'completed' && project.completed) ||
                        (status === 'give up' && project.giveUp)
                    ) {
                        console.log(`Kategori: ${category}, Proje: ${project.projectname}`);
                    }
                });
            }
        },

        // Kategoriye göre projeleri filtreleme fonksiyonu
        filter_by_category: function (categoryInput) {
            // Kategorileri bir diziye dönüştür
            const categories = Object.keys(ai.projects);
            let category;
        
            // Girdi türüne göre kategori adını belirle
            if (typeof categoryInput === "number") {
                // Sayısal girdi ise
                if (categoryInput >= 1 && categoryInput <= categories.length) {
                    category = categories[categoryInput - 1];
                } else {
                    console.log(`Geçersiz kategori numarası. Lütfen 1 ile ${categories.length} arasında bir sayı girin.`);
                    return;
                }
            } else if (typeof categoryInput === "string") {
                // Metin girdisi ise
                category = categoryInput; // Kategori adını doğrudan kullan
                if (!categories.includes(category)) {
                    console.log(`Geçersiz kategori adı. Lütfen mevcut kategorilerden birini girin: ${categories.join(", ")}`);
                    return;
                }
            } else {
                console.log("Geçersiz girdi. Lütfen sayı (kategori numarası) veya metin (kategori adı) kullanın.");
                return;
            }
        
            // Kategoriye göre projeleri listele
            console.log(`Kategori: ${category}`);
            ai.projects[category].forEach((project, index) => {
                const status = project.completed ? "✅" : project.giveUp ? "❌" : "#🟰";
                console.log(`${index + 1}. ${project.projectname} ${status}`);
            });
        },

        // Zorluk seviyesine göre projeleri sıralama fonksiyonu
        sort_by_difficulty: function (order = 'asc') {
            console.log(`Zorluk seviyesine göre sıralanmış projeler (${order === 'asc' ? 'Artan' : 'Azalan'}):`);
            let allProjects = [];
            // Tüm projeleri tek bir dizide topla
            for (const category in ai.projects) {
                allProjects = allProjects.concat(ai.projects[category].map(project => ({ ...project, category })));
            }
            // Zorluk seviyesine göre sırala
            allProjects.sort((a, b) => order === 'asc' ? a.difficulty.localeCompare(b.difficulty) : b.difficulty.localeCompare(a.difficulty));
            // Sıralanmış projeleri konsola yazdır
            allProjects.forEach((project, index) => {
                const status = project.completed ? "✅" : project.giveUp ? "❌" : "#🟰";
                console.log(`${index + 1}. Kategori: ${project.category}, Proje: ${project.projectname}, Zorluk: ${project.difficulty} ${status}`);
            });
        },

        // Projenin adını değiştirme fonksiyonu
        rename: function (category, projectNumber, newName) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Proje adını güncelle
                ai.projects[category][projectNumber - 1].projectname = newName;
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Proje adı güncellendi: ${newName}`);
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Tüm projelerin istatistiklerini gösterme fonksiyonu
        get_stats: function () {
            let completed = 0, uncompleted = 0, giveUp = 0;
            // Her kategorideki projeleri kontrol et
            for (const category in ai.projects) {
                ai.projects[category].forEach(project => {
                    // Duruma göre istatistikleri güncelle
                    if (project.completed) completed++;
                    else if (project.giveUp) giveUp++;
                    else uncompleted++;
                });
            }
            // İstatistikleri konsola yazdır
            console.log(`İstatistikler:`);
            console.log(`✅ Tamamlanan: ${completed}`);
            console.log(`#🟰 Tamamlanmayan: ${uncompleted}`);
            console.log(`❌ Vazgeçilen: ${giveUp}`);
        },

        // Projeye not ekleme fonksiyonu
        add_note: function (category, projectNumber, note) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Not ekle
                ai.projects[category][projectNumber - 1].notes.push(note);
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Not eklendi: ${note}`);
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Projeden notu silme fonksiyonu
        remove_note: function (category, projectNumber) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Notları sil
                ai.projects[category][projectNumber - 1].notes = [];
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log("Notlar silindi.");
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Projeye etiket ekleme fonksiyonu
        add_tags: function (category, projectNumber, tags) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Etiketleri ekle
                ai.projects[category][projectNumber - 1].tags = tags;
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log(`Etiketler eklendi: ${tags.join(', ')}`);
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Projeden etiketleri kaldırma fonksiyonu
        remove_tags: function (category, projectNumber) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                // Etiketleri kaldır
                ai.projects[category][projectNumber - 1].tags = [];
                // Değişiklikleri kaydet
                ai.saveProjects();
                console.log("Etiketler kaldırıldı.");
            } else {
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        },

        // Projeye eklenen notları gösterme fonksiyonu
        view_notes: function (category, projectNumber) {
            // Eğer proje mevcutsa ve notlar varsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1] && ai.projects[category][projectNumber - 1].notes) {
                // Notları konsola yazdır
                console.log(`Proje Notları: ${ai.projects[category][projectNumber - 1].notes.join(', ')}`);
            } else {
                // Not yoksa uyarı mesajı göster
                console.log("Not bulunamadı.");
            }
        },

        // Proje hakkında özet bilgi verme fonksiyonu
        get_project_summary: function (category, projectNumber) {
            // Eğer proje mevcutsa
            if (ai.projects[category] && ai.projects[category][projectNumber - 1]) {
                const project = ai.projects[category][projectNumber - 1];
                // Proje özetini konsola yazdır
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
                // Proje mevcut değilse uyarı mesajı göster
                console.log("Proje bulunamadı.");
            }
        }
    }
};

// Sayfa yüklendiğinde projeleri yükle
window.onload = () => ai.loadProjects();


// ====================================================
// Proje Yönetimi Fonksiyonları - Hatırlatıcı
// ====================================================

//! 1. Proje Listeleme ve Genel İşlemler
// ai.proje.list(): Mevcut proje listesini mesaj olarak yazdırır.
// ai.proje.get_stats(): Tüm projelerin genel istatistiklerini gösterir (tamamlanan, tamamlanmayan, vazgeçilen projelerin sayısı vb.).

//! 2. Proje Ekleme ve Güncelleme
// ai.proje.add_project(category, difficulty, projectname, details, tags): Yeni proje ekler.
// ai.proje.update(category, project number, status): Proje durumunu günceller (completed, uncompleted, give up).
// ai.proje.update_details(category, project number, new details): Proje detaylarını günceller.
// ai.proje.rename(category, project number, new_name): Belirli bir projenin adını değiştirir.

//! 3. Proje Silme ve Detay Görüntüleme
// ai.proje.delete(category, project number): Belirli bir projeyi siler.
// ai.proje.show_details(category, project number): Proje hakkında daha fazla bilgi gösterir.
// ai.proje.get_project_summary(category, project number): Proje hakkında özet bilgi verir.

//! 4. Filtreleme ve Sıralama
// ai.proje.filter_by_status(status): Projeleri durumlarına göre filtreler (tamamlanmadı, tamamlandı, vazgeçildi).
// ai.proje.filter_by_category(category): Kategoriye göre projeleri filtreler.
// ai.proje.sort_by_difficulty(order): Zorluk seviyesine göre projeleri sıralar (asc: artan, desc: azalan).

//! 5. Kategori İşlemleri
// ai.proje.add_category(category_name): Yeni bir kategori ekler.
// ai.proje.delete_category(category_name): Belirli bir kategoriyi siler.

//! 6. Not ve Etiket İşlemleri
// ai.proje.add_note(category, project number, note): Projeye bir not ekler.
// ai.proje.remove_note(category, project number): Projeden notu siler.
// ai.proje.view_notes(category, project number): Projeye eklenen notları gösterir.
// ai.proje.add_tags(category, project number, tags): Projeye etiketler ekler (örneğin, "öncelikli", "uzun süreli" vb.).
// ai.proje.remove_tags(category, project number, tags): Projeden etiketleri kaldırır.

// ====================================================