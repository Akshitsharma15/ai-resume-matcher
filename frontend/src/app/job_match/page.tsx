"use client";

import { useState } from "react";

type JobMatchResult = {
  match_score?: number;
  alignment_summary?: string;
  matching_skills?: string[];
  missing_skills?: string[];
  recommended_keywords?: string[];
  improvement_suggestions?: string[];
};

export default function JobMatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!file) {
      alert("Please upload your resume PDF");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste the job description");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("http://localhost:8000/match-job", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("JOB MATCH RESPONSE:", data);

      if (data.match_result) {
        setResult(data.match_result);
      } else {
        alert("No match result returned");
      }
    } catch (error) {
      console.error("Job match error:", error);
      alert("Job matching failed");
    } finally {
      setLoading(false);
    }
  };

  const score = result?.match_score ?? 0;

  const scoreColor =
    score >= 80
      ? "text-emerald-400"
      : score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  const barColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-5 py-12">
        {/* HERO */}
        <div className="mb-10 text-center">
          <p className="mb-4 inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            AI Job Profile Matcher
          </p>

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
            Match Your Resume With a{" "}
            <span className="text-blue-400">Job Description</span>
          </h1>

          <p className="mx-auto max-w-2xl text-slate-400">
            Upload your resume, paste a job description, and get match score,
            missing skills, recommended keywords, and improvement suggestions.
          </p>
        </div>

        {/* INPUT AREA */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* RESUME UPLOAD */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-semibold">Upload Resume</h2>
            <p className="mb-5 text-sm text-slate-400">
              Upload your PDF resume for comparison.
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-5 file:py-3 file:font-semibold file:text-white hover:file:bg-blue-700"
            />

            {file && (
              <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                Selected: <span className="text-white">{file.name}</span>
              </p>
            )}
          </div>

          {/* JOB DESCRIPTION */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-semibold">Job Description</h2>
            <p className="mb-5 text-sm text-slate-400">
              Paste the target job profile or job description.
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here..."
              className="h-48 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleMatch}
          disabled={loading}
          className="mb-10 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Matching Profile..." : "Match Resume With Job"}
        </button>

        {/* LOADING */}
        {loading && (
          <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
            <p className="text-slate-300">
              AI is comparing your resume with the job profile...
            </p>
          </div>
        )}

        {/* RESULT DASHBOARD */}
        {result && (
          <section className="space-y-6">
            {/* SCORE CARD */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
              <p className="mb-2 text-slate-400">Job Match Score</p>

              <h2 className={`text-7xl font-bold ${scoreColor}`}>
                {score}
              </h2>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full ${barColor} transition-all duration-700`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {result.alignment_summary && (
                <p className="mx-auto mt-6 max-w-3xl text-slate-300">
                  {result.alignment_summary}
                </p>
              )}
            </div>

            {/* SKILLS GRID */}
            <div className="grid gap-6 md:grid-cols-2">
              <ResultCard
                title="Matching Skills"
                color="text-emerald-400"
                items={result.matching_skills}
              />

              <ResultCard
                title="Missing Skills"
                color="text-red-400"
                items={result.missing_skills}
              />
            </div>

            {/* KEYWORDS */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h3 className="mb-5 text-2xl font-bold text-yellow-400">
                Recommended Keywords
              </h3>

              <div className="flex flex-wrap gap-3">
                {result.recommended_keywords?.length ? (
                  result.recommended_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400">No keywords found</p>
                )}
              </div>
            </div>

            {/* SUGGESTIONS */}
            <ResultCard
              title="Improvement Suggestions"
              color="text-blue-400"
              items={result.improvement_suggestions}
            />
          </section>
        )}
      </section>
    </main>
  );
}

function ResultCard({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items?: string[];
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h3 className={`mb-5 text-2xl font-bold ${color}`}>{title}</h3>

      <ul className="space-y-3">
        {items?.length ? (
          items.map((item, index) => (
            <li key={index} className="leading-relaxed text-slate-300">
              <span className="mr-2 text-blue-400">•</span>
              {item}
            </li>
          ))
        ) : (
          <li className="text-slate-500">No data found</li>
        )}
      </ul>
    </div>
  );
}