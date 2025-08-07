# Documentation for `FilterByPeriod.jsx`

## Overview

This component is used within the React app and provides specific UI or filtering functionality.

## Code Preview

```
import React, { useState, useEffect, useRef } from "react";
import "../css/FilterPopup.css";

export default function FilterByPeriod({ storeName, onClose, onSubmit }) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const minDate = new Date(now);
  minDate.setFullYear(now.getFullYear() - 3);
  const minDateStr = minDate.toISOString().split("T")[0];

  const weekAgoDate = new Date(now);
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgoStr = weekAgoDa
... (code truncated)
```

## Breakdown

- **Component Purpose**: What this component does.
- **Props**: Any props passed in and their usage.
- **State & Logic**: State variables, useEffect, event handlers.
- **JSX Elements**: Structure of the UI.
- **Export**: How it's made available to the app.

> 🧠 This documentation is written to help students understand reusable React components.
