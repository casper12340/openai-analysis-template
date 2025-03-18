# CSVCompare Performance Analyzer

A React application for comparing agent performance metrics across different time periods using CSV data and OpenAI's GPT for analysis.

## Features

- CSV file upload and parsing for two separate time periods
- Agent selection interface for filtering analysis
- Automatic performance comparison using GPT-4o-mini
- Markdown rendering of analysis insights
- Dutch language interface

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Firebase account (for deployment)

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/csvcompare.git
    cd csvcompare
    ```

2. **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Create a `.env` file** in the root directory with your OpenAI API key:
    ```
    REACT_APP_OPENAI_API_TOKEN=sk-your-openai-api-key
    ```

4. **Start the development server**:
    ```bash
    npm start
    # or
    yarn start
    ```

Your app should now be running at `http://localhost:3000`.

## Usage

1. Upload CSV files for "old" and "new" time periods using the file upload buttons.
2. Select which agents to include in the analysis (or use "Select All").
3. Click "Prestaties Analyseren" to generate insights.
4. View the generated markdown analysis comparing performance metrics.

## CSV Format Requirements

Your CSV files should include the following columns:

- Name
- Messages Sent
- Unique Conversations Messaged
- Conversations Marked Done
- Unique Customers Messaged
- Avg Conversation Handle Time (s)
- Avg Sent Messages Per Conversation
- Avg Sent Messages Per Customer
- First Contact Resolution Rate
- Avg Message Response Times (ms)
- Avg First Response Time (ms)
- Median First Response Time (ms)
- Avg Time to First Resolution (ms)
- Median Time to First Resolution (ms)
- Total Time Logged In (ms)
- Messages Sent With Shortcuts
- Percent of Messages Sent With Shortcuts

## Deployment to Firebase

### Setup Firebase

1. **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```

2. **Login to Firebase**:
    ```bash
    firebase login
    ```

3. **Initialize Firebase in your project**:
    ```bash
    firebase init
    ```
    - Select "Hosting" when prompted.
    - Select your Firebase project or create a new one.
    - Set your build directory to `build`.
    - Configure as a single-page application: `Yes`.
    - Set up automatic builds and deploys with GitHub: Optional.

### Build and Deploy

1. **Build your React application**:
    ```bash
    npm run build
    # or
    yarn build
    ```

2. **Deploy to Firebase**:
    ```bash
    firebase deploy
    ```

Your app will be deployed to `https://your-project-id.web.app`.

## Environment Variables

- **REACT_APP_OPENAI_API_TOKEN**: Your OpenAI API key (required)

## Dependencies

- **React**
- **papaparse**: For CSV parsing
- **react-markdown**: For rendering markdown content
- **OpenAI API**: For performance analysis

## Notes

- Ensure your OpenAI API key has sufficient credits.
- Large CSV files may take longer to process.
- The application filters out agents with fewer than 10 messages sent.

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in the `.env` file.
- **CSV Format Problems**: Check that your CSV files include all required columns.
- **CORS Issues**: May occur when testing locally. Consider using a CORS proxy if needed.
