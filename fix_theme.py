import re

with open("src/components/EspaceJeux.tsx", "r") as f:
    content = f.read()

# Update props
content = content.replace(
    "interface EspaceJeuxProps {\n  onClose: () => void;\n}",
    "interface EspaceJeuxProps {\n  onClose: () => void;\n  theme?: 'light' | 'dark';\n}"
)

# Update component signature
content = content.replace(
    "const EspaceJeux: React.FC<EspaceJeuxProps> = ({ onClose }) => {",
    "const EspaceJeux: React.FC<EspaceJeuxProps> = ({ onClose, theme = 'dark' }) => {\n  const isLight = theme === 'light';"
)

# Update main div
content = content.replace(
    '<div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-[#040009] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">',
    '<div className={`relative z-30 isolate min-h-screen overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 ${isLight ? "bg-slate-50 text-slate-900" : "bg-[#040009] text-white"}`}>'
)

# Update background
content = content.replace(
    'className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none opacity-20 mix-blend-screen"',
    'className={`fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none transition-opacity duration-500 ${isLight ? "opacity-5 mix-blend-multiply" : "opacity-20 mix-blend-screen"}`}'
)

# Header Title
content = content.replace(
    '<div className="inline-flex p-4 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-2xl mb-4 shadow-2xl logo-glow-ambient">',
    '<div className={`inline-flex p-4 rounded-2xl mb-4 shadow-2xl transition-colors duration-500 ${isLight ? "bg-purple-100 border border-purple-200 text-purple-600" : "bg-purple-500/20 border border-purple-500/30 text-purple-300 logo-glow-ambient"}`}>'
)
content = content.replace(
    '<h1 className="text-4xl sm:text-6xl font-light tracking-tight text-shimmer mb-3">',
    '<h1 className={`text-4xl sm:text-6xl font-light tracking-tight mb-3 transition-colors duration-500 ${isLight ? "text-slate-800" : "text-shimmer"}`}>'
)
content = content.replace(
    '<p className="text-sm sm:text-lg text-slate-300 font-light max-w-lg mx-auto">',
    '<p className={`text-sm sm:text-lg font-light max-w-lg mx-auto transition-colors duration-500 ${isLight ? "text-slate-600" : "text-slate-300"}`}>'
)

# Cards overlays and text
content = content.replace(
    '<div className="absolute inset-0 bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />',
    '<div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />'
)

content = content.replace(
    'text-3xl font-bold tracking-tight text-white drop-shadow-md',
    'text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}'
)
# Fix the classname quotes for the h3 replacing standard quotes to template literals
content = re.sub(
    r'<h3 className="text-3xl font-bold tracking-tight drop-shadow-md \$\{isLight \? "text-slate-900" : "text-white"\}">',
    r'<h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>',
    content
)

content = content.replace(
    '<p className="text-slate-300 font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">',
    '<p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>'
)

with open("src/components/EspaceJeux.tsx", "w") as f:
    f.write(content)
