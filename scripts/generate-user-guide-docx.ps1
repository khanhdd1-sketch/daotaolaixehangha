param(
  [string]$SourcePath = "docs/HUONG_DAN_SU_DUNG_HE_THONG.md",
  [string]$OutputPath = "docs/HUONG_DAN_SU_DUNG_HE_THONG.docx"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Escape-XmlText {
  param([string]$Value)
  if ($null -eq $Value) { return "" }
  return $Value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
}

function New-ParagraphXml {
  param(
    [string]$Text,
    [string]$Style = ""
  )

  $escaped = Escape-XmlText $Text
  $styleXml = ""
  if ($Style) {
    $styleXml = "<w:pPr><w:pStyle w:val=`"$Style`"/></w:pPr>"
  }

  return "<w:p>${styleXml}<w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>"
}

if (-not (Test-Path -LiteralPath $SourcePath)) {
  throw "Khong tim thay file nguon: $SourcePath"
}

$lines = Get-Content -LiteralPath $SourcePath -Encoding UTF8
$paragraphs = New-Object System.Collections.Generic.List[string]

foreach ($line in $lines) {
  $trimmed = $line.TrimEnd()

  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    $paragraphs.Add("<w:p/>")
    continue
  }

  if ($trimmed.StartsWith("# ")) {
    $paragraphs.Add((New-ParagraphXml -Text $trimmed.Substring(2) -Style "Title"))
    continue
  }

  if ($trimmed.StartsWith("## ")) {
    $paragraphs.Add((New-ParagraphXml -Text $trimmed.Substring(3) -Style "Heading1"))
    continue
  }

  if ($trimmed.StartsWith("### ")) {
    $paragraphs.Add((New-ParagraphXml -Text $trimmed.Substring(4) -Style "Heading2"))
    continue
  }

  if ($trimmed -match '^\d+\.\s+') {
    $paragraphs.Add((New-ParagraphXml -Text $trimmed -Style "ListParagraph"))
    continue
  }

  if ($trimmed.StartsWith("- ")) {
    $paragraphs.Add((New-ParagraphXml -Text ("• " + $trimmed.Substring(2)) -Style "ListParagraph"))
    continue
  }

  $paragraphs.Add((New-ParagraphXml -Text $trimmed))
}

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    $($paragraphs -join "`r`n    ")
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$relsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$documentRelsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

$stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="10"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="9"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="9"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>
'@

$coreXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Huong dan su dung he thong thi thu trung tam day lai xe</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-05-25T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-05-25T00:00:00Z</dcterms:modified>
</cp:coreProperties>
'@

$appXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
</Properties>
'@

$tempRoot = Join-Path $env:TEMP ("drive-school-docx-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot "_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot "word") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot "word\_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot "docProps") | Out-Null

Set-Content -LiteralPath (Join-Path $tempRoot "[Content_Types].xml") -Value $contentTypesXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot "_rels\.rels") -Value $relsXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot "word\document.xml") -Value $documentXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot "word\styles.xml") -Value $stylesXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot "word\_rels\document.xml.rels") -Value $documentRelsXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot "docProps\core.xml") -Value $coreXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot "docProps\app.xml") -Value $appXml -Encoding UTF8

$outputFullPath = Resolve-Path -LiteralPath (Split-Path -Path $OutputPath -Parent) -ErrorAction SilentlyContinue
if (-not $outputFullPath) {
  New-Item -ItemType Directory -Path (Split-Path -Path $OutputPath -Parent) -Force | Out-Null
}

$zipPath = Join-Path $env:TEMP ("drive-school-docx-" + [guid]::NewGuid().ToString("N") + ".zip")
if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

Compress-Archive -Path (Join-Path $tempRoot "*") -DestinationPath $zipPath -Force
[System.IO.File]::Copy((Resolve-Path -LiteralPath $zipPath), (Join-Path (Get-Location) $OutputPath), $true)
Remove-Item -LiteralPath $zipPath -Force
Remove-Item -LiteralPath $tempRoot -Recurse -Force

Write-Output "Generated: $OutputPath"
