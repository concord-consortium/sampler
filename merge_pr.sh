#!/bin/bash

# Script to merge a feature branch into Chad-experiments

# Check if we have the right number of arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <feature-branch-name>"
    echo "Example: $0 feature/device-base-testing"
    exit 1
fi

FEATURE_BRANCH=$1
MAIN_BRANCH="Chad-experiments"

# Ensure we have the latest changes
echo "Fetching latest changes..."
git fetch

# Check if the feature branch exists
if ! git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
    echo "Error: Branch $FEATURE_BRANCH does not exist"
    exit 1
fi

# Check if the main branch exists
if ! git show-ref --verify --quiet refs/heads/$MAIN_BRANCH; then
    echo "Error: Branch $MAIN_BRANCH does not exist"
    exit 1
fi

# Make sure we're on the feature branch and it's up to date
echo "Checking out feature branch $FEATURE_BRANCH..."
git checkout $FEATURE_BRANCH

# Run tests to make sure everything passes
echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix the tests before merging."
    exit 1
fi

# Switch to the main branch
echo "Checking out main branch $MAIN_BRANCH..."
git checkout $MAIN_BRANCH

# Make sure the main branch is up to date
echo "Pulling latest changes for $MAIN_BRANCH..."
git pull

# Merge the feature branch
echo "Merging $FEATURE_BRANCH into $MAIN_BRANCH..."
git merge --no-ff $FEATURE_BRANCH -m "Merge $FEATURE_BRANCH into $MAIN_BRANCH"

if [ $? -ne 0 ]; then
    echo "Merge conflict detected. Please resolve conflicts manually."
    exit 1
fi

# Push the changes
echo "Pushing changes to remote..."
git push

# Optional: Delete the feature branch
read -p "Do you want to delete the feature branch $FEATURE_BRANCH? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting branch $FEATURE_BRANCH..."
    git branch -d $FEATURE_BRANCH
    echo "Branch deleted locally."
    
    read -p "Do you want to delete the remote branch as well? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin --delete $FEATURE_BRANCH
        echo "Remote branch deleted."
    fi
fi

echo "Merge completed successfully!"
echo "You can now create a new feature branch with:"
echo "git checkout -b feature/new-feature-name" 