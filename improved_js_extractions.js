// Run the below code on the console. Copies the text content on the opened
// tutorial page and converts it to md format (e.g. keeps code and headers in correct format).
{
    let mainContent = document.querySelector('.v-slot-main-content');

    if (mainContent) {
        let all_text = '';
        let inTable = false; // To track if we're inside a table
        let tableHeaderCount = 0
        // Recursive function to traverse child nodes
        function traverseNodes(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                let tag = node.tagName.toLowerCase();

                // Check if the tag is a header tag and prefix it with the appropriate number of `#`
                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
                    let headerLevel = parseInt(tag.charAt(1));  // Extract header level from the tag name
                    let prefix = '#'.repeat(headerLevel);  // Create prefix with the appropriate number of `#`
                    all_text += prefix + ' ' + node.textContent.trim() + '\n';
                }
                // If is code block
                else if (['pre'].includes(tag)) {
                    all_text += '```java \n' + node.textContent.trim() + '\n```\n';
                } 
                else if (['p'].includes(tag)) {
                    all_text += node.textContent.trim() + '\n';
                }
                else if (['li'].includes(tag)) {
                    all_text += '\n- ' + node.textContent.trim() + '\n';
                }
                // Handle tables
                else if (tag === 'table') {
                    inTable = true;
                    all_text += '\n'; // End the table
                    //inTable = false;
                }
                else if (tag === '/table'){
                    inTable = false;
                }
                else if (tag === 'tr' && inTable) {
                    all_text += '\n | '; // Start a new row
                    //traverseNodes(node); // Process children of the row (cells)
                    //all_text += '|\n'; // End the row
                } 
                else if (tag === 'th' && inTable) {
                    all_text += ' ' + node.textContent.trim() + ' |'; // Add a header cell
                    tableHeaderCount += 1
                    console.log("tableHeaderCount: " + tableHeaderCount)
                }
                else if (tag === 'thead' && inTable) {
                    //all_text += ' ' + node.textContent.trim() + ' |'; // Add a header cell
                    
                }
                else if (tag === '/thead') {
                    //all_text += ' ' + node.textContent.trim() + ' |'; // Add a header cell
                   
                } 
                else if (tag === 'td' && inTable) {
                     let i = 0
                    console.log("INSIDE /thead")
                    for (i = 0; i < tableHeaderCount; i++) {
                                all_text += "-------- |";
                    }
                    if(tableHeaderCount > 0){
                    all_text += "\n"
                    }
                    tableHeaderCount = 0
                    all_text += ' ' + node.textContent.trim() + ' |'; // Add a table data cell
                }
                // Handle styling for output code blocks (used in tutorials as what code returns)
                else if (['div'].includes(tag) && !node.className && getComputedStyle(node).backgroundColor === 'rgb(238, 238, 238)') {
                    all_text += '```java \n' + node.textContent.trim() + '\n```\n';
                }

                // Traverse child nodes of the current node
                Array.from(node.childNodes).forEach(traverseNodes);
            }
        }

        traverseNodes(mainContent);
        
        console.log(all_text);
    } else {
        console.log('No element with class "v-slot-main-content" found.');
    }
}
