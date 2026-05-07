"use client";

import { useState } from "react";
import { API_URL } from "@/src/lib/api";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

 const handleUpload = async () => {
  if (!file) {
    setMessage("Please select a resume.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    console.log("FETCH SUCCESS");

    const text = await response.text();

    console.log("RAW RESPONSE:", text);

    setMessage("Upload successful");

  } catch (error) {
    console.error("REAL ERROR:", error);
    setMessage("Upload failed");
  }

  setLoading(false);
};
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[500px]">
        <h1 className="text-4xl font-bold mb-4">
          AI Resume Matcher
        </h1>

        <p className="text-gray-600 mb-8">
          Upload your resume and get ATS analysis.
        </p>

        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Uploading..." : "Analyze Resume"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}