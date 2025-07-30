// ./src/Loading.jsx
export default function Loading({ text = "Loading..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100px" }}>
      <div className="spinner-border text-primary me-3" role="status" />
      <span>{text}</span>
    </div>
  );
}
