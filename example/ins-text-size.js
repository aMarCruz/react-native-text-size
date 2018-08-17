/**
 * Simple installer for rn-text-size sources in the parent folder.
 * Requires yarn and node 6 or later.
 *
 * @author aMarCruz
 * @license MIT
 */
/* eslint-env node */
// @ts-nocheck
const path = require('path')
const fs = require('fs')
const os = require('os')

const packPath = path.dirname(__dirname)
const packName = 'react-native-text-size'
if (!checkLibrary()) {
  process.exit(1)
}

const PACKAGER = findExecPackager()
if (!PACKAGER) {
  process.exit(1)
}

const execFile = promisifyExecFile()

fs.mkdtemp(path.join(os.tmpdir(), 'rnts'), (err, folder) => {
  if (err) {
    console.error(err.message || err)
    process.exit(1)
  }
  const outFile = path.join(folder, `rnts${Date.now().toString(16)}.tgz`)
  console.log(`Packing ${packName}...`)

  execFile(PACKAGER, `pack ${packPath} -f ${outFile}`, { cwd: packPath })
    .then((info) => {
      console.log(info.stdout)
      console.log('Installing, please wait...')
      return execFile(PACKAGER, `add ${outFile} --force --no-lockfile -P`)
    })
    .then((info) => {
      console.log(info.stdout)
      removeTmpFile(folder, outFile)
      process.exit(0)
    })
    .catch((err) => {
      console.error(`\n${err.message || err}\n`)
      removeTmpFile(folder, outFile)
      process.exit(1)
    })
})
// Search for the "-p" argument or, if not passed, search 'yarn' and then 'npm'
function findExecPackager () {
  const _whichSync = require('which').sync
  const exe = _whichSync('yarn', { nothrow: true })
  if (exe) {
    return exe
  }
  console.error('yarn was not found in the path.')
  return null
}

function promisifyExecFile () {
  const _execFile = require('child_process').execFile

  return (file, cmdLine, options) => new Promise((resolve, reject) => {
    options = { ...options, env: process.env, shell: true }
    const args = cmdLine.split(/\s+/)
    try {
      _execFile(file, args, options, (err, stdout, stderr) => {
        if (err) {
          reject(err)
        } else {
          resolve({ stdout, stderr })
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

function checkLibrary () {
  let exist
  try {
    exist = require('../package.json').name === packName
  } catch (_) {
    // no package.json
  }
  if (!exist) {
    console.warn(`${packName} is not in ${path.resolve('..')}`)
    console.warn('do you move this package?')
  }
  return exist
}

function deleteFromJson () {
  const json = require('./package.json')
  const deps = json.peerDependencies

  if (deps && deps[packName]) {
    console.log(`Removing temporal dependency on ${packName}...`)
    if (Object.keys(deps) > 1) {
      delete deps[packName]
    } else {
      delete json.peerDependencies
    }
    fs.writeFileSync('package.json', JSON.stringify(json, null, 2) + '\n')
  }
}

function removeTmpFile (dir, file) {
  console.log('Removing temporal files...')
  try {
    fs.unlinkSync(file)
  } catch (e) {
    console.log(e.message)
  }
  try {
    fs.rmdirSync(dir)
  } catch (e) {
    console.log(e.message)
  }
  deleteFromJson()
  console.log('Done.')
}
