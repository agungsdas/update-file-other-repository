const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const { execSync } = require('child_process');
const dayjs = require('dayjs');

const run = async () => {
  const targetRepository = core.getInput('target-repository');
  const targetBranch = core.getInput('target-branch');
  const authorName = core.getInput('author-name');
  const authorEmail = core.getInput('author-email');
  const commitMessage = core.getInput('commit-message') || `Auto Commit by ${authorName} (${authorEmail}) at ${dayjs().format('DD/MM/YYYY HH:mm:ss Z')}`;
  const script = core.getInput('script');

  if (!targetRepository) {
    throw new Error('Target repository not found')
  }
  if (!authorName) {
    throw new Error('Author Name not found')
  }
  if (!authorEmail) {
    throw new Error('Author Email not found')
  }

  await exec.exec(`git clone ${targetRepository} repo`)
  await exec.exec(`git config user.name ${authorName}`, [], {
    cwd: 'repo'
  })
  await exec.exec(`git config user.email ${authorEmail}`, [], {
    cwd: 'repo'
  })

  if (targetBranch) {
    await exec.exec(`git checkout ${targetBranch}`, [], {
      cwd: 'repo'
    })
  }

  if (script) {
    execSync(script, {
      cwd: 'repo',
    })
  }

  await exec.exec('git add .', [], {
    cwd: 'repo'
  })
  await exec.exec(`git commit -m "${commitMessage}"`, [], {
    cwd: 'repo'
  })
  await exec.exec('git push', [], {
    cwd: 'repo'
  })
}


run().catch(error => {
  core.setFailed(error.message);
});