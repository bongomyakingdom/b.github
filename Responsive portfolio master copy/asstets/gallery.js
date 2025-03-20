document.addEventListener("DOMContentLoaded", function() {
    fetch('images.json')
      .then(response => response.json())
      .then(data => {
        const galleryDiv = document.getElementById("gallery-container");
  
        // Tarihe göre azalan sıralama (en yeni en üstte)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
  
        // Sadece showOnMain: true olanları filtrele
        const visibleImages = data.filter(image => image.showOnMain);
  
        visibleImages.forEach(image => {
          const imgElement = document.createElement("img");
          imgElement.src = image.url;
          imgElement.alt = image.description;
          imgElement.title = `${image.description} (${image.date})`;
  
          // Tıklandığında foto detay sayfasına yönlendir
          imgElement.addEventListener("click", () => {
            window.location.href = `photo.html?imageId=${image.id}`;
          });
  
          galleryDiv.appendChild(imgElement);
        });
      })
      .catch(error => console.error("Veriler yüklenirken hata oluştu:", error));
  });
  