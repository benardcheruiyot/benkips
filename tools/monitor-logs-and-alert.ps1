# PowerShell script to monitor logs and send alert on repeated errors
# Requires: PowerShell 5+, Send-MailMessage configured, or use your own alerting method

$logFile = "../logs/err.log"
$alertEmail = "your-alert-email@example.com"  # Set your alert email here
$threshold = 5  # Number of errors before alert
$intervalSeconds = 60  # How often to check (seconds)
$errorPattern = "token|fail|exception|unhandled|mpesa|error"  # Regex for error keywords

function Send-Alert($subject, $body) {
    # Example: Send email (customize as needed)
    Send-MailMessage -To $alertEmail -From "noreply@yourdomain.com" -Subject $subject -Body $body -SmtpServer "smtp.yourdomain.com"
}

$lastLine = 0
while ($true) {
    if (Test-Path $logFile) {
        $lines = Get-Content $logFile
        $newLines = $lines[$lastLine..($lines.Length-1)]
        $matches = $newLines | Select-String -Pattern $errorPattern -SimpleMatch
        if ($matches.Count -ge $threshold) {
            $subject = "[ALERT] MKOPAJI: $($matches.Count) errors detected in err.log"
            $body = ($matches | Select-Object -Last 10 | Out-String)
            Send-Alert $subject $body
        }
        $lastLine = $lines.Length
    }
    Start-Sleep -Seconds $intervalSeconds
}