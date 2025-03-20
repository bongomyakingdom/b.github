/*
// image.json dosyasını al
fetch('assets/images.json')
  .then(response => response.json())  // JSON verisini parse et
  .then(images => {
    // Ana sayfada gösterilmesi gereken resimleri filtrele
    const filteredImages = images.filter(image => image.showOnHomepage);

    // Gallery section'ını seç
    const gallerySection = document.querySelector('.gallery-section');

    // Filtrelenmiş resimleri galeriye ekle
    filteredImages.forEach(image => {
      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.alt = 'Gallery Image';
      gallerySection.appendChild(imgElement);
    });
  })
  .catch(error => {
    console.error('Resimler yüklenirken bir hata oluştu:', error);
  });
*/





/*
// image.json dosyasını al
fetch('assets/images.json')
  .then(response => response.json())  // JSON verisini parse et
  .then(images => {
    // Ana sayfada gösterilmesi gereken resimleri filtrele
    const filteredImages = images.filter(image => image.showOnHomepage);

    // blog-container div'ini seç
    const blogContainer = document.querySelector('.blog-container');

    // Filtrelenmiş resimleri döngüye al ve blog-post yapısını oluştur
    filteredImages.forEach(image => {
      // blog-post div'ini oluştur
      const blogPost = document.createElement('div');
      blogPost.classList.add('blog-post');

      // blog-img-box div'ini oluştur
      const blogImgBox = document.createElement('div');
      blogImgBox.classList.add('blog-img-box');

      // img elementini oluştur
      const imgElement = document.createElement('img');
      imgElement.src = image.src; // JSON'daki resim URL'sini kullan
      imgElement.alt = 'Galeri Resmi'; // Alternatif metin

      // img elementini blog-img-box div'ine ekle
      blogImgBox.appendChild(imgElement);

      // blog-img-box div'ini blog-post div'ine ekle
      blogPost.appendChild(blogImgBox);

      // blog-post div'ini blog-container div'ine ekle
      blogContainer.appendChild(blogPost);
    });
  })
  .catch(error => {
    console.error('Resimler yüklenirken bir hata oluştu:', error);
  });
*/





/*
fetch('assets/images.json')
  .then(response => response.json())
  .then(images => {
    const filteredImages = images.filter(image => image.showOnHomepage);
    const blogContainer = document.querySelector('.blog-container');

    filteredImages.forEach(image => {
      const blogPost = document.createElement('div');
      blogPost.classList.add('blog-post');

      const blogImgBox = document.createElement('div');
      blogImgBox.classList.add('blog-img-box');

      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.alt = 'Galeri Resmi';

      blogImgBox.appendChild(imgElement);
      blogPost.appendChild(blogImgBox);
      blogContainer.appendChild(blogPost);
    });
  })
  .catch(error => {
    console.error('Resimler yüklenirken bir hata oluştu:', error);
  });
*/




/*
fetch('assets/images.json')
  .then(response => response.json())
  .then(images => {
    console.log("JSON verisi alındı:", images); // JSON verisini kontrol et
    const allImages = images;

    const blogContainer = document.querySelector('.blog-container');
    console.log("blog-container bulundu mu?", blogContainer); // blog-container div'ini kontrol et

    allImages.forEach(image => {
      console.log("Resim işleniyor:", image.src); // Her resmin işlendiğini kontrol et
      const blogPost = document.createElement('div');
      blogPost.classList.add('blog-post');

      const blogImgBox = document.createElement('div');
      blogImgBox.classList.add('blog-img-box');

      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.alt = 'Galeri Resmi';

      blogImgBox.appendChild(imgElement);
      blogPost.appendChild(blogImgBox);
      blogContainer.appendChild(blogPost);
    });
  })
  .catch(error => {
    console.error('Resimler yüklenirken bir hata oluştu:', error);
  });
*/





fetch('assets/images.json')
  .then(response => response.json())
  .then(images => {
    console.log("JSON verisi alındı:", images); // JSON verisini kontrol et
    const filteredImages = images.filter(image => image.showOnHomepage);
    console.log("Filtrelenmiş resimler:", filteredImages); // Filtrelenmiş resimleri kontrol et

    // ID kullanarak doğru elementi seç
    const blogContainer = document.querySelector('#gallery-blog-container');
    console.log("blog-container bulundu mu?", blogContainer); // blog-container div'ini kontrol et

    filteredImages.forEach(image => {
      console.log("Resim işleniyor:", image.src); // Her resmin işlendiğini kontrol et
      const blogPost = document.createElement('div');
      blogPost.classList.add('blog-post');

      const blogImgBox = document.createElement('div');
      blogImgBox.classList.add('blog-img-box');

      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.alt = 'Galeri Resmi';

      blogImgBox.appendChild(imgElement);
      blogPost.appendChild(blogImgBox);
      blogContainer.appendChild(blogPost);
    });
  })
  .catch(error => {
    console.error('Resimler yüklenirken bir hata oluştu:', error);
  });