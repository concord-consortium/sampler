#!/bin/bash

# Script to merge the scrolling functionality feature branch into Chad-experiments

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting merge process for scrolling functionality...${NC}"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}You have uncommitted changes. Please commit or stash them before proceeding.${NC}"
  exit 1
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${GREEN}$CURRENT_BRANCH${NC}"

# Checkout Chad-experiments branch
echo -e "${YELLOW}Checking out Chad-experiments branch...${NC}"
if git checkout Chad-experiments; then
  echo -e "${GREEN}Successfully checked out Chad-experiments branch.${NC}"
else
  echo -e "${RED}Failed to checkout Chad-experiments branch.${NC}"
  exit 1
fi

# Merge feature branch
echo -e "${YELLOW}Merging feature/ui-ux-enhancements branch...${NC}"
if git merge feature/ui-ux-enhancements; then
  echo -e "${GREEN}Successfully merged feature/ui-ux-enhancements branch.${NC}"
else
  echo -e "${RED}Merge conflict occurred. Please resolve conflicts manually.${NC}"
  echo -e "${YELLOW}After resolving conflicts, run 'git add .' and 'git merge --continue'${NC}"
  exit 1
fi

# Run tests
echo -e "${YELLOW}Running tests to verify functionality...${NC}"
if npm test; then
  echo -e "${GREEN}All tests passed successfully.${NC}"
else
  echo -e "${RED}Tests failed. Please fix the issues before committing the merge.${NC}"
  echo -e "${YELLOW}You can return to your original branch with: git checkout $CURRENT_BRANCH${NC}"
  exit 1
fi

# Successful completion
echo -e "${GREEN}Merge completed successfully!${NC}"
echo -e "${GREEN}The scrolling functionality has been merged into the Chad-experiments branch.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Push the changes if needed"
echo -e "2. Proceed to the next UI/UX enhancement: Device Name Input Enhancement"

# Return to original branch if desired
read -p "Do you want to return to your original branch ($CURRENT_BRANCH)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git checkout $CURRENT_BRANCH
  echo -e "${GREEN}Returned to $CURRENT_BRANCH branch.${NC}"
fi

exit 0 