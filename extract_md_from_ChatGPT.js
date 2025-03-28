// Run the below code in the console on the page you want to scrape Markdown from
{
    // Adjust this selector to match your page's main content/container
    let mainContent = document.getElementsByClassName('main')[0];

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

                // If you have a special class you want to capture as normal text:
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
                    // Skip <p> if its direct parent is an <li>, to prevent duplicate text in lists
                    let parentTag = node.parentElement?.tagName?.toLowerCase();
                    if (parentTag !== 'li') {
                        // Also skip if we are inside a table cell (because we handle the entire cell at once)
                        if (!inTable) {
                            all_text += node.textContent.trim() + '\n\n';
                        }
                    }
                    // Recurse over children for any nested elements
                    Array.from(node.childNodes).forEach(traverseNodes);
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
                    // Recurse children if needed
                    Array.from(node.childNodes).forEach(traverseNodes);
                }

                // -- TABLE HANDLING START --
                else if (tag === 'table') {
                    inTable = true;
                    all_text += '\n';  // Blank line before a table
                    // Recurse over children
                    Array.from(node.childNodes).forEach(traverseNodes);
                    // After finishing the table
                    flushCurrentRow();
                    inTable = false;
                    inThead = false;
                    tableHeaderCount = 0;
                    hasHeaderRow = false;
                    currentRowCells = [];
                    all_text += '\n';  // Blank line after table
                }

                else if (tag === 'thead') {
                    inThead = true;
                    // Recurse children
                    Array.from(node.childNodes).forEach(traverseNodes);
                    inThead = false; // done with thead
                }

                else if (tag === 'tbody') {
                    // Recurse children
                    Array.from(node.childNodes).forEach(traverseNodes);
                }

                else if (tag === 'tr' && inTable) {
                    // Before processing this <tr>, flush any leftover row data from the previous one
                    flushCurrentRow();
                    // Recurse so we can capture <th> or <td> inside
                    Array.from(node.childNodes).forEach(traverseNodes);
                    // Now flush the row we just built
                    let rowLength = currentRowCells.length;
                    flushCurrentRow();

                    // If it was a header row and we haven't inserted the separator yet
                    if (hasHeaderRow && !tableHeaderCount) {
                        tableHeaderCount = rowLength;
                        if (tableHeaderCount > 0) {
                            insertHeaderSeparator(tableHeaderCount);
                        }
                    }
                }

                // -- HEADERS IN TABLE --
                else if (tag === 'th' && inTable) {
                    hasHeaderRow = true;
                    // Collect textContent from <th> (including any children)
                    let textContent = node.textContent.trim().replace(/\s+/g, ' ');
                    currentRowCells.push(textContent);
                }

                // -- CELLS IN TABLE --
                else if (tag === 'td' && inTable) {
                    // Collect textContent from <td> (including children)
                    let textContent = node.textContent.trim().replace(/\s+/g, ' ');
                    currentRowCells.push(textContent);
                }

                // For any other element we haven't explicitly handled, just recurse its children
                else {
                    Array.from(node.childNodes).forEach(traverseNodes);
                }
            }
        }

        traverseNodes(mainContent);
        console.log(all_text);
    } else {
        console.log('No element with class "v-slot-main-content" found.');
    }
}
