# 🏏 Fast Bowling ACWR Tracker

https://github.com/user-attachments/assets/a81c2a3e-98c2-4c75-9c29-3721a3de3a91

A simple and interactive web-based **Fast Bowling Acute:Chronic Workload Ratio (ACWR) Tracker** designed to help fast bowlers, coaches, and academies monitor bowling workload over a four-week training period.

The tracker records daily bowling workload from **nets/practice and matches**, calculates total balls bowled, provides weekly workload summaries, visualizes workload trends, and allows the completed sheet to be printed or exported as a PDF.

---

## 📌 Features

### 👤 Player Profile
Record important player information:

- Player Name
- Player ID
- Date of Birth
- Bowling Role
- Team / Academy
- Tracking Month

### 🏏 Daily Bowling Workload

Track bowling workload for each day of the month:

- Nets / Practice Overs
- Nets / Practice Balls
- Match Overs
- Match Balls
- Total Balls Bowled
- Player Feeling / Fatigue Status

The tracker supports workload entries such as:

- Normal
- Moderate
- Mod+
- Sore
- Rest/Gym

### 📊 Weekly Workload Summary

The application automatically calculates:

- Weekly total balls
- Four-week workload history
- Acute workload
- Chronic workload
- ACWR
- Risk zone

> **Note:** ACWR requires four previous weeks of workload history before it can be calculated.

### 📈 Workload Trend

A visual weekly bar chart displays the bowling workload and total balls logged during the tracking period.

### 💾 Local Data Storage

Player and workload information is automatically saved in the browser using:

```text
localStorage



