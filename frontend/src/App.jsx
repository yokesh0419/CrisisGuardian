import "./index.css";
import { useState, useEffect } from "react";

function App() {
  const [status, setStatus] = useState("");
  // Shake to SOS
useEffect(() => {
  let last = 0;

  const handleShake = (event) => {
    const acc = event.accelerationIncludingGravity;
    let strength = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

    if (strength > 30) {   // sensitivity
      let now = Date.now();
      if (now - last > 3000) {  // 3 sec delay between alerts
        last = now;
        handleSosClick();
      }
    }
  };

  window.addEventListener("devicemotion", handleShake);
  return () => window.removeEventListener("devicemotion", handleShake);
}, []);

  // 👉 This function actually sends the SOS to backend
  const sendSosToBackend = (location, fromVoice = false) => {
    fetch("http://localhost:5000/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromVoice,
        location, // either null or { latitude, longitude, accuracy }
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("SOS sent:", data);
        setStatus("SOS sent successfully!");
        alert("SOS sent successfully!");
      })
      .catch((err) => {
        console.error("SOS error:", err);
        setStatus("Error sending SOS");
        alert("Error sending SOS");
      });
  };

  // 👉 This runs when you click the SOS button
  const handleSosClick = () => {
    console.log("SOS button clicked!");

    if (!navigator.geolocation) {
      alert("Location not supported. Sending SOS without location.");
      sendSosToBackend(null, false);
      return;
    }

    setStatus("Getting location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log("Location:", coords);
        setStatus("Sending SOS with location...");
        sendSosToBackend(coords, false);
      },
      (error) => {
        console.error("Location error:", error);
        alert("Could not get location. Sending SOS without location.");
        setStatus("Sending SOS without location...");
        sendSosToBackend(null, false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-slate-900 to-black text-white flex items-center justify-center">
      <div className="w-full max-w-xl px-6 py-10">
        {/* Top title */}
        <header className="text-right mb-8">
          <h1 className="text-xs tracking-[0.35em] text-slate-400">
            CRISIS GUARDIAN
          </h1>
          <p className="text-[10px] text-slate-500">
            AI-powered SOS &amp; Silent Safety Assistant
          </p>
        </header>

        {/* Center SOS */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-56 h-56">
            {/* pulse ring */}
            <div
              className="absolute inset-0 rounded-full bg-red-500/25"
              style={{ animation: "sos-pulse 1.8s infinite" }}
            />
            {/* button */}
            <button
              onClick={handleSosClick}
              className="relative inset-4 w-48 h-48 rounded-full border-4 border-red-300
                         bg-gradient-to-br from-red-200 via-red-500 to-red-800
                         shadow-lg shadow-red-600/50
                         flex items-center justify-center text-4xl font-bold text-white
                         transition-transform active:scale-90"
            >
              SOS
            </button>
          </div>

          {/* chips */}
          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
            <span className="px-3 py-1 rounded-full border border-emerald-500 bg-emerald-900/40 text-emerald-200 uppercase tracking-wide">
              Smart Safety Mode (Demo)
            </span>
            <span className="px-3 py-1 rounded-full border border-slate-600 bg-slate-900/80 text-slate-300">
              Voice Wake Word (Coming soon)
            </span>
            <span className="px-3 py-1 rounded-full border border-rose-500 bg-rose-900/40 text-rose-200">
              Fake Shutdown Enabled
            </span>
          </div>

          {/* status line */}
          <p className="mt-3 text-xs text-slate-300 text-center">
            Day 4: SOS sends data to backend with live location.
          </p>

          {status && (
            <p className="mt-2 text-xs text-emerald-300 text-center">
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;