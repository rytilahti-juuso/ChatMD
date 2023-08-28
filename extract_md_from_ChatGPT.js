// Run the below code on the console. Copies the text content on the opened
// message thread and converts it to md format (e.g. keeps code and headers in correct format).
{
    let mainContent = document.getElementsByTagName('body')[0]
    if (mainContent) {
        let all_text = '';
        
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
                else if(['pre'].includes(tag)){
                    // Replace the "Copy code"- text with empty string. Because before that is the code language name, it can be used directly as Displaying correct syntax with markdown.
                    all_text += '```' + node.textContent.trim().replace("Copy code", "\n") + '\n ```\n';
                } 
                else if(['p'].includes(tag)){
                    all_text += node.textContent.trim() + '\n';
                }
                // is user's prompt
                else if(['div'].includes(tag) && node.className === "empty:hidden"){
                    all_text += "\n___ \n # User \n" + node.textContent.trim() + "\n___ \n # ChatGPT \n";
                }
    
                
                // Traverse child nodes of the current node
                Array.from(node.childNodes).forEach(traverseNodes);
            }
        }
    
        traverseNodes(mainContent);
        
        console.log(all_text);
    } else {
        console.log('No elements were found. ChatGPT UI has probably been updated. Please update the code to parse through correct elements.');
    }
    }