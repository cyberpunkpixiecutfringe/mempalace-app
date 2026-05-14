@echo off
setlocal enabledelayedexpansion

echo Generating mempalace.memory.json...
set OUTPUT=MemPalace-Data\mempalace.memory.json

echo [ > "%OUTPUT%"

set FIRST=1

for %%F in (MemPalace-Data\*.json MemPalace-Data\*.mpmem) do (
    if !FIRST! equ 1 (
        echo   "%%~nxF" >> "%OUTPUT%"
        set FIRST=0
    ) else (
        echo , "%%~nxF" >> "%OUTPUT%"
    )
)

echo ] >> "%OUTPUT%"

echo Done.
pause
