import fse from 'fs-extra'
import cmd from './cmd.js'
import stringifyUrl from './stringifyUrl.js'

export default async (config, folder, target) => {
  if (await fse.exists(folder)) {
    throw new Error('Folder already exists, please remove it first.')
  }

  // replace windows path
  folder = folder.replace(/\\/g, '/')
  const parentFolder = folder.split('/').slice(0, -1).join('/')
  const name = folder.split('/').pop()
  await fse.ensureDir(parentFolder)

  // clone from url
  const url = stringifyUrl(config)
  await cmd(`git clone ${url} ${name}`, { cwd: parentFolder })

  if (target) {
    await cmd(`git checkout ${target}`, { cwd: folder })
  }

  // check current commit
  let commit = null
  try {
    commit = await cmd(`git rev-parse HEAD`, { cwd: folder })
    commit = commit.replace('\n', '')
  } catch (e) {
    // empty repository
  }
  return commit
}
