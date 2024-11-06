const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
app.enable("trust proxy");
app.set("json spaces", 2);
 
 const {
  convertCRC16,
  generateTransactionId,
  generateExpirationTime,
  elxyzFile,
  generateQRIS,
  createQRIS,
  checkQRISStatus
} = require('./orkut.js')

// Log Info
const messages = {
  error: {
    status: 404,
    creator: "Rafael",
    result: "Error, Service Unavailable",
  },
  notRes: {
    status: 404,
    creator: "Rafael",
    result: "Error, Invalid JSON Result",
  },
  query: {
    status: 400,
    creator: "Rafael",
    result: "Please input parameter query!",
  },
  amount: {
    status: 400,
    creator: "Rafael",
    result: "Please input parameter amount!",
  },
  codeqr: {
    status: 400,
    creator: "Rafael",
    result: "Please input parameter codeqr!",
  },
  url: {
    status: 400,
    creator: "Rafael",
    result: "Please input parameter URL!",
  },
  notUrl: {
    status: 404,
    creator: "Rafael",
    result: "Error, Invalid URL",
  },
};
function genreff() {
  const characters = '0123456789';
  const length = 5;
  let reffidgen = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reffidgen += characters[randomIndex];
  }
  return reffidgen;
}

// Middleware untuk CORS
app.use(cors());


app.get("/api/orkut/cekstatus", async (req, res) => {
  const { merchant, keyorkut } = req.query;
  if (!merchant) return res.status(400).json({ message: "merchant is required" });
  if (!keyorkut) return res.status(400).json({ message: "keyorkut is required" });

  try {
    const response = await fetch(`https://api.elxyzgpt.xyz/orkut/checkpayment?apikey=rafael&merchant=${merchant}&token=${keyorkut}`);
    const data = await response.json(); // Perbaikan di sini, menambahkan await dan memperbaiki nama variabel

    res.json({ status: true, creator: "Rafael", result: data }); // Mengganti `gateway.result` dengan `data.result`
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});




// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'feature.html'));
});

app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json(messages.url);

  try {
  const { tiktokdl } = require("tiktokdl")
    const data = await tiktokdl(url);
    if (!data) return res.status(404).json(messages.notRes);
    res.json({ status: true, creator: "Rafael", result: data });
  } catch (e) {
    res.status(500).json(messages.error);
  }
});


app.get('/api/orkut/createpayment', async (req, res) => {
    const { amount } = req.query;
    if (!amount) {
    return res.json("Isi Parameter Amount.");
    }
    const { codeqr } = req.query;
    if (!codeqr) {
    return res.json("Isi Parameter CodeQr menggunakan qris code kalian.");
    }
    try {
        const qrData = await createQRIS(amount, codeqr);
        res.json({ status: true, creator: "Rafael", result: qrData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orkut/cekstatus', async (req, res) => {
	const { merchant } = req.query;
        if (!merchant) {
        return res.json(Func.resValid("Isi Parameter Merchant."));
        }
        const { keyorkut } = req.query;
       if (!keyorkut) {
       return res.json(Func.resValid("Isi Parameter Token menggunakan token kalian."));
       }
   try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant}/${token}`;
        const response = await axios.get(apiUrl);
        const result = response.data;
        const latestTransaction = result.data[0]; // Ambil transaksi terbaru saja
        res.json(latestTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
