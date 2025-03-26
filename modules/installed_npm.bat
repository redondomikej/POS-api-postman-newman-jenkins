@echo off

echo Note: You can skip this and proceed with data_validation.bat if the 'node_modules' folder is existing.
echo Thank you for understanding. Have a great day.

:choice
echo.
echo Do you want to install 'node_modules' by running 'npm i'? (Press 1 for Yes, 0 for No)
choice /c:10 /n

if errorlevel 2 (
    echo Skipping the installation of 'node_modules.'
    goto continue_script
) else if errorlevel 1 (
    cd src
    echo Installing project dependencies...
    npm i
    echo Installation successful, deleting this script...
    del "%~f0"
    goto continue_script
) else (
    echo Invalid choice. Please press 1 to install 'node_modules' or 0 to skip.
    goto choice
)

:continue_script
echo Continue with your script here
