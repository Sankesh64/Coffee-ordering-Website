// app/loading.js
export default function Loading() {
  return (
    <div className="loading-center" style={{ minHeight: "100vh" }}>
      <div>
        <div className="spinner" />
        <p style={{ textAlign: "center", color: "#888", marginTop: 16, fontSize: "0.9rem" }}>
          Brewing your page...
        </p>
      </div>
    </div>
  );
}
