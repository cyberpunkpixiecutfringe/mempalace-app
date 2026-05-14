@echo off
setlocal enabledelayedexpansion

echo Generating mempalace.memory.json...

set OUTPUT=mempalace.memory.json

echo [ > "%OUTPUT%"

set FIRST=1

for %%F in (*.json) do (
    if /I not "%%~nxF"=="mempalace.memory.json" (
        if !FIRST! equ 1 (
            echo   "%%~nxF" >> "%OUTPUT%"
            set FIRST=0
        ) else (
            echo , "%%~nxF" >> "%OUTPUT%"
        )
    )
)

echo ] >> "%OUTPUT%"

echo Done.
pause
