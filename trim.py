import re

input_file = 'words.txt'
output_file = 'words2.txt'

pattern = re.compile(r'^[A-Za-z]+$')  # Only letters allowed

with open(input_file, 'r', encoding='utf-8') as fin, open(output_file, 'w', encoding='utf-8') as fout:
    for line in fin:
        word = line.strip()
        if pattern.match(word):
            fout.write(word + '\n')

print(f'Filtered word list saved to {output_file}')
