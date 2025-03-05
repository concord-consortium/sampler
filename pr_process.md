# Pull Request Process

This document outlines the pull request process for the Sampler project.

## Process Overview

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Implement Changes**
   - Follow the TDD approach:
     - Write tests first
     - Implement minimal code to pass tests
     - Verify tests pass
     - Refactor code
     - Resolve errors
     - Document changes

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

4. **Create Pull Request Documentation**
   - Create a pull_request.md file with:
     - Description of changes
     - List of specific changes made
     - Testing information
     - Checklist of completed items
     - Next steps

5. **Merge the Pull Request**
   - Use the merge_pr.sh script:
     ```bash
     ./merge_pr.sh
     ```
   - This will:
     - Switch to the target branch (Chad-experiments)
     - Merge the feature branch with a descriptive message
     - Provide confirmation of successful merge

6. **Continue Development**
   - After merging, continue development on the Chad-experiments branch
   - Or create a new feature branch for the next set of changes

## Benefits of This Process

- **Isolation**: Feature branches isolate changes, making it easier to track and review specific features.
- **Documentation**: Pull request documentation provides clear information about changes made.
- **Quality Control**: Following TDD ensures high-quality code with good test coverage.
- **Traceability**: Each feature has a clear history and merge record.

## Example

For the "Enhanced Testing" feature:
1. Created feature/enhanced-testing branch
2. Implemented tests for App and ModelTab components
3. Created pull_request.md with details
4. Used merge_pr.sh to merge into Chad-experiments
5. Continued development with the next feature

## Creating a Pull Request

1. Ensure all tests are passing:
   ```bash
   npm test
   ```

2. Commit any remaining changes:
   ```bash
   git add .
   git commit -m "Final changes for PR"
   ```

3. Push your feature branch to the remote repository:
   ```bash
   git push origin feature/device-base-testing
   ```

4. Create a pull request on GitHub:
   - Go to the repository on GitHub
   - Click on "Pull requests" tab
   - Click "New pull request"
   - Select `Chad-experiments` as the base branch and `feature/device-base-testing` as the compare branch
   - Click "Create pull request"
   - Add the title and description (you can copy from pull_request.md)
   - Assign reviewers if needed
   - Click "Create pull request"

## Reviewing a Pull Request

1. Review the code changes
2. Run the tests locally to verify they pass
3. Provide feedback or approve the changes

## Merging a Pull Request

1. Once approved, merge the pull request:
   - Click "Merge pull request" on GitHub
   - Confirm the merge

2. Update your local repository:
   ```bash
   git checkout Chad-experiments
   git pull origin Chad-experiments
   ```

3. Delete the feature branch (optional):
   ```bash
   git branch -d feature/device-base-testing
   git push origin --delete feature/device-base-testing
   ```

4. Create a new branch for the next phase:
   ```bash
   git checkout -b feature/ui-ux-enhancements
   ``` 