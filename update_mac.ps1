$content = Get-Content -Path "src/components/MacMenuBar.tsx" -Raw -Encoding UTF8

$newBtn = @"
                  <button onClick={() => selectCalculator('sft')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex justify-between items-center">
                    <span>Calculateur SFT</span>
                    <span className="text-[10px] opacity-40">⌘S</span>
                  </button>
"@

$content = $content.Replace('                    <span className="text-[10px] opacity-40">⌘D</span>
                  </button>', '                    <span className="text-[10px] opacity-40">⌘D</span>
                  </button>
' + $newBtn)

Set-Content -Path "src/components/MacMenuBar.tsx" -Value $content -Encoding UTF8
Write-Host "MacMenuBar updated"
