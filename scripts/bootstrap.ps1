param(
  [Parameter(Mandatory=$true)][ValidatePattern('^\d{12}$')][string]$AccountId,
  [ValidatePattern('^[a-z]{2}-[a-z]+-\d+$')][string]$Region = 'us-east-1',
  [string]$ExistingProviderArn = ''
)
$ErrorActionPreference = 'Stop'
function Invoke-Checked([string]$Program, [string[]]$Arguments) {
  & $Program @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Program failed with exit code $LASTEXITCODE" }
}
$actual = & aws sts get-caller-identity --query Account --output text
if ($LASTEXITCODE -ne 0 -or $actual.Trim() -ne $AccountId) { throw 'The AWS login does not match AccountId.' }
$env:AWS_ACCOUNT_ID = $AccountId
$env:AWS_REGION = $Region
$policyArn = "arn:aws:iam::${AccountId}:policy/evan-hyer-site-cfn"
$policy = (Get-Content -Raw -LiteralPath 'infra/bootstrap-execution-policy.json').Replace('__ACCOUNT__', $AccountId).Replace('__REGION__', $Region)
$temporary = Join-Path ([System.IO.Path]::GetTempPath()) ('site-policy-' + [guid]::NewGuid().ToString() + '.json')
try {
  [System.IO.File]::WriteAllText($temporary, $policy)
  Invoke-Checked 'aws' @('iam', 'create-policy', '--policy-name', 'evan-hyer-site-cfn', '--policy-document', "file://$temporary")
  Invoke-Checked 'npx.cmd' @('cdk', 'bootstrap', "aws://$AccountId/$Region", '--cloudformation-execution-policies', $policyArn)
  $identityArgs = @('cdk', 'deploy', 'EvanHyerIdentity', '--require-approval', 'never')
  if ($ExistingProviderArn) { $identityArgs += @('-c', "existingProviderArn=$ExistingProviderArn") }
  Invoke-Checked 'npx.cmd' $identityArgs
} finally {
  Remove-Item -LiteralPath $temporary -ErrorAction SilentlyContinue
}
