#!/bin/bash

# This script creates a prompt for ChatGPT using the source code from this project
#

IFS='' read -r -d '' PREFACE <<"EOF"
# ACT AS A SENIOR STAFF SOFTWARE ENGINEER WITH A FOCUS ON FIREFOX EXTENSIONS AND WEB DEVELOPMENT

---

# PROJECT DESCRIPTION

This project is a Firefox extension that allows users to save a list of URLs that contain search
results and then open them one at a time. When the search results pages are loaded, the extension
inserts an "Add to Database" button next to each search result. When the user clicks this button,
details from the search result are populated in a modal popup form. When the user submits the form,
the details are submitted to a Google Sheet and then parsed and saved using the Google Apps Script
API.

The extension is intended to help users quickly gather information about upcoming events. The Google
Sheet is shared between users so that they can promote these events more effectively than if they
were working alone.

---

EOF

IFS='' read -r -d '' INSTRUCTION <<"EOF"
# INSTRUCTIONS

REVIEW THE SOURCE CODE FOR THIS PROJECT AND THEN PERFORM THE FOLLOWING TASK:  

## ISSUE:

The modal form that appears when the "Add to Database" button is clicked inherits the CSS styles from the source page, and sometimes it's unreadable. Update the modal form's styles to ensure that it's readable and visually appealing.

EOF


# Read all .js, .json, .html, and .css files in src/firefox-extension one at a time and
# add the content to a variable. Each file should be separated by a horizontal rule and include
# the file name as a header.
#
# Example output:
#
#  # src/firefox-extension/background.js
#
#  ```javascript
#  // Code from background.js
#  ```
#
#  ---

PROJECT_SOURCE=""
for file in src/**/*.{js,json,html}; do
  FILE_CONTENT=$(cat $file)
  FILE_NAME=$(basename $file)
  CODE_BLOCK_TYPE=$(echo $file | awk -F. '{print $NF}')
  PROJECT_SOURCE+="# $FILE_NAME\n\n\`\`\`$CODE_BLOCK_TYPE\n$FILE_CONTENT\n\`\`\`\n\n---\n\n"
done

# Combine the preface + source + instruction
PROMPT="$PREFACE\n$PROJECT_SOURCE\n$INSTRUCTION"

echo -e "$PROMPT"