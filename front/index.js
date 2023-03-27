const API_BASE_URL = "http://localhost:3000"; // Atualize para o endereço do seu servidor, se necessário

document.getElementById("upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("file-input");
  if (!fileInput.files.length) {
    alert("Please choose a file to upload.");
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload and sign the file.");
    }

    const result = await response.json();
    const downloadLink = document.getElementById("download-link");
    downloadLink.href = `${API_BASE_URL}/download/${result.fileName}`;
    document.getElementById("download-container").style.display = "block";
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});