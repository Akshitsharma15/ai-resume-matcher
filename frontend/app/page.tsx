export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[500px]">
        <h1 className="text-4xl font-bold mb-4">
          AI Resume Matcher
        </h1>

        <p className="text-gray-600 mb-8">
          Upload your resume and get:
        </p>

        <ul className="mb-8 space-y-2 text-gray-700">
          <li>✅ ATS Score Prediction</li>
          <li>✅ AI Resume Improvements</li>
          <li>✅ Smart Job Matching</li>
          <li>✅ Keyword Gap Analysis</li>
        </ul>

        <input
          type="file"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition">
          Analyze Resume
        </button>
      </div>
    </main>
  );
}