"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";

type AnalysisResult = {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommended_keywords: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const controllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const score = result?.ats_score ?? 0;

  const scoreMeta = useMemo(() => {
    if (score >= 80) {
      return {
        label: "Strong match",
        textClass: "text-emerald-500 dark:text-emerald-400",
        chipClass:
          "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300",
        barClass: "from-emerald-400 to-green-500",
      };
    }

    if (score >= 60) {
      return {
        label: "Needs refinement",
        textClass: "text-amber-500 dark:text-amber-400",
        chipClass:
          "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300",
        barClass: "from-amber-400 to-orange-500",
      };
    }

    return {
      label: "Needs work",
      textClass: "text-rose-500 dark:text-rose-400",
      chipClass:
        "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300",
      barClass: "from-rose-400 to-red-500",
    };
  }, [score]);

  async function handleAnalyze() {
    if (!file || loading) return;

    setError("");
    setResult(null);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}.`);
      }

      const data = await response.json();

      if (!data?.analysis) {
        throw new Error("The backend returned no analysis payload.");
      }

      setResult(normalizeAnalysis(data.analysis));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError("");

    if (!selected) {
      setFile(null);
      return;
    }

    const isPdf =
      selected.type === "application/pdf" ||
      selected.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setError("Please choose a PDF resume.");
      return;
    }

    setFile(selected);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <p className="sr-only" aria-live="polite">
        {loading
          ? "Resume analysis is in progress"
          : result
          ? "Resume analysis loaded"
          : error
          ? `Error: ${error}`
          : "Ready"}
      </p>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="animate-fade-up relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6 lg:p-10">
          {/* Static background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/15" />
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-400/10" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                AI Resume Analyzer
              </span>

              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Analyze your resume with a{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                  clean, modern dashboard
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Upload a PDF and get an ATS score, strengths, weaknesses,
                improvement suggestions, and recommended keywords in a
                professional SaaS-style layout.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["ATS score", "Gap analysis", "Keyword suggestions"].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                    Upload resume
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    PDF only. Keep files concise for faster analysis.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                  PDF
                </span>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="resume"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Resume file
                </label>

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-blue-500 dark:hover:file:bg-blue-600 dark:focus-visible:ring-offset-slate-950"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Selected file
                </p>
                <p className="mt-1 truncate text-sm text-slate-800 dark:text-slate-200">
                  {file ? file.name : "No file selected yet"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400 dark:focus-visible:ring-offset-slate-950"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-slate-950/30 dark:border-t-slate-950" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze resume"
                )}
              </button>

              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Tip: keep the upload action obvious and above the fold for the
                fastest first-use experience.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="mt-6 animate-fade-up rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {error}
          </div>
        ) : null}

        {loading ? (
          <div
            role="status"
            className="mt-6 animate-fade-up rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500 dark:border-slate-700 dark:border-t-blue-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Running AI analysis
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This usually takes only a few seconds.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {result ? (
          <section
            ref={resultsRef}
            className="mt-8 space-y-6 animate-fade-up"
            aria-labelledby="resume-analysis-heading"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2
                  id="resume-analysis-heading"
                  className="text-2xl font-semibold tracking-tight"
                >
                  Analysis dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Review the results, then refine your summary, skills, and
                  experience sections.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      ATS score
                    </p>

                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <span
                        className={`text-5xl font-semibold tracking-tight sm:text-6xl ${scoreMeta.textClass}`}
                      >
                        {score}
                      </span>

                      <span
                        className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${scoreMeta.chipClass}`}
                      >
                        {scoreMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Interpretation
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      Make the score card the first thing users see after
                      analysis.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Match strength</span>
                    <span>{score}%</span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label="ATS score"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={score}
                    className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${scoreMeta.barClass} transition-[width] duration-700 ease-out motion-reduce:transition-none`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Strengths" value={result.strengths.length} />
                  <MiniStat
                    label="Weaknesses"
                    value={result.weaknesses.length}
                  />
                  <MiniStat
                    label="Keywords"
                    value={result.recommended_keywords.length}
                  />
                </div>
              </article>

              <KeywordCard keywords={result.recommended_keywords} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SectionCard
                title="Strengths"
                items={result.strengths}
                tone="success"
              />
              <SectionCard
                title="Weaknesses"
                items={result.weaknesses}
                tone="danger"
              />
            </div>

            <SectionCard
              title="Improvement suggestions"
              items={result.suggestions}
              tone="primary"
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function normalizeAnalysis(raw: unknown): AnalysisResult {
  const value = (raw ?? {}) as Record<string, unknown>;

  return {
    ats_score: clampScore(value.ats_score),
    strengths: toStringArray(value.strengths),
    weaknesses: toStringArray(value.weaknesses),
    suggestions: toStringArray(value.suggestions),
    recommended_keywords: toStringArray(
      value.recommended_keywords,
      true
    ),
  };
}

function clampScore(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function toStringArray(value: unknown, unique = false): string[] {
  const arr = Array.isArray(value)
    ? value
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  return unique ? Array.from(new Set(arr)) : arr;
}

const MiniStat = memo(function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
});

const KeywordCard = memo(function KeywordCard({
  keywords,
}: {
  keywords: string[];
}) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
            Recommended keywords
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Reuse these terms across your summary, skills, and achievement
            bullets where they are truthful and relevant.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
          ATS
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {keywords.length ? (
          keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:-translate-y-px hover:border-blue-300 hover:text-blue-700 motion-reduce:transform-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:text-blue-300"
            >
              {keyword}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No keywords returned from the backend.
          </p>
        )}
      </div>
    </article>
  );
});

const SectionCard = memo(function SectionCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "primary" | "success" | "danger";
}) {
  const toneMap = {
    primary:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
    success:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    danger:
      "bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  };

  const itemCount = items.length;

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {title === "Improvement suggestions"
              ? "Treat these as the next edits to make."
              : "Review each point before updating your resume."}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${toneMap[tone]}`}
        >
          {itemCount}
        </span>
      </div>

      <ul className="mt-5 space-y-3">
        {itemCount ? (
          items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-slate-500 dark:text-slate-400">
            No items returned from the backend.
          </li>
        )}
      </ul>
    </article>
  );
});
