# Dream Parser Extension

![Dream Parser Logo](Images/myicon.png)

Dream Parser is a powerful Chrome extension designed to enhance your experience with Dream-Singles.com. It provides tools for parsing and managing data from the admin platform efficiently.

## 🌟 Main Features

- Parse data from agency.dream-singles.com
- Automate data collection and analysis
- Integrate with Google Sheets for easy data management
- Streamline agency operations on Dream-Singles.com

## 🛠️ Technologies

- JavaScript
- HTML/CSS
- Chrome Extension API
- Google Sheets API

## 📋 Requirements

- Google Chrome browser
- Dream-Singles.com agency account
- Google Cloud Platform account for Sheets API access

## 🚀 Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the folder containing the extension files.

## ⚙️ Configuration

Before using the extension, you need to set up your Google Cloud Project and obtain a Client ID:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google Sheets API for your project.
4. Create OAuth 2.0 credentials (Client ID) for a Chrome Extension.
5. Open the `manifest.json` file in the extension directory.
6. Replace `"YOUR_CLIENT_ID"` in the `oauth2` section with your actual Client ID:

```json
"oauth2": {
  "client_id": "YOUR_ACTUAL_CLIENT_ID_HERE",
  "scopes": ["https://www.googleapis.com/auth/spreadsheets"]
},
```

7. Save the `manifest.json` file and reload the extension in Chrome.

## 📊 Google Sheets Template

To use the Dream Parser Extension effectively, you need to structure your Google Sheets document in a specific way. We provide a template that you can use as a starting point:

[Download Template Spreadsheet](https://docs.google.com/spreadsheets/d/1CF201kECnfgkVRWqOzzKcDbm7p_yO-hcL1Y3KgDhGJA/edit?usp=sharing)

The spreadsheet structure should be as follows:

- Sheet naming: Each sheet should be named in the format "MM.YY" (e.g., "03.24" for March 2024). This is crucial as the code uses this naming convention to fill in the correct month.
- Column A: Model names
- Row 1: Dates (from column B to AF, representing days 1-31)
- Cells till AF: Data cells where parsed information will be inserted

The extension's algorithm searches for model names in the leftmost column and dates in the first row, from the first cell to column AF. This structure is crucial for the correct functioning of the parser.

Important notes:

1. Make sure to create a new sheet for each month you want to track, following the "MM.YY" naming convention.
2. The extension will automatically identify the correct sheet based on the current date when parsing data.
3. If a sheet for the current month doesn't exist, the extension may not function correctly, so always ensure you have sheets prepared in advance.

## 📜 Usage

After installing and configuring the extension:

1. Click on the extension icon in Chrome to open the popup.
2. Log in to your Dream-Singles agency account.
3. Use the extension interface to initiate parsing and data management tasks.
4. Ensure your Google Sheet follows the provided template structure, including the correct sheet naming convention.
5. The parsed data will be automatically inserted into the corresponding cells in the appropriate month's sheet of your connected Google Sheet.

## 🔄 Updates

Check this repository regularly for updates and new features.

## 👨‍💻 Development

To contribute to the development:

1. Fork this repository.
2. Make your changes in a new branch.
3. Submit a pull request with a clear description of your changes.

## 🤝 Contribution

Contributions are welcome! Please read our [contribution guidelines](CONTRIBUTING.md) before submitting pull requests.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Support

If you encounter any issues or have questions, please create an [issue](https://github.com/gupi1337-7/DreamParse/issues) in this repository.

---

**Note:** This extension is not officially affiliated with Dream-Singles.com. Use it responsibly and in accordance with Dream-Singles.com's terms of service.
