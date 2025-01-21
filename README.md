# do-power

A CLI tool to power on all your DigitalOcean droplets in one command.

## Features

- Lists all your DigitalOcean droplets with their current status
- Powers on any inactive droplets
- Shows real-time progress with loading spinners
- Color-coded status indicators

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Create a DigitalOcean API token:
   - Go to https://cloud.digitalocean.com/account/api/tokens
   - Click "Generate New Token"
   - Give it a name and ensure "Write" scope is selected
   - Copy the token (you won't be able to see it again)

4. Add your API token to the `.env` file:
```bash
DO_API_TOKEN=your_token_here
```

## Usage

Run the tool:

```bash
./index.js
```

Or install globally:

```bash
npm install -g .
do-power
```

The tool will:
1. List all your droplets with their current status
2. If any droplets are powered off, it will power them on
3. Show real-time progress of power-on operations

## Example Output

```
✔ Found 3 droplet(s)
● web-server (active)
● database (off)
● staging (off)

Powering on 2 inactive droplet(s)...
✔ Powered on database
✔ Powered on staging

Power-on operations completed!
Note: It may take a few minutes for droplets to fully start up
```

## License

MIT
