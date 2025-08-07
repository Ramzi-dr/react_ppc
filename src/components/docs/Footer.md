# Documentation for `Footer.jsx`

## Overview

This component is used within the React app and provides specific UI or filtering functionality.

## Code Preview

```
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

... (code truncated)
```

## Breakdown

- **Component Purpose**: What this component does.
- **Props**: Any props passed in and their usage.
- **State & Logic**: State variables, useEffect, event handlers.
- **JSX Elements**: Structure of the UI.
- **Export**: How it's made available to the app.

> 🧠 This documentation is written to help students understand reusable React components.
