import "./index.css";
import { useState, useEffect } from "react";

function App() {
  const [status, setStatus] = useState("");
  const [fakeOff, setFakeOff] = useState(false);
  const [fakeCall, setFakeCall] = useState(false);

  // Shake to SOS
  useEffect(() => {
    if (!("DeviceMotionEvent" in window)) {
      console.log("Motion sensor not supported");
      return;
    }

    let last = 0;

    const handleShake = (event) => {
      if (!event.accelerationIncludingGravity) return;

      const acc = event.accelerationIncludingGravity;
      const strength =
        Math.abs(acc.x || 0) +
        Math.abs(acc.y || 0) +
        Math.abs(acc.z || 0);

      const now = Date.now();

      if (strength > 30 && now - last > 3000) {
        last = now;
        console.log("SHAKE DETECTED");
        setStatus("Shake detected! SOS triggered");
        // sendSosToBackend(null, false);
      }
    };

    window.addEventListener("devicemotion", handleShake);
    return () =>
      window.removeEventListener("devicemotion", handleShake);
  }, []);

  // ✅ FIXED: moved outside
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name;
    } catch (error) {
      console.error("Address fetch failed", error);
      return "Address not available";
    }
  };

  // 👉 Send SOS to backend
  const sendSosToBackend = (location, fromVoice = false) => {
    fetch("http://localhost:5000/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromVoice,
        location,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("SOS sent:", data);
        setStatus("SOS sent successfully!");

        // fake shutdown sequence
        setFakeCall(true);
        setTimeout(() => {
          setFakeCall(false);
          setFakeOff(true);
        }, 4000);
      })
      .catch((err) => {
        console.error("SOS error:", err);
        setStatus("Error sending SOS");
      });
  };

  // 👉 SOS button
  const handleSosClick = async () => {
    console.log("SOS button clicked!");

    if (!navigator.geolocation) {
      alert("Location not supported. Sending SOS without location.");
      sendSosToBackend(null, false);
      return;
    }

    setStatus("Getting location...");

    navigator.geolocation.getCurrentPosition(
  async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    console.log("LAT:", lat, "LNG:", lng, "Accuracy:", accuracy);

    const address = await getAddressFromCoords(lat, lng);

    const location = {
      latitude: lat,
      longitude: lng,
      accuracy,
      address,
      mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
    };

    sendSosToBackend(location, false);
  },
  (error) => {
    console.error("Location error:", error);
    sendSosToBackend(null, false);
  },
  {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  }
);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-slate-900 to-black text-white flex items-center justify-center">
      {/* 📞 Fake Call Screen */}
      {fakeCall && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#000",
            color: "#fff",
            zIndex: 999998,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
            Incoming Call
          </h2>
          <p style={{ color: "#aaa", marginBottom: "40px" }}>
            Mom ❤️
          </p>

          <button
            style={{
              backgroundColor: "green",
              padding: "14px 30px",
              borderRadius: "50px",
              border: "none",
              fontSize: "18px",
              color: "#fff",
            }}
            onClick={() => setFakeCall(false)}
          >
            Accept
          </button>
        </div>
      )}

      {/* Fake Shutdown Overlay */}
      {fakeOff && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#000",
            zIndex: 999999,
          }}
        />
      )}

      <div className="w-full max-w-xl px-6 py-10">
        <header className="text-right mb-8">
          <h1 className="text-xs tracking-[0.35em] text-slate-400">
            CRISIS GUARDIAN
          </h1>
          <p className="text-[10px] text-slate-500">
            AI-powered SOS &amp; Silent Safety Assistant
          </p>
        </header>

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-56 h-56">
            <div
              className="absolute inset-0 rounded-full bg-red-500/25"
              style={{ animation: "sos-pulse 1.8s infinite" }}
            />

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
