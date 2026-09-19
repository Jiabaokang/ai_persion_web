import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const script = resolve(process.cwd(), 'scripts/deploy-artifact.sh')
const workspaces: string[] = []

afterEach(() => {
  for (const workspace of workspaces.splice(0)) rmSync(workspace, { recursive: true, force: true })
})

function prepareDeployment(health = 'ok') {
  const workspace = mkdtempSync(resolve(tmpdir(), 'jbksy-deploy-test-'))
  workspaces.push(workspace)
  const appDir = resolve(workspace, 'app')
  const candidate = resolve(workspace, 'candidate')
  const fakeBin = resolve(workspace, 'bin')
  const artifact = resolve(workspace, 'output.tar.gz')

  mkdirSync(resolve(appDir, '.output/server'), { recursive: true })
  mkdirSync(resolve(candidate, 'server'), { recursive: true })
  mkdirSync(fakeBin)
  writeFileSync(resolve(appDir, '.output/server/index.mjs'), 'export default "old"')
  writeFileSync(resolve(candidate, 'server/index.mjs'), 'export default "new"')
  writeFileSync(resolve(fakeBin, 'systemctl'), '#!/bin/sh\nexit 0\n')
  writeFileSync(resolve(fakeBin, 'sleep'), '#!/bin/sh\nexit 0\n')
  writeFileSync(resolve(fakeBin, 'curl'), `#!/bin/sh\n[ "${health}" = ok ]\n`)
  chmodSync(resolve(fakeBin, 'systemctl'), 0o755)
  chmodSync(resolve(fakeBin, 'sleep'), 0o755)
  chmodSync(resolve(fakeBin, 'curl'), 0o755)
  execFileSync('tar', ['-C', candidate, '-czf', artifact, '.'])

  return {
    appDir,
    artifact,
    env: { ...process.env, APP_DIR: appDir, PATH: `${fakeBin}:${process.env.PATH}` },
  }
}

describe('production artifact deployment', () => {
  it('rejects an incomplete artifact before replacing the live output', () => {
    const fixture = prepareDeployment()
    const invalidDir = resolve(fixture.appDir, 'invalid')
    const invalidArtifact = resolve(fixture.appDir, 'invalid.tar.gz')
    mkdirSync(invalidDir)
    writeFileSync(resolve(invalidDir, 'README'), 'missing server entry')
    execFileSync('tar', ['-C', invalidDir, '-czf', invalidArtifact, '.'])

    const result = spawnSync('bash', [script, '--artifact', invalidArtifact, '--sha', 'broken'], {
      env: fixture.env,
      encoding: 'utf8',
    })

    expect(result.status).not.toBe(0)
    expect(readFileSync(resolve(fixture.appDir, '.output/server/index.mjs'), 'utf8')).toBe('export default "old"')
  })

  it('restores the previous output when the new service fails its health check', () => {
    const fixture = prepareDeployment('fail')

    const result = spawnSync('bash', [script, '--artifact', fixture.artifact, '--sha', 'unhealthy'], {
      env: fixture.env,
      encoding: 'utf8',
    })

    expect(result.status).not.toBe(0)
    expect(readFileSync(resolve(fixture.appDir, '.output/server/index.mjs'), 'utf8')).toBe('export default "old"')
    expect(readdirSync(fixture.appDir).some(name => name.startsWith('.output.failed.'))).toBe(true)
  })
})
