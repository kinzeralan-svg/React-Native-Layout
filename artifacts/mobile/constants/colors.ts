const primary = "#4ECDC4";
const primaryDark = "#3DBDB5";
const accent = "#6C63FF";
const teal = "#4ECDC4";
const tealLight = "#A8E6E3";
const tealDark = "#2A9D95";
const purple = "#6C63FF";
const purpleLight = "#B8B4FF";
const navy = "#1A1A2E";
const navyLight = "#16213E";
const green = "#45B7D1";
const white = "#FFFFFF";
const offWhite = "#F8FFFE";
const lightGray = "#F2F5F8";
const medGray = "#B0BEC5";
const darkGray = "#546E7A";

export const Colors = {
  primary,
  primaryDark,
  accent,
  teal,
  tealLight,
  tealDark,
  purple,
  purpleLight,
  navy,
  navyLight,
  green,
  white,
  offWhite,
  lightGray,
  medGray,
  darkGray,

  gradient: {
    primary: [teal, "#5F9EA0"] as [string, string],
    hero: ["#4ECDC4", "#2A9D95"] as [string, string],
    welcome: ["#4ECDC4", "#45B7D1"] as [string, string],
    wallet: ["#6C63FF", "#4ECDC4"] as [string, string],
    card: ["#1A2744", "#0F1729"] as [string, string],
    dark: ["#1A1A2E", "#16213E"] as [string, string],
  },

  text: {
    primary: "#1A1A2E",
    secondary: "#546E7A",
    muted: "#90A4AE",
    onDark: "#FFFFFF",
    onDarkMuted: "rgba(255,255,255,0.7)",
  },

  background: {
    screen: "#F8FFFE",
    card: "#FFFFFF",
    dark: "#1A1A2E",
    darkCard: "#16213E",
    input: "#F2F5F8",
  },

  border: {
    light: "#E8EDF0",
    medium: "#CFD8DC",
  },

  tab: {
    active: teal,
    inactive: medGray,
  },

  status: {
    success: "#4CAF50",
    error: "#EF5350",
    warning: "#FF9800",
  },
};

export default Colors;
