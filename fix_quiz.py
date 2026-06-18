import re

with open("src/components/FAQQuiz.tsx", "r") as f:
    content = f.read()

# Update wrapper
content = content.replace(
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">',
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-[#040009] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">'
)

# Grid background
content = content.replace(
    "backgroundImage: 'linear-gradient(rgba(255,28,116,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,28,116,0.015) 1px, transparent 1px)'",
    "backgroundImage: 'linear-gradient(rgba(249,115,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px)'"
)

# Card Wrapper
content = content.replace(
    'className="bg-gradient-to-br from-slate-800/80 via-purple-900/40 to-slate-800/80 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 relative overflow-hidden transition-all duration-300 card-border-sweep card-border-sweep-orange"',
    'className="bg-[#040009] backdrop-blur rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(249,115,22,0.3)] border-[3px] border-orange-500/60 relative overflow-hidden transition-all duration-300 card-border-sweep card-border-sweep-orange"'
)

# Buttons (Options) logic
content = content.replace(
    'btnClass += "border-slate-700/50 bg-slate-900/40 text-slate-100 hover:border-orange-500/60 hover:bg-orange-500/10 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/5 active:scale-[0.99] cursor-pointer";',
    'btnClass += "border-[2px] border-orange-500/30 bg-[#040009] text-orange-100 hover:border-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.6)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer";'
)
content = content.replace(
    'btnClass += "border-green-500 bg-green-950/40 text-green-200 ring-2 ring-green-900/30 animate-pulse-green";',
    'btnClass += "border-[2px] border-green-500 bg-[#040009] text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse-green";'
)
content = content.replace(
    'btnClass += "border-red-500 bg-red-950/40 text-red-200 ring-2 ring-red-900/30 animate-shake";',
    'btnClass += "border-[2px] border-red-500 bg-[#040009] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-shake";'
)

with open("src/components/FAQQuiz.tsx", "w") as f:
    f.write(content)

