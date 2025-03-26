function Get-Tree($path, $indent = "") {
    $items = Get-ChildItem -Path $path -Directory -Force | Where-Object { $_.Name -ne "node_modules" } | Sort-Object Name
    foreach ($item in $items) {
        Write-Output "$indent|-- $($item.Name)"
        Get-Tree -path $item.FullName -indent "$indent    "
    }
}

Get-Tree -path .
