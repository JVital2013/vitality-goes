#Shamelessly borrowed from https://stackoverflow.com/questions/417798/ini-file-parsing-in-powershell
Function Get-Config
{
    $ini = @{}

    # Create a default section if none exist in the file. Like a java prop file.
    $section = "NO_SECTION"
    $ini[$section] = @{}

    switch -regex -file "$PSScriptRoot\scriptconfig.ini"
    {
        "^\[(.+)\]$"
        {
            $section = $matches[1].Trim()
            $ini[$section] = @{}
        }

        "^\s*([^#].+?)\s*=\s*(.*)"
        {
            $name,$value = $matches[1..2]
            if (!($name.StartsWith(";")))
            {
                $ini[$section][$name] = $value.Trim()
                $ini[$section][$name] = $value.Trim("`"'")
            }
        }
    }
    $ini['NO_SECTION']
}