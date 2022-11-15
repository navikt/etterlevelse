Write-Host “Skript Start”

try {

    curl “URL for etterlevelse arkiv eksport” -o C:\Users\srv-etterlev-arkiv\websak_scripts\archive_folder\etterlevelser.zip
    expand-archive C:\Users\srv-etterlev-arkiv\websak_scripts\archive_folder\etterlevelser.zip C:\Users\srv-etterlev-arkiv\websak_scripts\archive_folder\archive_files
    rm C:\Users\srv-etterlev-arkiv\websak_scripts\archive_folder\etterlevelser.zip

    if(Test-Path "C:\Users\srv-etterlev-arkiv\websak_scripts\archive_folder\archive_files\*") {
        Write-Host("Moving files to Websak")
        Write-Host "Moving doc files"
        Copy-Item C:\users\srv-etterlev-arkiv\websak_scripts\archive_folder\archive_files\*.docx “path til websak mappe”
        Write-Host "Moving xml files"
        Copy-Item C:\users\srv-etterlev-arkiv\websak_scripts\archive_folder\archive_files\*.xml “path til websak mappe”
        Write-Host "transfer completed, emptying archive folder"
        rm C:\Users\srv-etterlev-arkiv\websak_scripts\archive_folder\archive_files\*
    } else {
        Write-Host "Archive files is empty, no files to archive"
    }
}

catch {
    Write-Host “Noe Feilet $($_.Exception.Message)”
    “Noe feilet $(Get-Date). Error: $($_.Exception.Message)” |
            Out-File C:\Users\srv-etterlev-arkiv\websak_scripts\error_folder\Error_Export_$(get-date -f yyyy-MM-dd-HH-MM-ss).txt

}

Write-Host “Skript Ferdig”