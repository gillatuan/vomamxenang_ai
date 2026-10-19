import base64
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import urllib.request

REPOSITORY = 'https://github.com/gillatuan/vomamxenang_ai.git'
PREFIX = 'frontend/public/images/campaigns/chuyen-kho-2026/day-2/'
NAMES = {'kho-lop-theo-cum-01.jpg', 'kho-cu-mam-lop-01.jpg', 'kho-cu-mam-lop-02.jpg',
         'cot-lop-sau-sap-xep-01.jpg', 'loi-di-kho-sau-sap-xep-01.jpg',
         'IMG_3267.jpeg', 'IMG_3268.jpeg', 'IMG_3260.mp4', 'IMG_3261.mp4', 'IMG_3264.mp4'}

def git(*args, check=True):
    result = subprocess.run(['git', *args], capture_output=True, text=True)
    if check and result.returncode:
        # Git masks credentials poorly in some errors. Never print transport output.
        raise RuntimeError('GIT_COMMAND_FAILED:' + args[0])
    return result

def refs():
    output = git('for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/tags').stdout
    return dict(line.split() for line in output.splitlines())

def tree_without_media(ref):
    return [line for line in git('ls-tree', '-r', ref).stdout.splitlines()
            if not line.split('\t', 1)[1].startswith(PREFIX)]

def verify_url(url):
    if not url.startswith('https://evgd1ro8jvugg2yw.public.blob.vercel-storage.com/content/'):
        raise RuntimeError('UNEXPECTED_BLOB_URL')
    with urllib.request.urlopen(urllib.request.Request(url, method='HEAD'), timeout=30) as response:
        if response.status != 200:
            raise RuntimeError('BLOB_UNAVAILABLE')

