import re

with open("src/components/MemoryRH.tsx", "r") as f:
    content = f.read()

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

# Card Back
content = content.replace(
    '<div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-purple-950 border-2 border-purple-500/20 rounded-2xl flex flex-col items-center justify-center text-white backface-hidden shadow-md hover:shadow-lg transition-all duration-150">',
    '<div className="absolute inset-0 bg-[#040009] border-[3px] border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] rounded-2xl flex flex-col items-center justify-center text-cyan-400 backface-hidden transition-all duration-300">'
)
content = content.replace(
    '<HelpCircle className="w-8 h-8 text-purple-400/80 animate-pulse" />',
    '<HelpCircle className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />'
)

# Card Front container classes base
content = content.replace(
    '<div className={`absolute inset-0 border-2 rounded-2xl p-3 flex flex-col items-center justify-center text-center text-xs font-semibold backface-hidden rotate-y-180 shadow-md ${',
    '<div className={`absolute inset-0 border-[3px] rounded-2xl p-3 flex flex-col items-center justify-center text-center text-xs font-semibold backface-hidden rotate-y-180 transition-all duration-300 ${'
)

# Card Front colors
content = content.replace(
    '? "bg-green-950/50 border-green-500 text-green-200"',
    '? "bg-[#040009] border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]"'
)
content = content.replace(
    '? "bg-gradient-to-br from-purple-950/70 to-slate-900 border-purple-500/60 text-white"',
    '? "bg-[#040009] border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.6)]"'
)
content = content.replace(
    ': "bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-cyan-500/60 text-cyan-100"',
    ': "bg-[#040009] border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]"'
)

with open("src/components/MemoryRH.tsx", "w") as f:
    f.write(content)

