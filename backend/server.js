const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const alerts = [];

app.post("/api/sos", (req, res) => {
  const { fromVoice, location } = req.body;

  const alert = {
    time: new Date().toISOString(),
    fromVoice,
    location,
  };

  alerts.push(alert);

  console.log("🔥 SOS stored:", alert);

  res.json({ success: true, message: "Alert saved" });
});

app.get("/api/alerts",(req,res)=>{
  res.json(alerts);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('Backend running on http://localhost:${PORT}');
});