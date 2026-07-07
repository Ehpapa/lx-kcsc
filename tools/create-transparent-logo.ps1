param(
  [string]$InputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "assets\union-logo.png"),
  [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "assets\union-logo-white.png")
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new((Resolve-Path $InputPath).Path)
$output = [System.Drawing.Bitmap]::new(
  $source.Width,
  $source.Height,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)

$goldColors = @(
  [pscustomobject]@{ R = 189.0; G = 183.0; B = 145.0 }
  [pscustomobject]@{ R = 169.0; G = 158.0; B = 86.0 }
)

try {
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $maximum = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
      $minimum = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
      $chroma = $maximum - $minimum

      if ($chroma -le 4) {
        # The source uses neutral grays for all lettering and white for the
        # background. Convert gray darkness into white opacity.
        $gray = ($pixel.R + $pixel.G + $pixel.B) / 3.0
        $alpha = [Math]::Min(255, [Math]::Max(0, [Math]::Round((255 - $gray) * 1.18)))
        $result = [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255)
      } else {
        # Recover the two original gold inks from their antialiased,
        # white-matted edge pixels and retain a clean alpha edge.
        $bestError = [Double]::PositiveInfinity
        $bestAlpha = 0.0
        $bestGold = $goldColors[0]

        foreach ($gold in $goldColors) {
          $alphaSamples = @(
            (255.0 - $pixel.R) / (255.0 - $gold.R)
            (255.0 - $pixel.G) / (255.0 - $gold.G)
            (255.0 - $pixel.B) / (255.0 - $gold.B)
          )
          $alphaValue = [Math]::Min(1.0, [Math]::Max(0.0, ($alphaSamples | Measure-Object -Average).Average))
          $predictedR = 255.0 - $alphaValue * (255.0 - $gold.R)
          $predictedG = 255.0 - $alphaValue * (255.0 - $gold.G)
          $predictedB = 255.0 - $alphaValue * (255.0 - $gold.B)
          $colorError =
            [Math]::Pow($predictedR - $pixel.R, 2) +
            [Math]::Pow($predictedG - $pixel.G, 2) +
            [Math]::Pow($predictedB - $pixel.B, 2)

          if ($colorError -lt $bestError) {
            $bestError = $colorError
            $bestAlpha = $alphaValue
            $bestGold = $gold
          }
        }

        $alpha = [Math]::Min(255, [Math]::Max(0, [Math]::Round($bestAlpha * 255)))
        $result = [System.Drawing.Color]::FromArgb(
          $alpha,
          [int]$bestGold.R,
          [int]$bestGold.G,
          [int]$bestGold.B
        )
      }

      $output.SetPixel($x, $y, $result)
    }
  }

  $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $source.Dispose()
  $output.Dispose()
}
