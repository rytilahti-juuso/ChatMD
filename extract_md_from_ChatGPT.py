import requests
from bs4 import BeautifulSoup

# Function to write the scraped content to a file
def write_to_file(file_path, content):
    try:
        with open(file_path, 'w') as file:
            file.write(content)
        print("Successfully wrote to the file.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Function to fetch the HTML content of a URL
def fetch_url(url):
    try:
        # Send a GET request to the URL
        response = requests.get(url)
        # Raise an exception if the request was unsuccessful
        response.raise_for_status()
        # Return the HTML content as text
        return response.text
    except requests.RequestException as e:
        print(f"An error occurred while fetching the URL: {e}")
        return None

# Function to traverse the HTML nodes and convert them to Markdown text
def traverse_nodes(node, all_text):
    new_line = '\n'
    # Check if the node is an HTML tag
    if node.name:
        tag = node.name.lower()

        # Keep the header's ChatGPT presented to user
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            header_level = int(tag[1])
            prefix = '#' * header_level
            all_text += f"{prefix} {node.get_text(strip=False)}\n"
        
        # Display the code blocks as code. Removing "Copy code" 
        # ensures that syntax that the code snippet has is always 
        # to correct language.
        elif tag in ['pre']:
            all_text += f"```{node.get_text(strip=False).replace('Copy code', new_line)}\n```\n"
        
        # If it's a paragraph, simply add its text
        elif tag in ['p']:
            all_text += f"{node.get_text(strip=False)}\n\n"

        # User text is always with set with with class "empty:hidden"
        elif tag in ['div'] and 'empty:hidden' in node.get('class', []):
            all_text += f"\n___\n# User\n{node.get_text(strip=False)}\n___\n# ChatGPT\n"

        # Recursively traverse the children of the node
        for child in node.children:
            all_text = traverse_nodes(child, all_text)

    return all_text


# Fetch the HTML content of the desired URL
url = "YOUR_URL_HERE"
html_string = fetch_url(url)


if html_string:
    # Parse the HTML content with BeautifulSoup
    soup = BeautifulSoup(html_string, 'html.parser')
    # Find the main content of the page (here it is assumed to be within the 'body' tag)
    main_content = soup.find('body')

    if main_content:
        # Initialize an empty string to store the Markdown text
        all_text = ''
        # Traverse the HTML nodes and convert them to Markdown
        all_text = traverse_nodes(main_content, all_text)
        # Write the Markdown text to a file
        write_to_file("./output.md", all_text)
        print("  ")
        print(" Below is the MD output printed to console! ")
        print("  ")
        print(all_text)
    else:
        print("No elements were found. ChatGPT UI has probably been updated. Please update the code to parse through correct elements.")
else:
    print("Failed to fetch the URL.")