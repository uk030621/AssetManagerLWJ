"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (data.success) {
      router.push("/urltable");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-background">
      <div className="p-6">
        <h2 className="text-xl font-bold text-center">Asset Manager Login</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 p-2 border rounded w-full bg-white text-black"
          placeholder="Enter password"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={handleLogin}
          className="mt-4 p-2 bg-slate-700 text-white rounded mx-auto block w-full"
        >
          Login
        </button>
      </div>
    </div>
  );
}
