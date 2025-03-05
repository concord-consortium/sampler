# Sampler Tool Understanding

## Overview
The Sampler is a React-based educational tool developed by the Concord Consortium for CODAP (Common Online Data Analysis Platform). It allows users to create and run simulations for probability and statistics education, enabling students to visualize and understand sampling concepts through interactive models.

## Key Components

### 1. Device Types
The Sampler has three main device types:

#### Mixer
- Represents a collection of objects (like balls in a hat)
- Allows users to add, edit, and delete variables
- Variables are represented as balls in a container
- Each variable can have a name and a percentage/frequency

#### Spinner
- Represents the same distribution as the Mixer but in a spinner/wheel format
- Divided into wedges based on the percentage of each variable
- Includes a needle that can be spun to randomly select a variable
- Allows editing of variable names and percentages

#### Collector
- Used to sample data from existing datasets
- Can connect to CODAP data contexts
- Displays the sampled items as balls in a container

### 2. Simulation Process
- Users can set up a model with one or more devices connected in sequence
- Parameters include:
  - Sample size (number of items to select in each sample)
  - Number of samples to collect
  - Sampling with or without replacement
  - Animation speed (Slow, Medium, Fast, Fastest)
- The simulation runs by:
  1. Starting an experiment
  2. Taking multiple samples
  3. For each sample, selecting multiple items
  4. Recording results in a hierarchical data structure

### 3. Data Structure
- Results are organized in a hierarchical table:
  - Experiment level
  - Sample level
  - Item level
- Users can add measures/calculations to the data
- Results can be graphed and analyzed

### 4. User Interface
- Three main tabs: Model, Measures, About
- Model tab: Create and configure sampling devices
- Measures tab: Add statistical calculations to the data
- Options for hiding the model (for teaching purposes)

## Use Cases

### 1. Probability Simulations
- Example: Simulating a carnival duck pond game with 20% winning ducks
- Users can model the probability of winning by running multiple simulations

### 2. Sampling from Datasets
- Example: Sampling from a movie database to estimate average movie length
- Demonstrates concepts of sampling variability and sample statistics

## Technical Implementation
- Built with React and TypeScript
- Uses SVG for interactive visualizations
- Implements animation steps for visual feedback
- Connects to CODAP for data analysis and visualization
- Uses a global state context for managing application state

## Educational Value
- Helps students understand probability concepts through hands-on experimentation
- Visualizes sampling distributions and variability
- Connects theoretical probability with empirical results
- Supports data literacy and statistical thinking 