Add-Type -AssemblyName System.Drawing

$publicDir = "C:\Users\jprudot\Desktop\proyectos\Monday\bulk-update-pro\public"
$galleryDir = "$publicDir\gallery"

# Create gallery directory
if (!(Test-Path $galleryDir)) {
    New-Item -ItemType Directory -Path $galleryDir
}

# Gallery images (1920x960)
$galleryImages = @("BUP001.png", "BUP002.png", "BUP003.png", "BUP004.png", "BUP005.png")

foreach ($img in $galleryImages) {
    $srcPath = Join-Path $publicDir $img
    $destPath = Join-Path $galleryDir "gallery-$img"

    $src = [System.Drawing.Image]::FromFile($srcPath)
    $dest = New-Object System.Drawing.Bitmap 1920, 960
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, 1920, 960)
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
    Write-Host "Created: $destPath"
}

# App Card image (592x348) - using BUP005 (Preview Changes)
$srcPath = Join-Path $publicDir "BUP005.png"
$destPath = Join-Path $galleryDir "app-card.png"

$src = [System.Drawing.Image]::FromFile($srcPath)
$dest = New-Object System.Drawing.Bitmap 592, 348
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 592, 348)
$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$dest.Dispose()
$src.Dispose()
Write-Host "Created: $destPath"

Write-Host "`nDone! Images saved to: $galleryDir"
