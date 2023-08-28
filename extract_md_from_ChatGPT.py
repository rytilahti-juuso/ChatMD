import requests
from bs4 import BeautifulSoup

def fetch_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"An error occurred while fetching the URL: {e}")
        return None

def traverse_nodes(node, all_text):
    new_line = '\n'
    if node.name:
        tag = node.name.lower()

        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            header_level = int(tag[1])
            prefix = '#' * header_level
            all_text += f"{prefix} {node.get_text(strip=False)}\n"
        
        elif tag in ['pre']:
            all_text += f"```\n{node.get_text(strip=False).replace('Copy code', new_line)}\n```\n"
        
        elif tag in ['p']:
            all_text += f"{node.get_text(strip=False)}\n"
        
        elif tag in ['div'] and 'empty:hidden' in node.get('class', []):
            all_text += f"\n___\n# User\n{node.get_text(strip=False)}\n___\n# ChatGPT\n"
        
        for child in node.children:
            all_text = traverse_nodes(child, all_text)

    return all_text


# Fetch the HTML content of the desired URL
url = "YOUR_URL_HERE"
html_string = fetch_url(url)

# If successfully fetched
if html_string:
    soup = BeautifulSoup(html_string, 'html.parser')
    main_content = soup.find('body')

    if main_content:
        all_text = ''
        all_text = traverse_nodes(main_content, all_text)
        print(all_text)
    else:
        print("No elements were found. ChatGPT UI has probably been updated. Please update the code to parse through correct elements.")
else:
    print("Failed to fetch the URL.")