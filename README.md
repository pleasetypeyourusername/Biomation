````md
# 🌱 Biomation

> **Cultivate Data, Nourish Growth.**

Biomation is an agriculture IoT platform designed to help users monitor,
analyze, and manage agricultural environments through connected devices
and collected sensor data.

This repository contains selected parts of the Biomation project as a
public showcase of my frontend development and software engineering work.

> **Note:** The complete Biomation source code is kept private. This
> repository contains selected frontend components and documentation for
> demonstration and portfolio purposes.

---

## 📌 Overview

Biomation combines IoT devices, data collection, visualization, and
management tools into a single platform for agricultural monitoring.

The platform is designed around several key areas:

- 📊 Data analysis and visualization
- 📡 IoT device management
- 🔐 User and environment security
- 📝 Activity and system logs
- 👤 User authentication

The goal is to provide users with a centralized interface for monitoring
agricultural environments and making better decisions from collected data.

---

## 👨‍💻 My Contribution

I designed and developed the Biomation platform, including its frontend
architecture, user interface, authentication flow, dashboard interfaces,
and interaction logic.

Some of the areas I worked on include:

- Designing responsive interfaces
- Building reusable React components
- Implementing authentication flows
- Handling client-side validation
- Integrating frontend applications with APIs
- Implementing loading and error states
- Building data visualization interfaces
- Designing IoT device management interfaces
- Implementing user and environment security interfaces
- Creating interactive dashboard components

The complete project contains additional backend and infrastructure
components that are not included in this public repository.

---

## 🔐 Authentication

Biomation includes a custom authentication flow for account registration
and user login.

### Login

The login interface includes:

- Email validation
- Password validation
- Google reCAPTCHA verification
- Authentication API integration
- Authentication state checking
- Error handling
- Loading states
- Password reset functionality
- Redirecting authenticated users to the dashboard

### Signup

The signup interface includes:

- Email validation
- Username validation
- User tag validation
- Password requirement validation
- Google reCAPTCHA verification
- Duplicate email detection
- Duplicate username/tag detection
- Error handling
- Loading states
- Successful registration feedback

Selected authentication source code can be found in:

```text
login/
└── login.jsx

signup/
└── signup.jsx
````

### Authentication Flow

The general authentication flow is:

```text
User
 │
 ▼
Login / Signup Form
 │
 ▼
Client-side Validation
 │
 ▼
reCAPTCHA Verification
 │
 ▼
Authentication API
 │
 ▼
Server-side Validation
 │
 ▼
Authentication / Account Creation
 │
 ▼
Dashboard
```

The server-side authentication implementation is kept private.

---

## 🖼️ Screenshots

### Login

![Biomation Login](screenshots/login.png)

### Signup

![Biomation Signup](screenshots/signup.png)

### Login Error Handling

![Biomation Login Error](screenshots/loginErr.png)

### Signup Error Handling

![Biomation Signup Error](screenshots/signupErr.png)

---

## 🛠️ Technologies

### Frontend

* React
* JavaScript
* React Router
* React Query
* Tailwind CSS
* GSAP

### Authentication & Security

* Google reCAPTCHA
* Token-based authentication
* Client-side validation
* Server-side validation

### Internationalization

* i18next
* react-i18next

### Data & Backend

The complete Biomation project also includes backend services,
database integration, APIs, and IoT-related components.

These parts are not included in this public showcase repository.

---

## 📂 Repository Structure

```text
Biomation-showcase/
│
├── README.md
│
├── login/
│   └── login.jsx
│
├── signup/
│   └── signup.jsx
│
└── screenshots/
    ├── login.png
    ├── signup.png
    ├── login-error.png
    └── signup-error.png
```

---

## 📊 Dashboard

> **This section will be documented separately.**

The Biomation dashboard contains several major modules for managing and
analyzing agricultural IoT data.

### Modules

* Analysis
* Devices
* Security
* Logs

<!-- Add your own dashboard documentation here. -->

---

## 🔒 Source Code & Privacy

The complete Biomation project is not publicly available because it
contains private application logic and backend implementation.

This repository intentionally contains only selected parts of the project
that demonstrate my development work.

The public showcase does **not** include:

* Backend source code
* Database implementation
* Authentication server implementation
* Private infrastructure
* Environment variables
* API credentials or secrets
* Internal application configuration

---

## 🎯 Project Goals

Biomation was built as a project to explore the development of an
agriculture-focused IoT platform while combining frontend development,
backend systems, data visualization, and connected-device concepts.

The project also serves as an opportunity to experiment with building
larger-scale application architecture rather than isolated components.

---

## 🚀 Future Development

Potential future improvements include:

* Real-time IoT data streaming
* More advanced agricultural analytics
* Improved data visualization
* Automated alerts and notifications
* Additional device integrations
* More detailed security monitoring
* Expanded agricultural insights

---

## 📜 License

This repository is a public showcase of the Biomation project.

The source code provided here may not represent the complete private
Biomation codebase.

````

### How I'd structure your **Dashboard** section

Since you want to write that part yourself, I'd follow the same hierarchy as the actual product:

```md
## 📊 Dashboard

Short explanation of what the dashboard is.

### 📈 Analysis

What problem does it solve?

#### Features

- ...
- ...
- ...

#### Workflow

Explain what the user does from entering the page
to getting the analysis.

#### Screenshots

![Analysis](...)

---

### 📡 Devices

What is the device management system?

#### Structure

Explain:

Client
└── Directory
    └── Subdirectory
        └── Device

#### Features

- ...
- ...
- ...

#### Screenshots

![Devices](...)

---

### 🔐 Security

What does the security page monitor?

#### Security Layers

**Layer 1 — Environment**

...

**Layer 2 — User**

...

#### Features

- ...
- ...
- ...

---

### 📝 Logs

What are the logs for?

#### Features

- ...
- ...
- ...

#### Screenshots

![Logs](...)
````

### The important part: document **what**, not just **how**

For your dashboard, avoid writing something like:

> "I used `useState` to store the selected device and `useEffect` to..."

That's implementation documentation.

Instead, write:

> **Analysis allows users to compare sensor metrics across selected devices and time periods, helping them identify changes in their agricultural environment.**

Then underneath, you can explain the interesting technical implementation.

A good pattern is:

**1. Purpose → 2. Features → 3. User workflow → 4. Technical implementation → 5. Screenshot**

For example:

```text
Analysis
│
├── Purpose
│   └── Why does this page exist?
│
├── Features
│   ├── Date comparison
│   ├── Device comparison
│   ├── Metric selection
│   └── Graph visualization
│
├── User Workflow
│   └── Select device → Select metric → Select period → Analyze
│
├── Technical Highlights
│   ├── React
│   ├── Data visualization
│   ├── API integration
│   └── State management
│
└── Screenshot
```

That will make your README feel much more like a **real engineering project case study** rather than simply a list of technologies.

One other recommendation: **don't over-document it yet.** Since this is your first major public project, a README that takes someone ~3–5 minutes to understand is better than a massive README nobody finishes reading.
