Write-Host "Script start for checking if files archived successfully"

try{
    if(Test-Path 'Path til websak Mappe') {
        Write-Host "Found docx files with error"
        $ettlevBody= @{"failedToArchiveBehandlingsNr"= @((dir 'Path til websak mappe').BaseName )} | ConvertTo-Json
        $slackUri = “slack hook url”
        $slackBody = ConvertTo-Json @{
            username="Service bruker for etterlevelse-websak integrasjon"
            pretext="Websak arkivering error: Filene ble ikke flyttet til websak"
            icon_emoji= "computer"
            text= $ettlevBody
        }

        Invoke-RestMethod -Method Post -Uri $slackUri -Proxy "" -Body $slackBody -ContentType "application/json"

    }else {
        Write-Host "Successfully archived all files"
        $ettlevBody= @{"failedToArchiveBehandlingsNr"= @()} | ConvertTo-Json
    }

    Write-Host "Getting azure token"
    $adsecret=Get-Secret -Name 'EtterlevelseSecret.ADsecrets' -AsPlainText
    $tenantId = $adsecret.tenantId
    $uri = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
    $body =@{
        grant_type = "client_credentials"
        client_id = $adsecret.clientId
        client_secret = $adsecret.secret
        scope = "api://dev-gcp.teamdatajegerne.etterlevelse-backend/.default"
    }

    $response = Invoke-RestMethod -Method Post -Uri $uri -Proxy "Proxy address” -Body $body -ContentType "application/x-www-form-urlencoded"
    Write-Host $response.access_token

    $header = @{
        Authorization = "System " + $response.access_token
    }

    Invoke-RestMethod –Uri “URL for etterlevelse api for status oppdatering” -Method PUT -Headers $header -Body $ettlevBody -ContentType 'application/json'

} catch {

    Write-Host “Noe Feilet $($_.Exception.Message)”
    “Noe feilet $(Get-Date). Error: $($_.Exception.Message)” |
            Out-File C:\Users\srv-etterlev-arkiv\websak_scripts\error_folder\Error_Result_$(get-date -f yyyy-MM-dd-HH-MM-ss).txt
}

Write-Host "Script done"