#!/usr/bin/env node

import { createRequire } from 'module';
import dotenv from 'dotenv';
import ora from 'ora';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Setup to use require for do-wrapper (as it's CommonJS)
const require = createRequire(import.meta.url);
const DigitalOcean = require('do-wrapper').default;

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '.env');

// Check if .env exists, if not create it with template
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, 'DO_API_TOKEN=your_digitalocean_api_token_here\n');
  console.log(chalk.yellow('A .env file has been created. Please add your DigitalOcean API token to it.'));
  console.log(chalk.gray('You can get your API token from: https://cloud.digitalocean.com/account/api/tokens'));
  process.exit(1);
}

// Check if API token is configured
if (!process.env.DO_API_TOKEN || process.env.DO_API_TOKEN === 'your_digitalocean_api_token_here') {
  console.log(chalk.red('Error: DigitalOcean API token not configured'));
  console.log(chalk.gray('Please add your API token to the .env file'));
  process.exit(1);
}

const api = new DigitalOcean(process.env.DO_API_TOKEN, 100);

async function getDroplets() {
  try {
    const response = await api.droplets.getAll('');
    if (response && Array.isArray(response.droplets)) {
      return response.droplets;
    }
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error(chalk.red('Error fetching droplets:'), error.message);
    process.exit(1);
  }
}

async function powerOnDroplet(droplet) {
  try {
    await api.droplets.requestAction(droplet.id, {
      type: 'power_on'
    });
    return true;
  } catch (error) {
    console.error(chalk.red(`Error powering on ${droplet.name}:`), error.message);
    return false;
  }
}

async function main() {
  const spinner = ora('Fetching droplets...').start();
  
  try {
    const droplets = await getDroplets();
    
    if (droplets.length === 0) {
      spinner.info('No droplets found in your account');
      return;
    }

    spinner.succeed(`Found ${droplets.length} droplet(s)`);

    // Display droplets
    droplets.forEach(droplet => {
      const status = droplet.status === 'active' 
        ? chalk.green('●') 
        : chalk.red('●');
      console.log(`${status} ${droplet.name} (${droplet.status})`);
    });

    // Filter out already active droplets
    const inactiveDroplets = droplets.filter(d => d.status !== 'active');
    
    if (inactiveDroplets.length === 0) {
      console.log(chalk.green('\nAll droplets are already powered on!'));
      return;
    }

    console.log(chalk.yellow(`\nPowering on ${inactiveDroplets.length} inactive droplet(s)...`));

    // Power on all inactive droplets
    const powerOnSpinner = ora().start();
    
    for (const droplet of inactiveDroplets) {
      powerOnSpinner.text = `Powering on ${droplet.name}...`;
      const success = await powerOnDroplet(droplet);
      if (success) {
        powerOnSpinner.succeed(`Powered on ${droplet.name}`);
      } else {
        powerOnSpinner.fail(`Failed to power on ${droplet.name}`);
      }
      powerOnSpinner.start();
    }
    
    powerOnSpinner.stop();
    console.log(chalk.green('\nPower-on operations completed!'));
    console.log(chalk.gray('Note: It may take a few minutes for droplets to fully start up'));

  } catch (error) {
    spinner.fail('An error occurred');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

main().catch(console.error);
