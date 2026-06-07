# 🌌 ORION: Planetary Defense & Space Weather Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **SYSTEM STATUS: ACTIVE** // A real-time planetary defense tracking terminal and advanced telemetry dashboard designed to parse cosmic threat profiles.

---

## 🛰️ Project Overview

**ORION** is a full-stack, autonomous tactical intelligence dashboard that monitors localized space threats. Instead of just displaying raw, unparsed strings from aerospace agencies, ORION ingests real-time telemetry and subjects it to specialized physics models, orbital mechanics evaluations, and kinetic weapon yield equations to output actionable threat assessments.

---

## ☄️ Core Modules

### 1. Asteroid Planetary Defense Grid (100% Operational)
Taps directly into NASA's Near Earth Object (NEO) telemetry feed to process local-date asteroid flybys using custom background worker sync engines.
* **Atmospheric Ablation Physics:** Dynamically calculates mass and diameter thresholds to predict whether an asset will dissipate harmlessly as an airburst or survive to strike the surface.
* **Kinetic Impact Kinematics:** Models kinetic energy transfer into megatons of TNT explosive yield.
* **Crater Diameter Scaling:** Applies scaling laws to map expected planetary impact craters in kilometers.
* **3D Trajectory Calculus:** Processes miss-distances relative to the Earth's radius and atmosphere to classify objects into *Deep Space Flybys*, *Cislunar Intercepts*, *Atmospheric Grazes*, or *Direct Collisions*.

### 2. Solar Flare Early Warning System (In Architectural Phase 🧪)
*Upcoming feature* designed to query NOAA (National Oceanic and Atmospheric Administration) space weather nodes to map X-ray flux variations, solar wind speed spikes, and geomagnetic storm indexes threatening local orbital satellite arrays.

---

## 🛠️ Tactical Tech Stack

* **Frontend:** Next.js (React) featuring a custom scannable monospace terminal layout.
* **Data Visualization:** Recharts analytical data engine mapping kinetic yield spectrums.
* **Styling:** Tailwind CSS with fluid grid system responsiveness.
* **Backend:** Python 3 + FastAPI async REST architecture.
* **Background Cron Engine:** APScheduler automated cron worker executing data synchronization sweeps.
* **Data Vault:** SQLAlchemy ORM abstracting a local high-performance SQLite database.

---

## 📂 System Directory Layout

```text
ORION/
├── backend/
│   ├── main.py              # FastAPI server, database engines, and background tasks
│   └── orion_vault.db       # Protected local SQLite database cache (Git Ignored)
├── frontend/
│   ├── app/
│   │   ├── layout.js        # Global viewport metadata wrapper
│   │   └── page.js          # Core tactical dashboard UI component
│   ├── package.json
│   └── tailwind.config.js
└── .gitignore               # System environment and database protection parameters
