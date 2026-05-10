import os
import glob

french_files = glob.glob('/Users/abdou/datakö-repo/datako-website/*.html')
english_files = glob.glob('/Users/abdou/datakö-repo/datako-website/en/*.html')

# Don't touch index.html and prestations.html in root as we already did them
french_files = [f for f in french_files if not f.endswith('index.html') and not f.endswith('prestations.html')]

for filepath in french_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '<li class="nav-item"><a href="formations.html" class="nav-link">Formations</a></li>' in content:
        content = content.replace(
            '<li class="nav-item"><a href="formations.html" class="nav-link">Formations</a></li>',
            '<li class="nav-item"><a href="https://diagnostic.xn--datak-nua.com/" class="nav-link">Diagnostic</a></li>\n                    <li class="nav-item"><a href="formations.html" class="nav-link">Formations</a></li>'
        )
    elif '<li class="nav-item"><a href="formations.html" class="nav-link active">Formations</a></li>' in content:
        content = content.replace(
            '<li class="nav-item"><a href="formations.html" class="nav-link active">Formations</a></li>',
            '<li class="nav-item"><a href="https://diagnostic.xn--datak-nua.com/" class="nav-link">Diagnostic</a></li>\n                    <li class="nav-item"><a href="formations.html" class="nav-link active">Formations</a></li>'
        )
    
    with open(filepath, 'w') as f:
        f.write(content)

for filepath in english_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '<li class="nav-item"><a href="formations.html" class="nav-link">Training</a></li>' in content:
        content = content.replace(
            '<li class="nav-item"><a href="formations.html" class="nav-link">Training</a></li>',
            '<li class="nav-item"><a href="https://diagnostic.xn--datak-nua.com/" class="nav-link">Diagnostic</a></li>\n                    <li class="nav-item"><a href="formations.html" class="nav-link">Training</a></li>'
        )
    elif '<li class="nav-item"><a href="formations.html" class="nav-link active">Training</a></li>' in content:
        content = content.replace(
            '<li class="nav-item"><a href="formations.html" class="nav-link active">Training</a></li>',
            '<li class="nav-item"><a href="https://diagnostic.xn--datak-nua.com/" class="nav-link">Diagnostic</a></li>\n                    <li class="nav-item"><a href="formations.html" class="nav-link active">Training</a></li>'
        )
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Done updating navbars.")
