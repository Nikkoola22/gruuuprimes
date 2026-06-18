import re

with open("src/components/CasseBrique.tsx", "r") as f:
    content = f.read()

# Update wrapper
content = content.replace(
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1a0022] via-[#2a0033] to-[#3a0055] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">',
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-[#040009] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">'
)

# Grid background to synthwave
content = content.replace(
    "backgroundImage: 'linear-gradient(rgba(255,120,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,120,0,0.015) 1px, transparent 1px)'",
    "backgroundImage: 'linear-gradient(rgba(255,0,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom'"
)

# Card Wrapper
content = content.replace(
    'className="max-w-3xl mx-auto bg-gradient-to-br from-slate-900/80 via-orange-950/20 to-slate-900/80 backdrop-blur rounded-3xl p-4 sm:p-6 shadow-2xl border border-orange-500/30 card-border-sweep card-border-sweep-orange relative overflow-hidden"',
    'className="max-w-3xl mx-auto bg-[#040009] backdrop-blur rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(255,0,255,0.3)] border-[3px] border-fuchsia-500/60 card-border-sweep card-border-sweep-orange relative overflow-hidden"'
)

# Canvas
content = content.replace(
    'className="bg-black/60 rounded-2xl border-2 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] cursor-none max-w-full block"',
    'className="bg-[#000000] rounded-2xl border-[3px] border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.4)] cursor-none max-w-full block"'
)

with open("src/components/CasseBrique.tsx", "w") as f:
    f.write(content)

