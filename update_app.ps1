$content = Get-Content -Path "src/App.tsx" -Raw -Encoding UTF8

# 1. Add lazy import
$importStr = 'const Calculateur13emeV2 = lazy(() => import("./components/Calculateur13emeV2.tsx"))'
$newImportStr = $importStr + "`n" + 'const CalculateurSFTV2 = lazy(() => import("./components/CalculateurSFTV2.tsx"))'
$content = $content.Replace($importStr, $newImportStr)

# 2. Add Users to lucide-react imports if not there
if ($content -notmatch 'Users,') {
    $content = $content.Replace("TrendingUp,", "TrendingUp,`n  Users,")
}

# 3. Change grid to sm:grid-cols-2 lg:grid-cols-4
$content = $content.Replace('grid grid-cols-1 md:grid-cols-3 gap-8', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8')

# 4. Add card
$cardStr = @"
                {/* Carte SFT */}
                <button
                  onClick={() => openCalculator('sft')}
                  className="group relative bg-white dark:bg-slate-800/80 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-8 shadow-sm hover:shadow-lg dark:hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/40 hover:scale-105 hover:-translate-y-2 transition-transform duration-150"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 dark:from-purple-500/5 via-transparent to-fuchsia-50/50 dark:to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-2xl"></div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-purple-100 dark:from-slate-900/80 to-fuchsia-100 dark:to-slate-800/80 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-500/30">
                      <Users className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">SFT</h4>
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium dark:font-normal text-sm">Supplément Familial de Traitement</p>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold dark:font-semibold">
                      <span className="text-sm">Ouvrir le calculateur</span>
                    </div>
                  </div>
                </button>
              </div>
"@
$content = $content.Replace("              </div>`n            </div>`n          )}`n`n          {/* Contenu du calculateur sélectionné */}", $cardStr + "`n            </div>`n          )}`n`n          {/* Contenu du calculateur sélectionné */}")

# 5. Add rendering component
$renderStr = @"
          {activeCalculator === 'sft' && (
            <Suspense fallback={<ViewLoader />}>
              <div className="calc-tool-enter"><CalculateurSFTV2 onClose={() => setActiveCalculator(null)} /></div>
            </Suspense>
          )}
"@
$content = $content.Replace("          {activeCalculator === '13eme' && (", $renderStr + "`n          {activeCalculator === '13eme' && (")

Set-Content -Path "src/App.tsx" -Value $content -Encoding UTF8
Write-Host "App.tsx updated"
