/* eslint-env node */
// @ts-nocheck
const path = require('path')
const fs = require('fs')
const os = require('os')

const PACKAGER = findExecPackager()
if (!PACKAGER) {
  process.exit(1)
}

const packPath = path.dirname(__dirname)
const execFile = promisifyExecFile()

const removeTmpFile = (dir, file) => {
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
}

fs.mkdtemp(path.join(os.tmpdir(), 'ts-'), (err, folder) => {
  if (err) {
    console.error(err.message || err)
    process.exit(1)
  }
  const outFile = path.join(folder, Date.now().toString(16) + '.tgz')

  execFile(PACKAGER, `pack ${packPath} -f ${outFile}`, { cwd: packPath })
    .then((info) => {
      console.log(info.stdout)
      return execFile(PACKAGER, `add ${outFile} --force --no-lockfile -O`)
    })
    .then((info) => {
      console.log(info.stdout)
      removeTmpFile(folder, outFile)
      process.exit(0)
    })
    .catch((err) => {
      console.log()
      console.log(err.message || err)
      console.log()
      removeTmpFile(folder, outFile)
      process.exit(1)
    })
})

// Search for the "-p" argument or, if not passed, search 'yarn' and then 'npm'
function findExecPackager () {
  const _whichSync = require('which').sync
  const o = process.argv.indexOf('-p')
  const p = ~o ? [process.argv[o + 1]] : ['yarn', 'npm']

  for (let i = 0; i < p.length; i++) {
    const exe = _whichSync(p[0], { nothrow: true })
    if (exe) {
      return exe
    }
  }
  console.err(
    p.length > 1
      ? "Neither 'yarn' nor 'npm' were found in the path."
      : `'${p}' was not found in the path.`
  )
  return null
}

function promisifyExecFile () {
  const _execFile = require('child_process').execFile

  return (file, args, options) => new Promise((resolve, reject) => {
    options = { ...options, env: process.env, shell: true }
    args = args.split(/\s+/)

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

function deleteFromJson () {
  const pkg = require('./package.json')
  if (pkg.optionalDependencies) {
    console.log('Removing temporal dependency on rn-text-size...')
    delete pkg.optionalDependencies
    const json = JSON.stringify(pkg, null, 2) + '\n'
    fs.writeFileSync('package.json', json)
  }
}
