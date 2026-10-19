import os
from pathlib import Path
import subprocess
import tempfile

def git(*args, check=True):
    result = subprocess.run(['git', *args], capture_output=True, text=True)
    if check and result.returncode:
        raise AssertionError(result.stderr)
    return result.stdout.strip(), result.returncode

with tempfile.TemporaryDirectory(prefix='test-day2-purge-') as folder:
    os.chdir(folder)
    git('init', '--bare', 'remote.git')
    git('init', '-b', 'main', 'working')
    os.chdir('working')
    git('config', 'user.name', 'Purge Boundary Test')
    git('config', 'user.email', 'test@example.invalid')
    Path('code.txt').write_text('preserve application code')
    git('add', '.')
    git('commit', '-m', 'clean base')
    base = git('rev-parse', 'HEAD')[0]
    git('branch', 'unaffected')
    media = Path('frontend/public/images/campaigns/chuyen-kho-2026/day-2')
    media.mkdir(parents=True)
    (media / 'IMG_3260.mp4').write_bytes(b'target media bytes')
    git('add', '.')
    git('commit', '-m', 'introduce media')
    git('switch', '-c', 'feature/ui-redesign')
    Path('ui.txt').write_text('preserve in-progress UI work')
    git('add', '.')
    git('commit', '-m', 'UI work')
    git('switch', 'main')
    git('rm', str(media / 'IMG_3260.mp4'))
    git('commit', '-m', 'move media outside Git')
    git('remote', 'add', 'origin', '../remote.git')
    git('push', '--all', 'origin')
    before = dict(line.split() for line in git('for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads')[0].splitlines())
    git('filter-repo', '--force', '--invert-paths', '--path', str(media) + '/',
        '--prune-empty', 'never', '--prune-degenerate', 'never',
        '--refs', 'refs/heads/main', 'refs/heads/feature/ui-redesign', '^' + base)
    after = dict(line.split() for line in git('for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads')[0].splitlines())
    assert after['refs/heads/unaffected'] == before['refs/heads/unaffected']
    assert git('show', 'refs/heads/main:code.txt')[0] == 'preserve application code'
    assert git('show', 'refs/heads/feature/ui-redesign:ui.txt')[0] == 'preserve in-progress UI work'
    assert git('log', '--branches', '--format=%H', '--', str(media))[0] == ''
    changed = [ref for ref in before if before[ref] != after[ref]]
    refspecs = [after[ref] + ':' + ref for ref in changed]
    bad_leases = ['--force-with-lease=' + ref + ':' + ('0' * 40 if ref.endswith('/main') else before[ref]) for ref in changed]
    assert git('push', '--atomic', *bad_leases, '../remote.git', *refspecs, check=False)[1] != 0
    actual = {line.split()[1]: line.split()[0] for line in git('ls-remote', '--refs', '--heads', '../remote.git')[0].splitlines()}
    assert actual == before, 'A rejected lease must preserve every remote branch'
    git('push', '--atomic', *['--force-with-lease=' + ref + ':' + before[ref] for ref in changed], '../remote.git', *refspecs)
    actual = {line.split()[1]: line.split()[0] for line in git('ls-remote', '--refs', '--heads', '../remote.git')[0].splitlines()}
    assert actual == after
    print('PASS: target history removed; main/UI code preserved; unaffected refs stable; atomic leases reject stale snapshots.')
