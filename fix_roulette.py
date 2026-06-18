import re

with open("src/components/RouletteQVT.tsx", "r") as f:
    content = f.read()

# Update colors
content = content.replace(
    'const SECTORS = [\n  { name: "QVT 🧘", color: "#3b82f6", category: "qvt" },         // Blue\n  { name: "MANAGEMENT 🤝", color: "#10b981", category: "management" }, // Green\n  { name: "CARRIÈRE 🚀", color: "#8b5cf6", category: "carriere" },   // Purple\n  { name: "DÉTENTE ☕", color: "#f97316", category: "detente" },     // Orange\n  { name: "QVT 🧘", color: "#1d4ed8", category: "qvt" },         // Darker Blue\n  { name: "MANAGEMENT 🤝", color: "#047857", category: "management" }, // Darker Green\n  { name: "CARRIÈRE 🚀", color: "#6d28d9", category: "carriere" },   // Darker Purple\n  { name: "DÉTENTE ☕", color: "#c2410c", category: "detente" }      // Darker Orange\n];',
    'const SECTORS = [\n  { name: "QVT 🧘", color: "#0ea5e9", category: "qvt" },         // Cyan Neon\n  { name: "MANAGEMENT 🤝", color: "#ec4899", category: "management" }, // Pink Neon\n  { name: "CARRIÈRE 🚀", color: "#8b5cf6", category: "carriere" },   // Purple Neon\n  { name: "DÉTENTE ☕", color: "#14b8a6", category: "detente" },     // Teal Neon\n  { name: "QVT 🧘", color: "#0284c7", category: "qvt" },         // Darker Cyan\n  { name: "MANAGEMENT 🤝", color: "#be185d", category: "management" }, // Darker Pink\n  { name: "CARRIÈRE 🚀", color: "#6d28d9", category: "carriere" },   // Darker Purple\n  { name: "DÉTENTE ☕", color: "#0f766e", category: "detente" }      // Darker Teal\n];'
)

# Update wrapper
content = content.replace(
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1a0022] via-[#2a0033] to-[#3a0055] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">',
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-[#040009] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">'
)

# Grid background
content = content.replace(
    "backgroundImage: 'linear-gradient(rgba(255,28,116,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,28,116,0.015) 1px, transparent 1px)'",
    "backgroundImage: 'linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.05) 1px, transparent 1px)'"
)

# Wheel container styles
content = content.replace(
    'className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 rounded-full opacity-60 blur-xl animate-pulse"',
    'className="absolute -inset-6 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 rounded-full opacity-80 blur-2xl animate-pulse"'
)
content = content.replace(
    'className="absolute inset-[-6px] rounded-full border-[6px] border-slate-950 shadow-2xl z-20 pointer-events-none ring-2 ring-purple-500/40"',
    'className="absolute inset-[-10px] rounded-full border-[10px] border-[#040009] shadow-[0_0_50px_rgba(14,165,233,0.5)] z-20 pointer-events-none ring-4 ring-cyan-500/50"'
)

# Buttons
content = content.replace(
    'from-[#2a0033] via-slate-950 to-[#12001e]',
    'from-[#040009] via-slate-900 to-[#040009]'
)

with open("src/components/RouletteQVT.tsx", "w") as f:
    f.write(content)

