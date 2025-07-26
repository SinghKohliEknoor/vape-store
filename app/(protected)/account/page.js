// app/(protected)/account/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "app/components/Header";
import SiteFooter from "app/components/SiteFooter";
import AddressAutocomplete from "app/components/AddressAutocomplete";

export default function MyAccountPage() {
  const router = useRouter();

  // loading & user
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // profile
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // track last selected Place result
  const [lastPlace, setLastPlace] = useState(null);

  // map refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // 1) load user & profile
  useEffect(() => {
    (async () => {
      const { data: { user: currentUser } = {}, error: userErr } =
        await supabase.auth.getUser();
      if (userErr || !currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);

      const { data: userProfile, error: profErr } = await supabase
        .from("users")
        .select("full_name, email, phone_number, address")
        .eq("id", currentUser.id)
        .single();
      if (profErr) console.error("Profile fetch:", profErr.message);

      setProfile({
        full_name:
          userProfile?.full_name || currentUser.user_metadata?.full_name || "",
        email: userProfile?.email || currentUser.email || "",
        phone_number: userProfile?.phone_number || "",
        address: userProfile?.address || "",
      });
      setLoading(false);
    })();
  }, [router]);

  // 2) when lastPlace changes, init or recenter map + marker
  useEffect(() => {
    if (!lastPlace || !window.google || !mapRef.current) return;
    const latLng = {
      lat: lastPlace.geometry.location.lat(),
      lng: lastPlace.geometry.location.lng(),
    };

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: latLng,
        zoom: 15,
      });
      markerRef.current = new window.google.maps.Marker({
        position: latLng,
        map: mapInstance.current,
      });
    } else {
      mapInstance.current.setCenter(latLng);
      markerRef.current.setPosition(latLng);
    }
  }, [lastPlace]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // force user to pick a suggestion
    if (!lastPlace || lastPlace.formatted_address !== profile.address) {
      alert("Please select your address from the suggestions.");
      setSaving(false);
      return;
    }

    // update auth (name/password)
    const authUpdates = {};
    if (profile.full_name !== user.user_metadata?.full_name) {
      authUpdates.data = { full_name: profile.full_name };
    }
    if (password) {
      authUpdates.password = password;
    }
    if (Object.keys(authUpdates).length) {
      const { error: authErr } = await supabase.auth.updateUser(authUpdates);
      if (authErr) {
        alert("Auth error: " + authErr.message);
        setSaving(false);
        return;
      }
    }

    // upsert into your users table
    const { error: dbErr } = await supabase.from("users").upsert([
      {
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
      },
    ]);
    if (dbErr) {
      alert("DB error: " + dbErr.message);
    } else {
      alert("Profile saved!");
      setPassword("");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading account…</p>
      </div>
    );
  }

  return (
    <>
      {/* Load Google Maps + Places */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />

        <main className="flex-1 pt-32 pb-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ——— form */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-bold text-center text-yellow-300 mb-8">
                My Account
              </h1>

              <form onSubmit={handleSave} className="space-y-6">
                <InputField
                  label="Full Name"
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, full_name: e.target.value }))
                  }
                />

                <InputField
                  label="Email"
                  id="email"
                  value={profile.email}
                  readOnly
                />

                <InputField
                  label="Password"
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <InputField
                  label="Phone Number"
                  id="phone_number"
                  value={profile.phone_number}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone_number: e.target.value }))
                  }
                />

                <AddressAutocomplete
                  value={profile.address}
                  onChange={(addr, place) => {
                    setProfile((p) => ({ ...p, address: addr }));
                    setLastPlace(place);
                  }}
                />

                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold shadow transition ${
                      saving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow"
                  >
                    Logout
                  </button>
                </div>
              </form>
            </div>

            {/* ——— map */}
            <div className="h-80 lg:h-auto rounded-2xl overflow-hidden border border-white/20 shadow-lg">
              <div
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: "300px" }}
              />
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

// ---------- helpers ----------
function InputField({
  label,
  id,
  value,
  onChange,
  readOnly,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label htmlFor={id} className="block mb-1 font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
          readOnly
            ? "bg-white/10 cursor-not-allowed text-white/50"
            : "bg-white/10 text-white"
        }`}
      />
    </div>
  );
}
