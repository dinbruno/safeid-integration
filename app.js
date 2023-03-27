const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

const SAFEID_API_KEY = "your-safeid-api-key";
const SAFEID_BASE_URL = "https://api.safeid.com.br";

async function signDocument(apiKey, fileData) {
    const url = `${SAFEID_BASE_URL}/psc/sign`;

    try {
        const response = await axios.post(url, fileData, {
            headers: {
                "Content-Type": "application/pdf",
                "x-api-key": apiKey,
            },
            responseType: "arraybuffer",
        });

        return response.data;
    } catch (error) {
        console.error("Error while signing document:", error);
        throw error;
    }
}

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        const signedDocument = await signDocument(
            SAFEID_API_KEY,
            req.file.buffer
        );
        const fileName = req.file.originalname.replace(".pdf", "_signed.pdf");
        const filePath = path.join(__dirname, "signed_files", fileName);
        fs.writeFileSync(filePath, signedDocument);
        res.status(200).send({ fileName });
    } catch (error) {
        res.status(500).send("Error while signing document.");
    }
});

app.get("/download/:fileName", (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "signed_files", fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found.");
    }

    res.download(filePath, (err) => {
        if (err) {
            res.status(500).send("Error while downloading file.");
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
