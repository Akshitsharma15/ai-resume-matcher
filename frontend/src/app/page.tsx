"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF resume");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("AI RESPONSE:", data);

      // Prevent crash if backend fails
      if (data.analysis) {
        setResult(data.analysis);
      } else {
        alert("No analysis returned from AI");
      }

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#ca8a04";
    return "#dc2626";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "50px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          AI Resume Analyzer
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "18px",
          }}
        >
          Upload your resume and get ATS insights instantly
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "20px",
          border: "1px solid #334155",
          marginBottom: "40px",
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{
            marginBottom: "20px",
            width: "100%",
            color: "white",
          }}
        />

        {/* FILE NAME */}
        {file && (
          <p
            style={{
              color: "#94a3b8",
              marginBottom: "20px",
            }}
          >
            Selected File: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Analyzing Resume..."
            : "Upload Resume"}
        </button>
      </div>

      {/* RESULT DASHBOARD */}
      {result && (
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* SCORE CARD */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "20px",
              padding: "30px",
              marginBottom: "30px",
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                marginBottom: "20px",
                color: "#cbd5e1",
              }}
            >
              ATS SCORE
            </h2>

            <h1
              style={{
                fontSize: "80px",
                margin: 0,
                color: getScoreColor(
                  result?.ats_score || 0
                ),
              }}
            >
              {result?.ats_score || 0}
            </h1>

            {/* PROGRESS BAR */}
            <div
              style={{
                width: "100%",
                height: "14px",
                background: "#334155",
                borderRadius: "20px",
                marginTop: "25px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${result?.ats_score || 0}%`,
                  height: "100%",
                  background: getScoreColor(
                    result?.ats_score || 0
                  ),
                  transition: "0.5s",
                }}
              />
            </div>
          </div>

          {/* GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* STRENGTHS */}
            <div
              style={{
                background: "#1e293b",
                borderRadius: "20px",
                padding: "25px",
                border: "1px solid #334155",
              }}
            >
              <h2
                style={{
                  color: "#22c55e",
                  marginBottom: "20px",
                }}
              >
                Strengths
              </h2>

              <ul
                style={{
                  paddingLeft: "20px",
                  lineHeight: "1.8",
                }}
              >
                {result?.strengths?.length > 0 ? (
                  result.strengths.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li key={index}>{item}</li>
                    )
                  )
                ) : (
                  <li>No strengths found</li>
                )}
              </ul>
            </div>

            {/* WEAKNESSES */}
            <div
              style={{
                background: "#1e293b",
                borderRadius: "20px",
                padding: "25px",
                border: "1px solid #334155",
              }}
            >
              <h2
                style={{
                  color: "#ef4444",
                  marginBottom: "20px",
                }}
              >
                Weaknesses
              </h2>

              <ul
                style={{
                  paddingLeft: "20px",
                  lineHeight: "1.8",
                }}
              >
                {result?.weaknesses?.length > 0 ? (
                  result.weaknesses.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li key={index}>{item}</li>
                    )
                  )
                ) : (
                  <li>No weaknesses found</li>
                )}
              </ul>
            </div>
          </div>

          {/* SUGGESTIONS */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "20px",
              padding: "25px",
              border: "1px solid #334155",
              marginTop: "20px",
            }}
          >
            <h2
              style={{
                color: "#60a5fa",
                marginBottom: "20px",
              }}
            >
              Improvement Suggestions
            </h2>

            <ul
              style={{
                paddingLeft: "20px",
                lineHeight: "1.8",
              }}
            >
              {result?.suggestions?.length > 0 ? (
                result.suggestions.map(
                  (
                    item: string,
                    index: number
                  ) => (
                    <li key={index}>{item}</li>
                  )
                )
              ) : (
                <li>No suggestions found</li>
              )}
            </ul>
          </div>
          {/* KEYWORDS */}
<div
  style={{
    background: "#1e293b",
    borderRadius: "20px",
    padding: "25px",
    border: "1px solid #334155",
    marginTop: "20px",
  }}
>
  <h2
    style={{
      color: "#f59e0b",
      marginBottom: "20px",
    }}
  >
    Recommended Keywords
  </h2>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
    }}
  >
    {result?.recommended_keywords?.length > 0 ? (
      result.recommended_keywords.map(
        (item: string, index: number) => (
          <div
            key={index}
            style={{
              padding: "10px 16px",
              background: "#2563eb",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {item}
          </div>
        )
      )
    ) : (
      <p>No keywords found</p>
    )}
  </div>
</div>
        </div>
      )}
    </div>
  );
}