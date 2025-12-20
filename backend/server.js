const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const alerts = [];

app.post("/api/sos", (req, res) => {
  const { fromVoice, location } = req.body;

  console.log("🔥 SOS stored:", {
    time: new Date().toISOString(),
    fromVoice,
    location
  });

  res.json({ success: true });
});

app.get("/api/alerts",(req,res)=>{
  res.json(alerts);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});