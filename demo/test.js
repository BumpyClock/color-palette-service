function getColorPalette() {
    const fileInput = document.getElementById('imageFile');
    const imageUrlInput = document.getElementById('imageUrl');
    const resultDiv = document.getElementById('result');
  
    let imgUrl = imageUrlInput.value;
  
    // Clear previous result
    resultDiv.innerHTML = '';
  
    // Check if user uploaded a file or entered a URL
    if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imgUrl = e.target.result;
        fetchPalette(imgUrl);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else if (imgUrl) {
      fetchPalette(imgUrl);
    } else {
      alert('Please upload an image or enter an image URL.');
    }
  }
  
  function fetchPalette(imgUrl) {
    const paletteCount = 6;
    const resultDiv = document.getElementById('result');
  
    // Call your server to get the palette
    fetch(`http://localhost:3000/get-palette?imgUrl=${encodeURIComponent(imgUrl)}&paletteCount=${paletteCount}`)
      .then(response => response.json())
      .then(data => {
        if (data.colors) {
          data.colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.style.width = '100px';
            colorDiv.style.height = '100px';
            colorDiv.style.backgroundColor = color;
            resultDiv.appendChild(colorDiv);
          });
        } else {
          alert('An error occurred while processing the image.');
        }
      })
      .catch(error => {
        console.error(error);
        alert('An error occurred while fetching the color palette.');
      });
  }
  