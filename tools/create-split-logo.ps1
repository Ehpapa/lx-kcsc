param(
  [string]$AssetDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) "assets")
)

Add-Type -AssemblyName System.Drawing

function Get-GoldPixel {
  param(
    [System.Drawing.Color]$Pixel
  )

  $goldColors = @(
    [pscustomobject]@{ R = 189.0; G = 183.0; B = 145.0 }
    [pscustomobject]@{ R = 169.0; G = 158.0; B = 86.0 }
  )
  $bestError = [Double]::PositiveInfinity
  $bestAlpha = 0.0
  $bestGold = $goldColors[0]

  foreach ($gold in $goldColors) {
    $alphaSamples = @(
      (255.0 - $Pixel.R) / (255.0 - $gold.R)
      (255.0 - $Pixel.G) / (255.0 - $gold.G)
      (255.0 - $Pixel.B) / (255.0 - $gold.B)
    )
    $alphaValue = [Math]::Min(
      1.0,
      [Math]::Max(0.0, ($alphaSamples | Measure-Object -Average).Average)
    )
    $predictedR = 255.0 - $alphaValue * (255.0 - $gold.R)
    $predictedG = 255.0 - $alphaValue * (255.0 - $gold.G)
    $predictedB = 255.0 - $alphaValue * (255.0 - $gold.B)
    $colorError =
      [Math]::Pow($predictedR - $Pixel.R, 2) +
      [Math]::Pow($predictedG - $Pixel.G, 2) +
      [Math]::Pow($predictedB - $Pixel.B, 2)

    if ($colorError -lt $bestError) {
      $bestError = $colorError
      $bestAlpha = $alphaValue
      $bestGold = $gold
    }
  }

  $alpha = [Math]::Min(255, [Math]::Max(0, [Math]::Round($bestAlpha * 255)))
  if ($alpha -lt 8) {
    $alpha = 0
  }

  return [System.Drawing.Color]::FromArgb(
    $alpha,
    [int]$bestGold.R,
    [int]$bestGold.G,
    [int]$bestGold.B
  )
}

function Convert-Symbol {
  param(
    [string]$InputPath,
    [string]$OutputPath
  )

  $source = [System.Drawing.Bitmap]::new((Resolve-Path $InputPath).Path)
  $output = [System.Drawing.Bitmap]::new(
    $source.Width,
    $source.Height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  try {
    for ($y = 0; $y -lt $source.Height; $y++) {
      for ($x = 0; $x -lt $source.Width; $x++) {
        $pixel = $source.GetPixel($x, $y)
        $maximum = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
        $minimum = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))

        if (($maximum - $minimum) -le 4) {
          $result = [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
        } else {
          $result = Get-GoldPixel -Pixel $pixel
        }

        $output.SetPixel($x, $y, $result)
      }
    }

    $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $source.Dispose()
    $output.Dispose()
  }
}

function Convert-Wordmark {
  param(
    [string]$InputPath,
    [string]$OutputPath
  )

  $source = [System.Drawing.Bitmap]::new((Resolve-Path $InputPath).Path)
  $output = [System.Drawing.Bitmap]::new(
    $source.Width,
    $source.Height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  try {
    for ($y = 0; $y -lt $source.Height; $y++) {
      for ($x = 0; $x -lt $source.Width; $x++) {
        $pixel = $source.GetPixel($x, $y)
        $gray = ($pixel.R + $pixel.G + $pixel.B) / 3.0
        $alpha = if ($gray -ge 245) {
          0
        } else {
          [Math]::Min(255, [Math]::Max(0, [Math]::Round((255 - $gray) * 1.18)))
        }
        $result = [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255)
        $output.SetPixel($x, $y, $result)
      }
    }

    $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $source.Dispose()
    $output.Dispose()
  }
}

Convert-Symbol `
  -InputPath (Join-Path $AssetDirectory "union-symbol-source.png") `
  -OutputPath (Join-Path $AssetDirectory "union-symbol.png")

Convert-Wordmark `
  -InputPath (Join-Path $AssetDirectory "union-wordmark-source.png") `
  -OutputPath (Join-Path $AssetDirectory "union-wordmark-white.png")