def main():
    if os.environ.get('CONFIRMATION') != 'PURGE-ONLY-DAY2-MEDIA-HISTORY':
        raise RuntimeError('CONFIRMATION_REQUIRED')
    token = os.environ.pop('GH_TOKEN')
    encoded = base64.b64encode(('x-access-token:' + token).encode()).decode()
    os.environ.update({'GIT_CONFIG_COUNT': '1',
                       'GIT_CONFIG_KEY_0': 'http.https://github.com/.extraheader',
                       'GIT_CONFIG_VALUE_0': 'AUTHORIZATION: basic ' + encoded,
                       'GIT_TERMINAL_PROMPT': '0'})
    root = Path(os.environ['RUNNER_TEMP']) / 'day2-history-purge.git'
    root.mkdir(mode=0o700)
    os.chdir(root)
    git('init', '--bare')
    git('remote', 'add', 'origin', REPOSITORY)
    git('fetch', '--no-tags', 'origin', '+refs/heads/*:refs/heads/*', '+refs/tags/*:refs/tags/*')
    before = refs()
    expected_trees = {ref: tree_without_media(ref) for ref in before}
    mapping = json.loads(git('show', 'refs/heads/main:frontend/config/day2-media-redirects.json').stdout)
    if {path.rsplit('/', 1)[1] for path in mapping} != NAMES or len(mapping) != 10:
        raise RuntimeError('EXPECTED_TEN_EXTERNAL_MEDIA_FILES')
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        list(pool.map(verify_url, mapping.values()))
    print('BLOB_AVAILABILITY_VERIFIED: 7 photos, 3 videos', flush=True)
    paths = set(git('log', '--branches', '--tags', '--format=', '--name-only', '--', PREFIX).stdout.splitlines()) - {''}
    if not paths:
        print('ALREADY_PURGED: no target paths in branch/tag history', flush=True)
        return
    if {PREFIX + name for name in NAMES} != paths:
        raise RuntimeError('HISTORICAL_PATH_SCOPE_CHANGED')
    raw = git('log', '--branches', '--tags', '--raw', '--no-abbrev', '--format=', '--', PREFIX).stdout
    media_blobs = set()
    for line in raw.splitlines():
        if line.startswith(':'):
            for sha in line.split('\t', 1)[0].split()[2:4]:
                if sha != '0' * 40:
                    media_blobs.add(sha)
    affected = [ref for ref in before if git('log', '-1', '--format=%H', ref, '--', PREFIX).stdout.strip()]
    additions = set(git('log', '--branches', '--tags', '--diff-filter=A', '--format=%H', '--', PREFIX).stdout.splitlines())
    roots = [sha for sha in additions if not any(other != sha and git('merge-base', '--is-ancestor', other, sha, check=False).returncode == 0 for other in additions)]
    boundaries = set()
    for sha in roots:
        boundaries.update(git('rev-list', '--parents', '-n', '1', sha).stdout.split()[1:])
    for sha in boundaries:
        if git('log', '-1', '--format=%H', sha, '--', PREFIX).stdout.strip():
            raise RuntimeError('UNCLEAN_HISTORY_BOUNDARY')
    print('PURGE_PREFLIGHT=' + json.dumps({'refs': len(before), 'affectedRefs': len(affected), 'targetPaths': len(paths), 'blobVersions': len(media_blobs)}), flush=True)
    git('filter-repo', '--force', '--invert-paths', '--path', PREFIX,
        '--prune-empty', 'never', '--prune-degenerate', 'never',
        '--refs', *affected, *['^' + sha for sha in sorted(boundaries)])
    after = refs()
    if set(after) != set(before):
        raise RuntimeError('REF_SET_CHANGED')
    for ref in after:
        if tree_without_media(ref) != expected_trees[ref]:
            raise RuntimeError('NON_MEDIA_CODE_CHANGED')
    if git('log', '--branches', '--tags', '--format=%H', '--', PREFIX).stdout.strip():
        raise RuntimeError('MEDIA_PATH_HISTORY_REMAINS')
    reachable = {line.split(' ', 1)[0] for line in git('rev-list', '--objects', '--branches', '--tags').stdout.splitlines()}
    if media_blobs & reachable:
        raise RuntimeError('MEDIA_BLOB_STILL_REACHABLE')
    changed = [ref for ref in before if before[ref] != after[ref]]
    if not changed:
        raise RuntimeError('NO_REFS_REWRITTEN')
    remote_rows = git('ls-remote', '--refs', '--heads', '--tags', REPOSITORY).stdout
    remote = {line.split()[1]: line.split()[0] for line in remote_rows.splitlines()}
    if remote != before:
        raise RuntimeError('REMOTE_CHANGED_RETRY_FROM_FRESH_SNAPSHOT')
    print('LOCAL_HISTORY_VERIFIED=' + json.dumps({'changedRefs': len(changed), 'codeTreesPreserved': True, 'mediaBlobsReachable': 0}), flush=True)
    # Atomic force-with-lease: preserve concurrent work and never delete any branch/tag.
    git('push', '--atomic', *['--force-with-lease=' + ref + ':' + before[ref] for ref in changed],
        REPOSITORY, *[after[ref] + ':' + ref for ref in changed])
    remote_rows = git('ls-remote', '--refs', '--heads', '--tags', REPOSITORY).stdout
    remote = {line.split()[1]: line.split()[0] for line in remote_rows.splitlines()}
    if remote != after:
        raise RuntimeError('REMOTE_REF_VERIFICATION_FAILED')
    for ref in ['refs/heads/main', 'refs/heads/feature/ui-redesign', 'refs/heads/feature/ui-redesign-product-listing']:
        if ref in after:
            print('VERIFIED_REF=' + json.dumps({'ref': ref, 'sha': after[ref]}), flush=True)
    print('PURGE_COMPLETED=' + json.dumps({'refsVerified': len(after), 'refsRewritten': len(changed), 'filesPurged': 10, 'codeTreesPreserved': True, 'mediaBlobsReachable': 0, 'pullRequestCachesPurged': False}), flush=True)

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        if isinstance(error, RuntimeError):
            print(str(error), flush=True)
        else:
            print('PURGE_STOPPED:' + type(error).__name__, flush=True)
        raise SystemExit(1)
