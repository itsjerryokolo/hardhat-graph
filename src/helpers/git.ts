const { withSpinner, step } = require('@graphprotocol/graph-cli/src/command-helpers/spinner')

export const checkForRepo = async (toolbox: any): Promise<boolean> => {
  try {
    let result = await toolbox.system.run('git rev-parse --is-inside-work-tree')
    return result === 'true'
  } catch(err: any) {
    if (err.stderr.includes('not a git repository')) {
      return false
    } else {
      throw Error(err.stderr)
    }
  }
}

export const initRepository = async (toolbox: any): Promise<boolean> =>
  await withSpinner(
    `Create git repository`,
    `Failed to create git repository`,
    `Warnings while creating git repository`,
    async (spinner: any) => {
      await toolbox.system.run('git init')
      // Not sure if it's okay to commit, as there may be hardhat files that are not supposed to be commited?
      // await system.run('git add --all')
      // await system.run('git commit -m "Initial commit"')
      return true
    }
  )

export const initGitignore = async (toolbox: any): Promise<boolean> =>
  await withSpinner(
    `Add subgraph files to .gitignore`,
    `Failed to add subgraph files to .gitignore`,
    `Warnings while adding subgraph files to .gitignore`,
    async (spinner: any) => {
      step(spinner, "Check if .gitignore already exists")
      let ignoreExists = await toolbox.filesystem.exists('.gitignore')

      if (!ignoreExists) {
        step(spinner, "Create .gitignore file")
        await toolbox.system.run('touch .gitignore')
      }

      step(spinner, "Add subgraph files and folders to .gitignore file")
      await toolbox.patching.append('.gitignore', '# Matchstick\nsubgraph/tests/.*/\n\n# Subgraph\nsubgraph/generated/\nsubgraph/build/\n')

      return true
    }
  )
