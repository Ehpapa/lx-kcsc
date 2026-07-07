param(
  [int]$Port = 4173,
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$resolvedRoot = [System.IO.Path]::GetFullPath($Root)
$listener = [System.Net.Sockets.TcpListener]::new(
  [System.Net.IPAddress]::Loopback,
  $Port
)
$listener.Start()

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".mp4"  = "video/mp4"
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new(
      $stream,
      [System.Text.Encoding]::ASCII,
      $false,
      1024,
      $true
    )
    $requestLine = $reader.ReadLine()

    while (-not [string]::IsNullOrEmpty($reader.ReadLine())) {
      # Consume the remaining request headers.
    }

    $requestTarget = if ($requestLine -match "^[A-Z]+ ([^ ]+) HTTP/") {
      $Matches[1]
    } else {
      "/"
    }

    $requestPath = ($requestTarget -split "\?", 2)[0]
    $relativePath = [Uri]::UnescapeDataString($requestPath.TrimStart("/"))

    if ([string]::IsNullOrWhiteSpace($relativePath)) {
      $relativePath = "index.html"
    }

    $filePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedRoot $relativePath))

    if (-not $filePath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
      $header = [System.Text.Encoding]::ASCII.GetBytes(
        "HTTP/1.1 403 Forbidden`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      )
      $stream.Write($header, 0, $header.Length)
      $stream.Write($body, 0, $body.Length)
      $client.Close()
      continue
    }

    if (-not [System.IO.File]::Exists($filePath)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
      $header = [System.Text.Encoding]::ASCII.GetBytes(
        "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      )
      $stream.Write($header, 0, $header.Length)
      $stream.Write($body, 0, $body.Length)
      $client.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $contentType = if ($mimeTypes.ContainsKey($extension)) {
      $mimeTypes[$extension]
    } else {
      "application/octet-stream"
    }

    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $header = [System.Text.Encoding]::ASCII.GetBytes(
      "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
    )
    $stream.Write($header, 0, $header.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
    $client.Close()
  }
} finally {
  $listener.Stop()
}
