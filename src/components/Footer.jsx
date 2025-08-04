import "../css/Footer.css";

export default function Footer() {
  return (
    <div
      className="footer"
      title="homesecurity.ch"
      onClick={() => {
        window.open("https://www.homesecurity.ch", "_blank");
      }}
    >
      <img className="footer-logo" src="/homesecurity.png" alt="Logo" />
    </div>
  );
}
