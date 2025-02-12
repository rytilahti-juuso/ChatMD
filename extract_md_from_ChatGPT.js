// Run the below code in the console on the page you want to scrape Markdown from
{
    // Adjust this selector to match your page's main content/container
    let mainContent = document.getElementsByTagName('main')[0]

    if (mainContent) {
        let all_text = '';

        // Variables for table parsing
        let inTable = false;
        let inThead = false;
        let tableHeaderCount = 0;
        let hasHeaderRow = false;  // We'll detect once we parse a row with <th>
        let currentRowCells = [];

        /**
         * Flushes the current row to the output as a Markdown row:
         * e.g. "| cell1 | cell2 | cell3 |"
         */
        function flushCurrentRow() {
            if (currentRowCells.length > 0) {
                all_text += '| ' + currentRowCells.join(' | ') + ' |\n';
                currentRowCells = [];
            }
        }

        /**
         * Inserts the separator row (for Markdown) if we encountered a header row:
         * e.g. "| --- | --- | --- |"
         */
        function insertHeaderSeparator(count) {
            let separatorCells = [];
            for (let i = 0; i < count; i++) {
                separatorCells.push('---');
            }
            all_text += '| ' + separatorCells.join(' | ') + ' |\n';
        }

        // Recursive function to traverse child nodes
        function traverseNodes(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                let tag = node.tagName.toLowerCase();

                // -- HEADERS (h1 - h6) --
                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
                    let headerLevel = parseInt(tag.charAt(1));
                    let prefix = '#'.repeat(headerLevel);
                    all_text += prefix + ' ' + node.textContent.trim() + '\n\n';
                }

                else if (node.classList && [...node.classList].some(cls => cls.includes("user-chat-width"))) {
                    all_text += node.textContent.trim() + '\n\n';
                }

                // -- CODE BLOCKS --
                else if (tag === 'pre') {
                    // Adjust language fence as you prefer (e.g., ```java, ```js, etc.)
                    all_text += '```java\n' + node.textContent.trim() + '\n```\n\n';
                }

                // -- PARAGRAPHS --
                else if (tag === 'p') {
                    all_text += node.textContent.trim() + '\n\n';
                }

                // -- LIST ITEMS (WITH INDENTATION + ORDERED LIST SUPPORT) --
                else if (tag === 'li') {
                    // Determine indentation depth by counting ancestor <ul>/<ol>
                    let depth = 0;
                    let ancestor = node.parentElement;
                    while (ancestor) {
                        let ancestorTag = ancestor.tagName && ancestor.tagName.toLowerCase();
                        if (ancestorTag === 'ul' || ancestorTag === 'ol') {
                            depth++;
                        }
                        ancestor = ancestor.parentElement;
                    }
                    // For each level above 1, add 2 spaces
                    let indentation = '  '.repeat(Math.max(0, depth - 1));

                    // Check immediate parent to see if it's <ol> or <ul>
                    let parentTag = node.parentElement && node.parentElement.tagName
                        ? node.parentElement.tagName.toLowerCase()
                        : '';

                    if (parentTag === 'ol') {
                        // Markdown auto-numbers if each item is "1."
                        all_text += `${indentation}1. ${node.textContent.trim()}\n`;
                    } else {
                        all_text += `${indentation}- ${node.textContent.trim()}\n`;
                    }
                }

                // -- TABLE HANDLING START --
                else if (tag === 'table') {
                    inTable = true;
                    all_text += '\n';  // Blank line before a table
                }
                else if (tag === 'thead') {
                    inThead = true;
                    hasHeaderRow = false;
                }
                else if (tag === 'tbody') {
                    inThead = false;
                }
                else if (tag === 'tr' && inTable) {
                    // Flush any leftover row data *before* starting a new row
                    flushCurrentRow();
                }
                else if (tag === 'th' && inTable) {
                    hasHeaderRow = true;  // We know this <tr> is a header row
                    currentRowCells.push(node.textContent.trim());
                }
                else if (tag === 'td' && inTable) {
                    currentRowCells.push(node.textContent.trim());
                }

                // Example: capturing code blocks in certain <div> with a background color
                else if (tag === 'div') {
                    if (!node.className && getComputedStyle(node).backgroundColor === 'rgb(238, 238, 238)') {
                        all_text += '```java\n' + node.textContent.trim() + '\n```\n\n';
                    }
                }

                // -- RECURSE over children --
                Array.from(node.childNodes).forEach(traverseNodes);

                // -- POST-ORDER LOGIC --
                if (tag === 'tr' && inTable) {
                    // We’ve now captured the row's cells in currentRowCells
                    // Store length before flushing, because flushCurrentRow() clears the array
                    let rowLength = currentRowCells.length;
                    flushCurrentRow();

                    // If it was a header row and we haven't inserted the separator yet:
                    if (hasHeaderRow && !tableHeaderCount) {
                        tableHeaderCount = rowLength;
                        if (tableHeaderCount > 0) {
                            insertHeaderSeparator(tableHeaderCount);
                        }
                    }
                }
                else if (tag === 'table') {
                    // Once we finish the table, flush any last row
                    flushCurrentRow();
                    // Reset table state
                    inTable = false;
                    inThead = false;
                    tableHeaderCount = 0;
                    hasHeaderRow = false;
                    currentRowCells = [];
                    all_text += '\n';  // Blank line after table
                }
            }
        }

        traverseNodes(mainContent);
        console.log(all_text);
    } else {
        console.log('No element with class "v-slot-main-content" found.');

    }
}
